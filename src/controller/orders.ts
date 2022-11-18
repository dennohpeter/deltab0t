import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { ExchangeId } from 'ccxt'

import { OrderReq } from '../types'
import { parseError } from '../helpers'
import { Ccxt } from '../ccxt'

export const placeNewOrder = async (req: Request, res: Response) => {
  let {
    token,
    orders: payload,
    subAccountName,
  }: {
    token: string
    orders: string
    subAccountName?: string
  } = req.body

  let orders: OrderReq[] = eval(payload)

  try {
    let prisma = new PrismaClient()

    console.log({ orders })
    let user = await prisma.user.findFirst({
      where: {
        token,
      },
      include: {
        configs: true,
      },
    })

    if (!user) {
      return res.status(400).json({ msg: 'Invalid token', success: false })
    }

    // let config = await prisma.config.findUnique({
    //   where: {
    //     userId: user.id,
    //   },
    // })
    // use default config
    let config =
      user.configs.find(
        (c) =>
          c.subAccountName?.toLowerCase() === subAccountName?.toLowerCase(),
      ) || user.configs[0]

    if (!config) {
      return res.status(400).json({ msg: 'No config found', success: false })
    }

    let { apiKey, secret, exchangeId } = config

    let ccxt = new Ccxt(
      exchangeId.toLowerCase() as ExchangeId,
      apiKey,
      secret,
      config?.subAccountName || '',
    )

    // get existing positions
    let positions = await ccxt.fetchPositions()

    console.log({ positions })

    // prepare orders
    let _orders: OrderReq[] = []

    orders.forEach((order) => {
      let { side, market, type, size, price, chase, close } = order

      if (close) {
        // if close is true, then we need to find the position and close it
        let position = positions.find(
          (p: any) =>
            p.market.toUpperCase().replaceAll('-', '') === market.toUpperCase(),
        )

        // convert price to float
        price = parseFloat(price?.toString() || '0')

        // if position is found, then we need to close it
        if (position) {
          // create a new close order
          _orders.push({
            market,
            type,
            price,
            chase,
            close,
            size: position.size,
            side: position.side.toLowerCase() === 'buy' ? 'sell' : 'buy',
            reduce_only: true,
          })
        }
      }
      _orders.push({
        side,
        market,
        type,
        size,
        price,
        chase,
        close,
        reduce_only: false,
      })
    })

    // place orders
    console.log({ _orders })

    // if (positions.length > 0) {
    //   msg = success
    //     ? `Failed to place new order${
    //         orders.length > 1 ? 's' : ''
    //       }. You already have ${positions.length} position${
    //         positions.length > 1 ? 's' : ''
    //       } for ${positions.map((p) => p.market).join(', ')} on ${
    //         config.exchange
    //       }.`
    //     : `Failed to get positions on ${config.exchange} ${
    //         msg ? `\\(${msg}\\)` : ''
    //       }`

    //   // sendMessage(msg, user.tgId)
    //   return res.status(400).json({
    //     msg,
    //   })
    // }

    // if (!success) {
    //   msg = `Failed to get positions on ${config.exchange} ${
    //     msg ? `\\(${msg}\\)` : ''
    //   }`

    //   // sendMessage(msg, user.tgId)
    //   return res.status(400).json({
    //     msg,
    //   })
    // }

    for (let i = 0; i < _orders.length; i++) {
      try {
        let o = _orders[i]

        console.log(
          `Placing order ${i + 1} of ${_orders.length}, order type: ${
            o.close ? 'Close' : 'Normal'
          }. . .`,
        )

        // dollarize the size

        if (true) {
          let { last, close } = await ccxt.fetchTicker(o.market)
          let price = last || close

          if (!price) {
            let msg = `Failed to get price for ${o.market}`
            // sendMessage(msg, user!.tgId)
            return res.status(400).json({ msg, success: false })
          }

          o.size = parseFloat((o.size / price).toFixed(6))
        }

        let order = await ccxt.createOrder(
          o.market,
          o.type,
          o.side,
          o.size,
          parseFloat(o.price.toFixed(4)),
        )

        console.log({ order })

        if (!order) {
          let msg = `Failed to place order ${i + 1} of ${_orders.length}`
          // sendMessage(msg, user!.tgId)
          return res.status(400).json({ msg })
        }

        // if chase is true, then we need to modify the order until it is filled
        if (o?.chase) {
          // await ccxt.modifyOrder(order.id, o.market, o.side)
          // if (!success) {
          //   // sendMessage(msg, user!.tgId)
          //   return res.status(400).json({ msg })
          // }
        }
      } catch (error) {
        console.log(error)
      }
    }

    return res.status(200).json({ msg: 'Orders placed' })
  } catch (error: any) {
    console.log(error)
    let msg = parseError(error)
    msg = `Failed to place new order. ${msg}`

    return res.status(400).json({ msg })
  }
}
