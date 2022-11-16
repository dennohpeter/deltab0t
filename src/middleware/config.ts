import express, { Express } from 'express'
import expressRateLimit from 'express-rate-limit'
import cors from 'cors'
const xss = require('xss-clean')

import { logger } from './logger'

export const configureMiddleware = (app: Express) => {
  // Body parser middleware
  app.use(express.json())

  // Form parser middleware
  app.use(express.urlencoded({ extended: true }))

  // Prevent XSS attacks
  app.use(xss())

  // Logger middleware
  app.use(logger)

  // Add rate limit to API (100 requests per 10 minutes)
  app.use(
    expressRateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  )

  // Enable CORS
  app.use(cors())
}
