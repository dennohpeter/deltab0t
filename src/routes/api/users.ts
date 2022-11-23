import { Router } from 'express'
import { check } from 'express-validator'

import { createNewUser, getCurrentUser, login } from '../../controller'
import { validateRequest, validateToken } from '../../middleware'

const router = Router()

router.get('/', validateToken, getCurrentUser)

/**
 * @openapi
 * /api/users/new:
 *  post:
 *    summary: Create a new user
 *    tags:
 *        - Auth
 *    description: Create a new user
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    parameters:
 *      - name: username
 *        description: Username
 *      - name: phoneNumber
 *        description: Phone number
 *
 *    responses:
 *      200:
 *        description: User created successfully
 *      400:
 *       description: Username is required
 *      500:
 *       description: Internal server error
 */
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

/**
 * @openapi
 * /api/users/login:
 *  post:
 *    summary: Login a user
 *    tags:
 *      - Auth
 *    description: Login a user
 *    produces:
 *      - application/json
 *    consumes:
 *      - application/json
 *    parameters:
 *      - name: phoneNumber
 *        description: Phone number
 *    responses:
 *      200:
 *        description: User logged in successfully
 *      400:
 *        description: Phone number is required
 *      404:
 *        description: User not found
 *      500:
 *       description: Internal server error
 */
router.post(
  '/login',
  [
    check('phoneNumber', 'Phone number is required')
      .not()
      .isEmpty()
      .isMobilePhone('en-KE', { strictMode: true })
      .withMessage('Invalid phone number'),
  ],
  validateRequest,
  login,
)

module.exports = router
