import { Router } from 'express'
import { check } from 'express-validator'

import { createConfig, fetchBalance } from '../../controller'
import { validateRequest, validateToken } from '../../middleware'

const router = Router()

router.post('/balances', validateToken, fetchBalance)

router.post(
  '/config/new',
  validateToken,
  [
    check('apiKey', 'API key is required').not().isEmpty().isString(),
    check('secret', 'API secret is required').not().isEmpty().isString(),
    check('exchangeId', 'Exchange Id is required')
      .not()
      .isEmpty()
      .isString()
      .custom((_value: string) => {
        //TODO: compare if value of type is in ExchangeId type

        return true
      }),
  ],
  validateRequest,
  createConfig,
)

module.exports = router
