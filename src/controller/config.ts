import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { parseError } from '../helpers'
import { config } from '../config'

import { AES } from 'crypto-js'

export const createConfig = async (req: Request, res: Response) => {
  let { apiKey, secret, exchangeId, subAccountName } = req.body

  try {
    let prisma = new PrismaClient()

    let userId = req.user?.id

    let user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return res.status(400).json({ msg: 'User not found' })
    }

    let hashedApiKey = AES.encrypt(apiKey, config.HASH_SECRET).toString()
    let hashedSecret = AES.encrypt(secret, config.HASH_SECRET).toString()

    await prisma.config.create({
      data: {
        apiKey: hashedApiKey,
        secret: hashedSecret,
        exchangeId,
        subAccountName,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      msg: `Config created successfully`,
    })
  } catch (error) {
    return res.status(400).json({ msg: parseError(error) })
  }
}
export const removeConfig = async (req: Request, res: Response) => {
  let { configId } = req.body

  try {
    let prisma = new PrismaClient()

    let userId = req.user?.id

    let user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return res.status(400).json({ msg: 'User not found' })
    }

    await prisma.config.delete({
      where: {
        id: configId,
      },
    })

    return res.status(200).json({
      success: true,

      msg: `Config removed successfully`,
    })
  } catch (error) {
    return res.status(400).json({ msg: parseError(error) })
  }
}
