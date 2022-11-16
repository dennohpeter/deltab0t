import { Application } from 'express'

export const configureRoutes = (app: Application) => {
  //   app.use('/tradingbot/api/auth', require('./api/auth'))
  app.use('/api/v1/users', require('./api/users'))
  app.use('/api/v1/orders', require('./api/orders'))

  app.use('/', (_req, res) => {
    res.status(200).send(`OK ${process.pid}`)
  })
}
