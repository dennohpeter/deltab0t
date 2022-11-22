import { Router } from 'express'
import { check } from 'express-validator'

import { createConfig, fetchBalance } from '../../controller'
import { validateRequest, validateToken } from '../../middleware'

const router = Router()

/**
 * @openapi
 * /api/v1/account/balances:
 *  get:
 *    summary: Fetch account balances
 *    tags:
 *        - Account
 *    description: Fetch account balances
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *
 *
 *    responses:
 *     200:
 *      description: Account balances fetched successfully
 *
 */
router.get('/balances', validateToken, fetchBalance)

/**
 * @openapi
 * /api/v1/account/config/new:
 *  post:
 *    summary: Create a new configuration
 *    tags:
 *        - Account
 *    description: Create a new configuration
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    parameters:
 *      - name: apiKey
 *        description: Subaccount API key
 *      - name: secret
 *        description: Subaccount secret
 *      - name: exchangeId
 *        description: Exchange ID
 *
 *    responses:
 *      200:
 *        description: Config created successfully
 *      400:
 *        description: Bad request
 */
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
