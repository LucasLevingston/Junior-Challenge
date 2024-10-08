import fastifyCors from '@fastify/cors'
import { userRoutes } from './routes/userRoutes'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { app } from './app'
import { ringRoutes } from './routes/ringRoutes'
import { env } from 'process'
import sequelize from './models'
import { errorHandler } from './routes/error-handler'

const port = env.PORT || 3000

app.register(fastifyCors, {
  origin: '*',
})

app.register(fastifySwagger, {
  swagger: {
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    info: {
      title: 'Anéis de Poder API',
      description: 'Especificações da API para o sistema Anéis de Poder.',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})
app.setErrorHandler(errorHandler)

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(userRoutes)
app.register(ringRoutes, { prefix: '/rings' })

app.listen({ host: '0.0.0.0', port: Number(port) }, async (error: any) => {
  if (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }

  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (error) {
    console.error('SEQUELIZE DB CONNECTION ERROR:', error)
  }

  console.log(`Server listening at ${port}`)
})
