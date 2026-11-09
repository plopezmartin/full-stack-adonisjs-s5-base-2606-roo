# Arquitectura C4

Documentación del modelo C4 del starter kit. Fuente de verdad: [`workspace.dsl`](workspace.dsl) (Structurizr DSL). Este documento replica los diagramas en Mermaid para verlos directamente en GitHub.

Renderizar el DSL con Structurizr Lite:

```bash
docker run -it --rm -p 8080:8080 -v "$PWD/docs/architecture:/usr/local/structurizr" structurizr/lite
```

## Nivel 1 — Contexto

```mermaid
C4Context
    title Contexto del sistema
    Person(user, "Usuario", "Se registra, inicia sesión y consulta el dashboard")
    System(sys, "Starter Kit Full-stack", "Registro, login por access tokens y consulta de usuarios")
    Rel(user, sys, "Usa", "HTTPS")
```

No hay sistemas externos: ni email, ni OAuth, ni servicios de terceros.

## Nivel 2 — Contenedores

```mermaid
C4Container
    title Contenedores
    Person(user, "Usuario")
    System_Boundary(sys, "Starter Kit Full-stack") {
        Container(spa, "Frontend SPA", "React 19, Vite, React Router, Tailwind v4, shadcn/ui", "Login, signup y dashboard protegido. Token en localStorage")
        Container(api, "Backend API", "AdonisJS 7, TypeScript", "REST JSON en /api/v1, auth Bearer (guard api)")
        ContainerDb(db, "Base de datos", "SQLite (better-sqlite3)", "users, auth_access_tokens")
    }
    Rel(user, spa, "Usa", "HTTPS")
    Rel(spa, api, "Llama", "JSON/HTTP + Bearer")
    Rel(api, db, "Lee/escribe", "Lucid")
```

| Contenedor | Tecnología | Puerto | Config |
|---|---|---|---|
| Frontend SPA | React 19 + Vite | 5173 | `VITE_API_URL` (por defecto `http://localhost:3333/api/v1`) |
| Backend API | AdonisJS 7 | 3333 | `backend/.env` (`PORT`, `HOST`, `APP_KEY`) |
| Base de datos | SQLite | fichero | `backend/tmp/db.sqlite3` (no se commitea) |

Decisión relacionada: [ADR SQLite en lugar de PostgreSQL](../adr/20261108-uso-de-sqlite-en-lugar-de-postgresql.md), [ADR VineJS en lugar de Zod](../adr/20261108-uso-de-vinejs-en-lugar-de-zod.md).

## Nivel 3 — Componentes del Backend API

```mermaid
C4Component
    title Componentes del Backend API
    Container(spa, "Frontend SPA", "React")
    ContainerDb(db, "SQLite", "better-sqlite3")
    Container_Boundary(api, "Backend API (AdonisJS 7)") {
        Component(mw, "HTTP Middleware", "kernel.ts", "ForceJson, CORS, BodyParser, InitializeAuth")
        Component(routes, "Routes", "start/routes.ts", "Cablea /api/v1; aplica middleware.auth()")
        Component(authmw, "Auth Middleware", "auth_middleware.ts", "Valida Bearer token")
        Component(health, "HealthController", "Controller", "GET /health")
        Component(newacc, "NewAccountsController", "Controller", "POST /account/register")
        Component(tokens, "AccessTokensController", "Controller", "POST /account/login, /logout")
        Component(profile, "ProfilesController", "Controller", "GET /account/profile")
        Component(users, "UsersController", "Controller", "GET /users, /users/:id")
        Component(val, "Validators", "VineJS", "signup / login")
        Component(tr, "UserTransformer", "Transformer", "Contrato de salida del User")
        Component(model, "User model", "Lucid", "AuthFinder (scrypt) + DbAccessTokensProvider")
    }
    Rel(spa, mw, "HTTP /api/v1")
    Rel(mw, routes, "")
    Rel(routes, authmw, "Rutas protegidas")
    Rel(authmw, model, "Resuelve token")
    Rel(routes, health, "")
    Rel(routes, newacc, "")
    Rel(routes, tokens, "")
    Rel(routes, profile, "")
    Rel(routes, users, "")
    Rel(newacc, val, "Valida")
    Rel(tokens, val, "Valida")
    Rel(newacc, model, "Crea user + token")
    Rel(tokens, model, "Verifica credenciales / emite / revoca")
    Rel(users, model, "Consulta")
    Rel(profile, tr, "Serializa")
    Rel(users, tr, "Serializa")
    Rel(newacc, tr, "Serializa")
    Rel(tokens, tr, "Serializa")
    Rel(model, db, "SQL")
```

### Endpoints

| Método | Ruta (`/api/v1`) | Auth | Controller |
|---|---|---|---|
| GET | `/health` | No | HealthController#index |
| POST | `/account/register` | No | NewAccountsController#store |
| POST | `/account/login` | No | AccessTokensController#store |
| POST | `/account/logout` | Bearer | AccessTokensController#destroy |
| GET | `/account/profile` | Bearer | ProfilesController#show |
| GET | `/users` | Bearer | UsersController#index |
| GET | `/users/:id` | Bearer | UsersController#show |

## Nivel 3 — Componentes del Frontend (resumen)

| Componente | Archivo | Responsabilidad |
|---|---|---|
| `App` | `src/App.tsx` | Rutas: `/`→`/dashboard`, `/login`, `/signup`, `/dashboard` |
| `ProtectedRoute` | `src/components/ProtectedRoute.tsx` | Redirige a `/login` si no hay token |
| `LoginPage`, `SignupPage`, `DashboardPage` | `src/pages/` | Páginas |
| `LoginForm`, `SignupForm` | `src/components/` | Formularios |
| `authService` | `src/services/authService.ts` | `fetch` a la API, persistencia de token/usuario en `localStorage` |
| `ui/*` | `src/components/ui/` | Primitivas shadcn/ui |

## Modelo de datos

```mermaid
erDiagram
    users ||--o{ auth_access_tokens : "tokenable_id (ON DELETE CASCADE)"
    users {
        int id PK
        string full_name
        string email UK
        string password
        timestamp last_seen_at
        timestamp created_at
        timestamp updated_at
    }
    auth_access_tokens {
        int id PK
        int tokenable_id FK
        string type
        string name
        string hash
        text abilities
        timestamp expires_at
        timestamp last_used_at
    }
```

## Flujo clave: login

```mermaid
sequenceDiagram
    actor U as Usuario
    participant S as SPA
    participant A as AccessTokensController
    participant M as User model
    participant D as SQLite
    U->>S: email + password
    S->>A: POST /api/v1/account/login
    A->>A: loginValidator
    A->>M: verifyCredentials (scrypt)
    M->>D: SELECT users
    A->>D: UPDATE last_seen_at
    A->>M: accessTokens.create
    M->>D: INSERT auth_access_tokens (hash)
    A-->>S: { user, token }
    S->>S: localStorage (auth_token, auth_user)
```

## Observaciones de arquitectura

- Token con caducidad de 30 días, almacenado hasheado en BD; el SPA lo guarda en `localStorage` (expuesto a XSS).
- CORS abierto (`origin: true`, `credentials: true`): conviene restringirlo fuera de desarrollo.
- `ProtectedRoute` solo comprueba la existencia del token en cliente; la validez real la decide el backend (401).
- `AuthMiddleware.redirectTo = '/login'` no aplica a una API JSON; el cliente recibe 401.
- Pendiente según el código: `GET /users/active` (Sesión 3).
