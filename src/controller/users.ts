import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { parseError } from '../helpers'
import { UserCreateInput } from '../types'
import { sign } from 'jsonwebtoken'
import { config } from '../config'

const prisma = new PrismaClient()

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    let user = await prisma.user.findUnique({
      where: {
        id: req.user?.id,
      },
    })

    if (!user) {
      return res.status(404).json({ msg: 'User not found', success: false })
    }
    return res.json({ user, success: true })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ msg: 'Server error', success: false })
  }
}

export const login = async (req: Request, res: Response) => {
  let { phoneNumber } = req.body

  try {
    let user = await prisma.user.findFirst({
      where: {
        phoneNumber,
      },
    })

    if (!user) {
      return res.status(404).json({ msg: 'User not found', success: false })
    }

    // login user
    const payload = {
      id: user.id,
      phoneNumber: user.phoneNumber,
    }
    sign(
      payload,
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_TOKEN_EXPIRES_IN,
      },
      (err, token) => {
        if (err) throw err
        res.json({ token, success: true })
      },
    )
  } catch (err: any) {
    console.error(err.message)
    return res.status(500).send('Internal server error')
  }
}
export const createNewUser = async (req: Request, res: Response) => {
  let { username, phoneNumber }: UserCreateInput = req.body

  try {
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
