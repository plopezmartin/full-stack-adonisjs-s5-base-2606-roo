# full-stack-adonisjs-master

Starter kit full-stack con autenticación por **access tokens**. Repo hilo conductor
del máster **AI4Devs** (LIDR). Monorepo con backend y frontend independientes.

```
full-stack-adonisjs-master/
├── backend/      AdonisJS 7 + Lucid + SQLite + VineJS + @adonisjs/auth
├── frontend/     React 19 + Vite + React Router + Tailwind v4 + shadcn/ui
├── openspec/     Configuración de OpenSpec (flujo /opsx:*)
├── docs/         Documentación del producto (PRD.md, ADRs, diagramas)
├── CLAUDE.md     Memoria de proyecto para copilotos de IA
└── README.md
```

## Requisitos

- **Node.js 24** o superior (AdonisJS 7 lo requiere). Comprueba con `node -v`.
- npm 10+.

## Arranque rápido

### 1. Backend (`http://localhost:3333`)

```bash
cd backend
npm install
cp .env.example .env
node ace generate:key      # rellena APP_KEY en .env
npm run migration:run      # crea las tablas users + auth_access_tokens
npm run dev                # servidor con HMR
```

### 2. Frontend (`http://localhost:5173`)

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL ya apunta al backend
npm run dev
```

Abre `http://localhost:5173`, regístrate, entra al dashboard y cierra sesión.

## Endpoints del backend

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/health` | — | Liveness (`{ status: 'ok' }`) |
| POST | `/api/v1/account/register` | — | Registro → `{ user, token }` |
| POST | `/api/v1/account/login` | — | Login → `{ user, token }` |
| POST | `/api/v1/account/logout` | Bearer | Revoca el token actual |
| GET | `/api/v1/account/profile` | Bearer | Usuario autenticado |
| GET | `/api/v1/users` | Bearer | Lista de usuarios |
| GET | `/api/v1/users/:id` | Bearer | Usuario por id |

> El endpoint `GET /api/v1/users/active` se implementa en vivo en la Sesión 3.

## Arquitectura

Modelos Lucid, sus relaciones y los grupos de endpoints REST del backend (`/api/v1`).

```mermaid
graph LR
    subgraph Public["Públicos (sin auth)"]
        H["Health<br/>GET /health"]
        A["Account<br/>POST /account/register<br/>POST /account/login"]
    end

    subgraph Protected["Protegidos · middleware.auth() (Bearer)"]
        AP["Account<br/>POST /account/logout<br/>GET /account/profile"]
        U["Users<br/>GET /users<br/>GET /users/:id"]
    end

    subgraph Controllers["Controllers"]
        HC[HealthController]
        NAC[NewAccountsController]
        ATC[AccessTokensController]
        PC[ProfilesController]
        UC[UsersController]
    end

    subgraph Models["Modelos Lucid"]
        User["User<br/>id · fullName · email<br/>password · lastSeenAt<br/>createdAt · updatedAt"]
        Token[("auth_access_tokens<br/>DbAccessTokensProvider")]
    end

    H --> HC
    A -->|register| NAC
    A -->|login| ATC
    AP -->|logout| ATC
    AP -->|profile| PC
    U --> UC

    NAC -->|crea| User
    ATC -->|emite / revoca| Token
    PC -->|lee| User
    UC -->|lee| User
    User -->|"1 : N (accessTokens)"| Token
```

## Workflow con OpenSpec

Flujo spec-driven con Claude Code o Cursor:

```
/opsx:propose "añadir endpoint X"   # genera proposal + specs + tasks
/opsx:apply                          # implementa según las tasks
/opsx:archive                        # archiva el cambio aplicado
```

La configuración vive en `openspec/config.yaml`. Los comandos y skills se
instalaron en `.claude/` y `.cursor/`.

