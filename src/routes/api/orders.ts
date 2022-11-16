import { Router } from 'express'
import { check } from 'express-validator'
import { placeNewOrder } from '../../controller'

const router = Router()

router.post(
  '/new',
  [
    check('token', 'token is required').not().isEmpty().isString(),
    check('orders.*.side', 'side is required')
      .not()
      .isEmpty()
      .isIn(['buy', 'sell']),
    check('orders.*.symbol', 'symbol is required').not().isEmpty().isString(),
    check('orders.*.type', 'type is required')
      .not()
      .isEmpty()
      .isIn(['limit', 'market']),
    check('orders.*.size', 'size is required').not().isEmpty().isFloat(),
    check('orders.*.price', 'price is required').not().isEmpty().isFloat(),
  ],
  placeNewOrder,
)

module.exports = router
