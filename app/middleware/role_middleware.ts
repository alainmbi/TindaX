import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

type RoleMiddlewareOptions = {
  role: 'client' | 'driver' | 'vendor' | 'admin'
}

export default class RoleMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn, options: RoleMiddlewareOptions) {
    const user = auth.getUserOrFail()

    if (user.role !== options.role) {
      return response.forbidden("Acces refuse. Cet espace est reserve aux vendeurs TindaX.")
    }

    return next()
  }
}
