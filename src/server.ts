import express from 'express'
import { createServer } from 'http'
import { cpus } from 'os'
import cluster from 'cluster'
import { configureMiddleware } from './middleware'
import { configureRoutes } from './routes'
import swaggerJSDoc from 'swagger-jsdoc'
import { serve, setup } from 'swagger-ui-express'
import { swaggerOptions } from './docs'

const app = express()

// Configure api docs
app.use(
  '/docs',
  serve,
  setup(swaggerJSDoc(swaggerOptions), {
    explorer: true,
    customSiteTitle: 'Delta Bot API',
  }),
)

// Config Express middleware
configureMiddleware(app)

// Set-up routes
configureRoutes(app)

let httpServer = createServer(app)

// Get num of CPUs
const numCPUs = cpus().length

if (cluster.isPrimary) {
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    // create a new worker process
    cluster.fork()
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`)
    // fork a new worker process
    cluster.fork()
  })
} else {
  httpServer.listen(5000, () => {
    console.log(
      '🚀 Server ready at: http://localhost:5000',
      'PID',
      process.pid,
      '\n',
    )
  })
}
