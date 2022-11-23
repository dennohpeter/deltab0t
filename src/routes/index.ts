import { Application } from 'express'

export const configureRoutes = (app: Application) => {
  app.use('/api/account', require('./api/account'))
  app.use('/api/config', require('./api/config'))
  app.use('/api/users', require('./api/users'))
  app.use('/api/orders', require('./api/orders'))

  app.use('/', (_req, res) => {
    res.status(200).send(`OK ${process.pid}`)
  })
}
