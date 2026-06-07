import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

type AuthMiddlewareOptions = {
  guards?: string[]
}

export default class AuthMiddleware {
  async handle(
    { auth, request, response, session }: HttpContext,
    next: NextFn,
    options: AuthMiddlewareOptions = {}
  ) {
    try {
      await auth.authenticateUsing(options.guards)
      return next()
    } catch (error) {
      const accepted = request.accepts(['html', 'application/xhtml+xml'])
      const acceptsHtml = accepted === 'html' || accepted === 'application/xhtml+xml'

      if (acceptsHtml) {
        session.flash(
          'error',
          'Vous devez etre connecte avec un compte marchand pour acceder a cet espace.'
        )

        return response.redirect().toRoute('home')
      }

      throw error
    }
  }
}
