import { Router } from 'express'
import { check } from 'express-validator'
import { placeNewOrder } from '../../controller'
import { validateRequest } from '../../middleware'

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
    check('orders.*.type', 'type is required')
      .not()
      .isEmpty()
      .isIn(['limit', 'market']),
    check('orders.*.size', 'size is required').not().isEmpty().isFloat(),
    check('orders.*.price', 'price is required').not().isEmpty().isFloat(),
  ],
  validateRequest,
  placeNewOrder,
)

module.exports = router
