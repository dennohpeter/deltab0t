import { Order } from 'ccxt'

export interface OrderReq {
  side: Order['side']
  market: string
  type: Order['type']
  size: number
  price: number
  chase?: boolean
  reduce_only?: boolean
  close?: boolean
}
