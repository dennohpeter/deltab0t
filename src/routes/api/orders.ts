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

router.post(
  '/positions',
  validateToken,
  [check('configId', 'Config id is required').not().isEmpty().isString()],
  validateRequest,
  fetchPositions,
)

module.exports = router
