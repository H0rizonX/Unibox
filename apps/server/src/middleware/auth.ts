import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { forbidden, unauthorized } from '../lib/errors.js'
import { verifyToken, type JwtPayload } from '../lib/jwt.js'

export type AuthRequest = Request & {
  user?: JwtPayload
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(unauthorized())
  }

  const token = header.slice(7)
  try {
    req.user = verifyToken(token)
  } catch {
    return next(unauthorized('会话已过期，请重新登录。'))
  }

  void prisma.user
    .findUnique({
      where: { id: req.user.sub },
      select: { status: true },
    })
    .then((user) => {
      if (!user) {
        return next(unauthorized('用户不存在。'))
      }
      if (user.status === 'suspended') {
        return next(unauthorized('您的账号因违规被封禁，请联系管理员。'))
      }
      next()
    })
    .catch((err) => next(err))
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next()
  }

  try {
    req.user = verifyToken(header.slice(7))
  } catch {
    // ignore invalid token for optional auth
  }
  next()
}

export function requireRoles(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorized())
    }

    const hasRole = req.user.role.some((r) => roles.includes(r))
    if (!hasRole) {
      return next(forbidden('权限不足。'))
    }
    next()
  }
}
