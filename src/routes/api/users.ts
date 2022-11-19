import { Router } from 'express'
import { check } from 'express-validator'
import { ExchangeId } from 'ccxt'

import {
  createConfig,
  createNewUser,
  getCurrentUser,
  login,
} from '../../controller'
import { validateRequest, validateToken } from '../../middleware'

const router = Router()

router.get('/', validateToken, getCurrentUser)

router.post(
  '/new',
  [
    check('username', 'Username is required').not().isEmpty().isString(),
    check('phoneNumber', 'Phone number is required')
      .not()
      .isEmpty()
      .isMobilePhone('en-KE', { strictMode: true })
      .withMessage('Invalid phone number'),
  ],
  validateRequest,
  createNewUser,
)

router.post(
  '/login',
  [
    check('phoneNumber', 'Phone number is required')
      .not()
      .isEmpty()
      .isMobilePhone('en-KE', { strictMode: true })
      .withMessage('Invalid phone number'),
  ],
  login,
)

router.post(
  '/config/new',
  validateToken,
  [
    check('apiKey', 'API key is required').not().isEmpty().isString(),
    check('secret', 'API secret is required').not().isEmpty().isString(),
    check('exchangeId', 'Exchange ID is required')
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
