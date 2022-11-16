import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { parseError } from '../helpers'
import { UserCreateInput } from '../types'

export const createNewUser = async (req: Request, res: Response) => {
  let { username, phoneNumber }: UserCreateInput = req.body

  try {
    let prisma = new PrismaClient()

    let user = await prisma.user.create({
      data: {
        username,
        phoneNumber,
      },
    })

    return res.status(200).json({
      success: true,
      msg: `User ${user.username} created successfully`,
    })
  } catch (error) {
    return res.status(400).json({ msg: parseError(error) })
  }
}
