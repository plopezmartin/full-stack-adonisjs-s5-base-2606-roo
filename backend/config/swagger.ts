import { options as SwaggerOptions } from 'adonis-autoswagger/dist/types.js'

const swaggerConfig: SwaggerOptions = {
  path: './', // raíz del proyecto
  title: 'FlowSync API',
  version: '1.0.0',
  description: 'API de gestión de tareas FlowSync — AdonisJS 7',
  tagIndex: 2,       // nivel de ruta para agrupar tags: /api/v1/[tags]/...
  snakeCase: true,   // convierte camelCase a snake_case en los schemas

  ignore: ['/swagger', '/docs', '/openapi'],  // rutas que no se documentan
  preferredPutPatch: 'PUT',

  common: {
    parameters: {},
    headers: {},
  },

  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      description: 'Token opaco AdonisJS: oat_xxxxxxxxxxxx'
    }
  },
  defaultSecurityScheme: 'bearerAuth',
  persistAuthorization: true,
}

export default swaggerConfig
