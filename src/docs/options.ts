import swaggerJSDoc from 'swagger-jsdoc'

export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    info: {
      title: 'Delta Bot API',
      version: '0.1.0',
      description: 'Delta Bot API',
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
      },
      contact: {
        name: 'Dennoh Peter',
        url: 'https://dennohpeter.com',
        email: 'mail@dennohpeter.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server',
      },
    ],
  },
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Delta Bot API',
      version: '0.1.0',
      description: 'Delta Bot API',
    },
    schemes: ['http', 'https'],
  },
  apis: [`${__dirname}/../routes/**/*.ts`],
}
