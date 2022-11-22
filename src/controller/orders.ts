import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { ExchangeId, Order } from 'ccxt'

import { parseError } from '../helpers'
import { Ccxt } from '../ccxt'

const prisma = new PrismaClient()

export const placeNewOrder = async (req: Request, res: Response) => {
  let {
    token,
    orders: payload,
    subAccountName,
    cancel_open_orders,
    close_positions,
  }: {
    token: string
    orders: string
    subAccountName?: string
    cancel_open_orders?: boolean
    close_positions?: boolean
  } = req.body

  let orders: {
    side: Order['side']
    symbol: string
    type: Order['type']
    size: number
    price: number // entry price
    chase?: boolean // chase the price
    dollarize?: boolean // convert size to usdt
    reduceOnly?: boolean // reduce only
    reduce_only?: boolean // reduce only
  }[] = eval(payload)

  try {
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

    if (close_positions) {
      // get existing positions
      let positions = await ccxt.fetchPositions()

      await Promise.all(
        orders.map(async (o) => {
          let position = positions.find(
            (p: any) =>
              p.symbol.toUpperCase().replaceAll(/[-/]/g, '') ===
              o.symbol.toUpperCase(),
          )

          // convert price to float
          o.price = parseFloat(o.price?.toString() || '0')

          // if position is found, then we need to close it
          if (position) {
            // create a new close order
            let { msg, success } = await _placeOrder(
              {
                ...o,
                size: position.size,
                side: position.side.toLowerCase() === 'buy' ? 'sell' : 'buy',
              },
              ccxt,
            )

            if (!success) {
              return res.status(400).json({ msg, success })
            }
          }
        }),
      )
    }

    // place orders
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

    // cancel open orders
    if (cancel_open_orders) {
      let symbols = new Set(orders.map((o) => o.symbol))
      await Promise.all(
        Array.from(symbols).map(async (symbol) => {
          let openOrders = await ccxt.fetchOpenOrders(symbol)

          // cancel all open orders
          openOrders.forEach(async (o) => {
            console.info(`Cancelling order ${o.id}...`)
            ccxt.cancelOrder(o.id, o.symbol)
          })
        }),
      )
    }

    for (let i = 0; i < orders.length; i++) {
      let order = orders[i]
      console.log(
        `Placing order ${i + 1} of ${orders.length}, order type: ${
          order.type
        }. . .`,
      )
      let { msg, success, data } = await _placeOrder(order, ccxt)

      if (!success) {
        return res.status(400).json({ msg, success })
      }

      console.log(`Order ${i + 1} of ${orders.length} placed successfully.`, {
        order: data,
      })

      // if chase is true, then we need to modify the order until it is filled
      if (order?.chase) {
        // await ccxt.modifyOrder(order.id, o.market, o.side)
        // if (!success) {
        //   // sendMessage(msg, user!.tgId)
        //   return res.status(400).json({ msg })
        // }
      }
    }

    return res.status(200).json({ msg: 'Orders placed' })
  } catch (error: any) {
    console.log(error)
    let msg = parseError(error)
    msg = `Failed to place new order. ${msg}`

    return res.status(400).json({ msg, success: false })
  }
}

const _placeOrder = async (
  o: {
    side: Order['side']
    symbol: string
    type: Order['type']
    size: number
    price: number
    chase?: boolean
    dollarize?: boolean
    reduceOnly?: boolean
    reduce_only?: boolean
  },
  ccxt: Ccxt,
) => {
  try {
    // dollarize the size
    if (o?.dollarize) {
      let { last, close } = await ccxt.fetchTicker(o.symbol)
      let price = last || close

      if (!price) {
        let msg = `Failed to get price for ${o.symbol}`
        // sendMessage(msg, user!.tgId)
        return { msg, success: false }
      }

      o.size = parseFloat((o.size / price).toFixed(6))
    }

    let params = {
      reduceOnly: o?.reduceOnly,
      reduce_only: o?.reduce_only,
    }
    let order = await ccxt.createOrder(
      o.symbol,
      o.type,
      o.side,
      o.size,
      parseFloat(o.price.toFixed(4)),
      params,
    )

    return { msg: 'Order placed', data: order, success: true }
  } catch (error) {
    console.log(error)
    let msg = parseError(error)
    msg = `Failed to place new order. ${msg}`
    return { msg, success: false }
  }
}
export const cancelOrder = async (req: Request, res: Response) => {
  let { orderId, symbol, configId } = req.body

  try {
    let user = await prisma.user.findUnique({
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

    let config = user.configs.find((c) => c.id === configId)
    if (!config) {
      return res.status(400).json({ msg: 'Config not found', success: false })
    }

    let { apiKey, secret, exchangeId } = config

    let ccxt = new Ccxt(
      exchangeId.toLowerCase() as ExchangeId,
      apiKey,
      secret,
      config?.subAccountName || '',
    )

    let order = await ccxt.cancelOrder(orderId, symbol)

    return res.status(200).json({
      success: true,
      data: order,
    })
  } catch (error: any) {
    let msg = parseError(error)
    msg = `Failed to cancel order. ${msg}`

    return res.status(400).json({ msg, success: false })
  }
}

export const fetchOpenOrders = async (req: Request, res: Response) => {
  let { configId, symbol } = req.body
  try {
    let user = await prisma.user.findUnique({
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

    let config = user.configs.find((c) => c.id === configId)
    if (!config) {
      return res.status(400).json({ msg: 'Config not found', success: false })
    }

    if (!config) {
      return res.status(400).json({ msg: 'Config not found', success: false })
    }

    let { apiKey, secret, exchangeId } = config

    let ccxt = new Ccxt(
      exchangeId.toLowerCase() as ExchangeId,
      apiKey,
      secret,
      config?.subAccountName || '',
    )

    let orders = await ccxt.fetchOpenOrders(symbol)

    return res.status(200).json({
      data: orders,
      success: true,
    })
  } catch (error: any) {
    let msg = parseError(error)
    msg = `Failed to fetch open orders. ${msg}`

    return res.status(400).json({ msg, success: false })
  }
}

export const fetchPositions = async (req: Request, res: Response) => {
  let { symbols, configId } = req.body

  try {
    let user = await prisma.user.findUnique({
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

    let config = user.configs.find((c) => c.id === configId)
    if (!config) {
      return res.status(400).json({ msg: 'Config not found', success: false })
    }

    let { apiKey, secret, exchangeId } = config

    let ccxt = new Ccxt(
      exchangeId.toLowerCase() as ExchangeId,
      apiKey,
      secret,
      config?.subAccountName || '',
    )

    let positions = await ccxt.fetchPositions(symbols)

    return res.status(200).json({
      data: positions,
      success: true,
    })
  } catch (error: any) {
    let msg = parseError(error)
    msg = `Failed to fetch positions. ${msg}`

    return res.status(400).json({ msg, success: false })
  }
}
