import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

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
