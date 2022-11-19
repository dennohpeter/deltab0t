import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { Ccxt } from '../ccxt'
import { ExchangeId } from 'ccxt'
import { parseError } from '../helpers'

const prisma = new PrismaClient()

export const fetchBalance = async (req: Request, res: Response) => {
  try {
    let user = await prisma.user.findFirst({
      where: {
        id: req.user?.id,
      },

      include: {
        configs: true,
      },
    })

    if (!user) {
      return res.status(400).json({ msg: 'User not found', success: false })
    }

    if (!user.configs) {
      return res.status(400).json({ msg: 'Config not found', success: false })
    }

    let balances = []

    for (let i = 0; i < user.configs.length; i++) {
      let config = user.configs[i]

      let { apiKey, secret, exchangeId } = config

      let ccxt = new Ccxt(
        exchangeId.toLowerCase() as ExchangeId,
        apiKey,
        secret,
        config?.subAccountName || '',
      )

      let _balances = await ccxt.fetchBalance()

      balances.push({
        balances: Object.entries(_balances)
          .filter(([_, val]) => val?.free > 0 || val?.total > 0)
          .map(([key, val]) => ({ [key]: val })),
        id: config.id,
      })
    }

    return res.status(200).json({
      success: true,

      data: balances,
    })
  } catch (error: any) {
    let msg = parseError(error)

    msg = `Failed to fetch balance. ${msg}`

    return res.status(400).json({ msg, success: false })
  }
}
