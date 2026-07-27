// src/utils/index.ts
import { Response } from 'express'

export const ok = (res: Response, data: any, status = 200) =>
  res.status(status).json({ success: true, data })

export const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message })

export const paginate = (
  res: Response,
  data: any[],
  total: number,
  page: number,
  limit: number
) =>
  res.status(200).json({
    success: true,
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  })