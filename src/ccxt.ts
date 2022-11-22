import ccxt, { ExchangeId, Order, Exchange } from 'ccxt'
import { AES, enc } from 'crypto-js'
import { config } from './config'

export class Ccxt {
  private client: Exchange

  constructor(
    exchangeId: ExchangeId,
    apiKey: string,
    secret: string,
    subAccountName?: string | undefined,
  ) {
    let exchangeClass = ccxt[exchangeId]

    apiKey = AES.decrypt(apiKey, config.HASH_SECRET).toString(enc.Utf8)
    secret = AES.decrypt(secret, config.HASH_SECRET).toString(enc.Utf8)

    this.client = new exchangeClass({
      apiKey,
      secret,
      subAccountName,
    })
  }

  fetchBalance = async () => {
    return await this.client.fetchBalance()
  }

  fetchTicker = async (symbol: string) => {
    return await this.client.fetchTicker(symbol)
  }

  fetchPositions = async (symbols?: string[]) => {
    let positions = await this.client.fetchPositions(symbols)
    return positions.filter(
      (p: { notional: number; openSize: number }) =>
        (p.notional || p.openSize) > 0,
    )
  }

  fetchOpenOrders = async (symbol?: string) => {
    return await this.client.fetchOpenOrders(symbol)
  }

  cancelOrder = async (id: string, symbol?: string) => {
    return await this.client.cancelOrder(id, symbol)
  }

  cancelAllOrders = async (symbol?: string) => {
    return await this.client.cancelAllOrders(symbol)
  }

  createOrder = async (
    symbol: string,
    type: Order['type'],
    side: Order['side'],
    amount: number,
    price?: number,
    params?: any,
  ) => {
    return await this.client.createOrder(
      symbol,
      type,
      side,
      amount,
      price,
      params,
    )
  }

  modifyOrder = async (
    id: string,
    symbol: string,
    type: Order['type'],
    side: Order['side'],
    amount: number,
    price?: number,
    params?: any,
  ) => {
    if (!this.client.hasEditOrder) {
      // TODO: cancel and re-place order
      throw new Error(`${this.client.id} does not support modify order`)
    }

    return await this.client.editOrder(
      id,
      symbol,
      type,
      side,
      amount,
      price,
      params,
    )
  }
}
