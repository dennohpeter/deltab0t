import { Router } from 'express'
import { check } from 'express-validator'

import { createNewUser, getCurrentUser, login } from '../../controller'
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

module.exports = router
