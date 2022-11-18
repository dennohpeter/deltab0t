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

module.exports = router
