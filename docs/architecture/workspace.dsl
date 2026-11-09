workspace "Full-stack AdonisJS Starter Kit" "Starter kit full-stack con autenticación por access tokens (AI4Devs)." {

    !identifiers hierarchical

    model {
        user = person "Usuario" "Persona que se registra, inicia sesión y consulta el dashboard."

        system = softwareSystem "Starter Kit Full-stack" "Registro, login por access tokens y consulta de usuarios." {

            spa = container "Frontend SPA" "Login, registro y dashboard protegido. Guarda el token en localStorage." "React 19, TypeScript, Vite, React Router, Tailwind v4, shadcn/ui" "Web Browser"

            api = container "Backend API" "API JSON REST bajo /api/v1. Autenticación Bearer (guard api)." "AdonisJS 7, TypeScript" {
                routes = component "Routes" "Solo cablea rutas /api/v1 y aplica middleware.auth() a las protegidas." "start/routes.ts"
                httpMw = component "HTTP Middleware" "ForceJsonResponse, CORS, BodyParser, InitializeAuth, ContainerBindings." "app/middleware, start/kernel.ts"
                authMw = component "Auth Middleware" "Valida Authorization: Bearer <token> con el guard api." "app/middleware/auth_middleware.ts"
                healthCtl = component "HealthController" "GET /health (liveness)." "Controller"
                newAccountsCtl = component "NewAccountsController" "POST /account/register." "Controller"
                accessTokensCtl = component "AccessTokensController" "POST /account/login y /account/logout." "Controller"
                profilesCtl = component "ProfilesController" "GET /account/profile." "Controller"
                usersCtl = component "UsersController" "GET /users y /users/:id." "Controller"
                validators = component "Validators" "signupValidator y loginValidator." "VineJS, app/validators/auth.ts"
                transformer = component "UserTransformer" "Único contrato de salida del usuario (excluye password)." "app/transformers"
                userModel = component "User model" "Entidad User + AuthFinder (scrypt) + DbAccessTokensProvider (30 días, prefijo oat_)." "Lucid ORM"
            }

            db = container "Base de datos" "Tablas users y auth_access_tokens (ver ADR SQLite)." "SQLite (better-sqlite3), backend/tmp/db.sqlite3" "Database"
        }

        user -> system.spa "Usa" "HTTPS (navegador)"
        system.spa -> system.api "Llama a la API" "JSON/HTTP, Authorization: Bearer"
        system.api -> system.db "Lee y escribe" "Lucid / SQL"

        # Nivel 3: componentes del backend
        system.spa -> system.api.routes "Peticiones /api/v1" "JSON/HTTP"
        system.api.routes -> system.api.httpMw "Atraviesa"
        system.api.routes -> system.api.authMw "Rutas protegidas"
        system.api.authMw -> system.api.userModel "Resuelve usuario por token"
        system.api.routes -> system.api.healthCtl "Delega"
        system.api.routes -> system.api.newAccountsCtl "Delega"
        system.api.routes -> system.api.accessTokensCtl "Delega"
        system.api.routes -> system.api.profilesCtl "Delega"
        system.api.routes -> system.api.usersCtl "Delega"
        system.api.newAccountsCtl -> system.api.validators "Valida input"
        system.api.accessTokensCtl -> system.api.validators "Valida input"
        system.api.newAccountsCtl -> system.api.userModel "Crea usuario y token"
        system.api.accessTokensCtl -> system.api.userModel "Verifica credenciales, emite/revoca token"
        system.api.profilesCtl -> system.api.transformer "Serializa"
        system.api.usersCtl -> system.api.userModel "Consulta"
        system.api.usersCtl -> system.api.transformer "Serializa"
        system.api.newAccountsCtl -> system.api.transformer "Serializa"
        system.api.accessTokensCtl -> system.api.transformer "Serializa"
        system.api.userModel -> system.db "Lee y escribe" "Lucid / SQL"
    }

    views {
        systemContext system "Context" "C4 nivel 1: contexto del sistema." {
            include *
            autolayout lr
        }

        container system "Containers" "C4 nivel 2: contenedores." {
            include *
            autolayout lr
        }

        component system.api "Components" "C4 nivel 3: componentes del Backend API." {
            include *
            exclude system.spa
            autolayout tb
        }

        styles {
            element "Person" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "Component" {
                background #85bbf0
                color #000000
            }
            element "Database" {
                shape Cylinder
            }
            element "Web Browser" {
                shape WebBrowser
            }
        }
    }
}
