import { Router } from 'express'
import { check } from 'express-validator'
import { createNewUser } from '../../controller'

const router = Router()

router.post(
  '/new',
  [
    check('username', 'username is required').not().isEmpty().isString(),
    check('phoneNumber', 'phoneNumber is required')
      .not()
      .isEmpty()
      .isMobilePhone('en-KE', { strictMode: true }),
  ],
  createNewUser,
)

module.exports = router
