import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

import AutoSwagger from 'adonis-autoswagger'
import swaggerConfig from '#config/swagger'

const NewAccountsController = () => import('#controllers/new_accounts_controller')
const AccessTokensController = () => import('#controllers/access_tokens_controller')
const ProfilesController = () => import('#controllers/profiles_controller')
const HealthController = () => import('#controllers/health_controller')
const UsersController = () => import('#controllers/users_controller')

router.get('/', async () => {
  return { app: 'full-stack-adonisjs-master', status: 'running' }
})

/*
|--------------------------------------------------------------------------
| API v1
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    // Health (creado en S2 vía OpenSpec)
    router.get('/health', [HealthController, 'index'])

    // Cuenta / autenticación
    router.post('/account/register', [NewAccountsController, 'store'])
    router.post('/account/login', [AccessTokensController, 'store'])

    // Rutas protegidas (requieren Bearer token)
    router
      .group(() => {
        router.post('/account/logout', [AccessTokensController, 'destroy'])
        router.get('/account/profile', [ProfilesController, 'show'])

        router.get('/users', [UsersController, 'index'])
        router.get('/users/:id', [UsersController, 'show'])
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')

// Spec OpenAPI 3.0 en JSON
router.get('/openapi', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swaggerConfig)
})

// UI de documentación con Swagger UI (para comparar con Scalar)
router.get('/swagger', async () => {
  return AutoSwagger.default.ui('/openapi', swaggerConfig)
})

// UI de documentación (Scalar por defecto)
router.get('/docs', async () => {
  // Sin proxy de terceros: las peticiones "Test Request" van directas a esta API.
  // La librería inyecta data-proxy-url (proxy.scalar.com) por defecto; lo eliminamos.
  return AutoSwagger.default.scalar('/openapi').replace(/\s*data-proxy-url="[^"]*"/, '')
})
