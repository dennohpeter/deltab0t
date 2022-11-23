import { Router } from 'express'

import { fetchBalance } from '../../controller'
import { validateToken } from '../../middleware'

const router = Router()

/**
 * @openapi
 * /api/account/balances:
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

module.exports = router
