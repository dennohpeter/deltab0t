import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { verify } from 'jsonwebtoken'
import { config } from '../config'

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let { msg, param: field } = errors.array()[0]

    return res.status(400).json({
      msg,
      field,
    })
  }
  next()
}

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res
      .status(401)
      .json({ msg: 'Unauthorized request!', success: false })
  }

  try {
    verify(token, config.JWT_SECRET, (err, decoded: any) => {
      if (err || !decoded) {
        return res
          .status(401)
          .json({ msg: 'Unauthorized request!', success: false })
      } else {
        console.info(decoded)
        req.user = decoded?.user || decoded
        next()
      }
    })
  } catch (err) {
    console.error('Internal auth error', err)
    res.status(500).json({ msg: 'Internal auth error' })
  }
}
