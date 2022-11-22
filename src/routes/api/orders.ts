import { Router } from 'express'
import { check } from 'express-validator'
import {
  cancelOrder,
  fetchOpenOrders,
  fetchPositions,
  placeNewOrder,
} from '../../controller'
import { validateRequest, validateToken } from '../../middleware'

const router = Router()

/**
 * @openapi
 * /api/v1/orders/new:
 *  post:
 *    summary: Create new order
 *    tags:
 *        - Orders
 *    description: Creates a new order in the specifiend or default subaccount
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    parameters:
 *      - name: token
 *        description: authorization token
 *      - name: orders
 *        description: A list of orders to place on the exchange
 *
 *    responses:
 *      200:
 *          description: Order placed successully
 *
 *      400:
 *          description: Bad Request
 *
 */
router.post(
  '/new',
  [
    check('token', 'Token is required').not().isEmpty().isString(),
    check('orders.*.side', 'Side is required')
      .not()
      .isEmpty()
      .isIn(['buy', 'sell']),
    check('orders.*.symbol', 'Symbol is required').not().isEmpty().isString(),
    check('orders.*.type', 'Type is required')
      .not()
      .isEmpty()
      .isIn(['limit', 'market']),
    check('orders.*.size', 'Size is required').not().isEmpty().isFloat(),
    check('orders.*.price', 'Price is required').not().isEmpty().isFloat(),
  ],
  validateRequest,
  placeNewOrder,
)

/**
 * @openapi
 * /api/v1/orders/cancel:
 *  post:
 *    summary: Cancel order by id
 *    tags:
 *        - Orders
 *    description: Cancel order by id
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    parameters:
 *      - name: orderId
 *        description: Id of the order to cancel
 *      - name: symbol
 *        description: Symbol
 *      - name: configId
 *        description: Id of the configuration to use
 *
 *    responses:
 *      200:
 *        description: Order cancelled succesfully
 *      400:
 *        description: Bad Request
 */
router.post(
  '/cancel',
  validateToken,
  [
    check('orderId', 'Order id is required').not().isEmpty().isString(),
    check('symbol', 'Symbol is required').not().isEmpty().isString(),
    check('configId', 'Config id is required').not().isEmpty().isString(),
  ],
  validateRequest,
  cancelOrder,
)

router.post(
  '/open',
  validateToken,
  [
    check('symbol', 'Symbol is required').not().isEmpty().isString(),
    check('configId', 'Config id is required').not().isEmpty().isString(),
  ],

  validateRequest,
  fetchOpenOrders,
)

/**
 * @openapi
 * /api/v1/orders/positions:
 *  post:
 *    summary: Fetch orders in position
 *    tags:
 *        - Orders
 *    description: Fetch order from exchange that have been filled
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    parameters:
 *      - name: configId
 *        description: Id of the configuration to use to get orders
 *
 *    responses:
 *      200:
 *        description: Orders in position
 *      400:
 *        description: Bad Request
 *
 */
router.post(
  '/positions',
  validateToken,
  [check('configId', 'Config id is required').not().isEmpty().isString()],
  validateRequest,
  fetchPositions,
)

module.exports = router
