export interface OrderCreateInput {
  token: string
  orders: Order[]
  subAccount?: string
}

export interface OrderReq {
  side: OrderSide
  market: string
  type: OrderType
  size: number
  price: number
  chase?: boolean
  reduce_only?: boolean
  close?: boolean
}
export enum OrderSide {
  Buy = 'Buy',
  Sell = 'Sell',
}

export enum OrderType {
  Limit = 'Limit',
  Market = 'Market',
  Stop = 'Stop',
  StopLimit = 'StopLimit',
}

export interface Order {
  id: string
  market: string
  side: OrderSide
  price: number
  size: number
  type: OrderType
}
