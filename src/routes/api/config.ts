import { Router } from 'express'
import { check } from 'express-validator'

import { createConfig, fetchBalance, removeConfig } from '../../controller'
import { validateRequest, validateToken } from '../../middleware'

const router = Router()

/**
 * @openapi
 * /api/config/new:
 *  post:
 *    summary: Create a new configuration
 *    tags:
 *        - Config
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
  '/new',
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

/**
 * @openapi
 * /api/config/remove:
 *  delete:
 *    summary: Remove a configuration by id
 *    tags:
 *      - Config
 *    description: Remove a configuration by id
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    parameters:
 *      - name: id
 *        description: Configuration ID
 *
 *    responses:
 *      200:
 *       description: Config removed successfully
 *      400:
 *       description: Bad request
 */
router.delete(
  '/remove',
  validateToken,
  [check('configId', 'Config ID is required').not().isEmpty().isString()],
  validateRequest,
  removeConfig,
)

module.exports = router
