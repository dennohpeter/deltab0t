import ccxt, { ExchangeId, Order } from 'ccxt'

class Ccxt {
  private exchange
  constructor(
    exchangeId: ExchangeId,
    apiKey: string,
    secret: string,
    subAccountName?: string | undefined,
  ) {
    let exchangeClass = ccxt[exchangeId]

    this.exchange = new exchangeClass({
      apiKey,
      secret,
      subAccountName,
    })
  }

  fetchBalance = async () => {
    return await this.exchange.fetchBalance()
  }

  fetchTicker = async (symbol: string) => {
    return await this.exchange.fetchTicker(symbol)
  }

  fetchPositions = async () => {
    return await this.exchange.fetchPositions()
  }

  fetchOpenOrders = async (symbol?: string) => {
    return await this.exchange.fetchOpenOrders(symbol)
  }

  cancelOrder = async (id: string, symbol?: string) => {
    return await this.exchange.cancelOrder(id, symbol)
  }

  cancelAllOrders = async (symbol?: string) => {
    return await this.exchange.cancelAllOrders(symbol)
  }

  createOrder = async (
    symbol: string,
    type: Order['type'],
    side: Order['side'],
    amount: number,
    price?: number,
    params?: any,
  ) => {
    return await this.exchange.createOrder(
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
    if (!this.exchange.hasEditOrder) {
      // TODO: cancel and re-place order
      throw new Error(`${this.exchange.id} does not support modify order`)
    }

    return await this.exchange.editOrder(
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
