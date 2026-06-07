import type { HttpContext } from '@adonisjs/core/http'
import Lead from '#models/lead'
import { storeLeadValidator } from '#validators/store_lead_validator'
import { storeServiceRequestValidator } from '#validators/store_service_request_validator'

export default class LandingController {
  public async index({ view }: HttpContext) {
    return view.render('pages/home')
  }

  public async storeServiceRequest({ request, response, session }: HttpContext) {
    try {
      const payload = await request.validateUsing(storeServiceRequestValidator)

      await Lead.create({
        category: 'service_request',
        source: 'homepage_hero',
        fullName: null,
        email: null,
        phone: null,
        profile: null,
        serviceQuery: payload.serviceQuery,
        message: null,
        newsletterOptIn: false,
      })

      session.flash(
        'success',
        `Votre demande pour "${payload.serviceQuery}" a bien ete recue. L'equipe TindaX vous recontactera bientot.`
      )

      return response.redirect('/#hero-action')
    } catch (error) {
      session.flash(
        'error',
        this.extractErrorMessage(
          error,
          'Precisez votre besoin avec au moins quelques mots pour que TindaX puisse vous aider.'
        )
      )

      return response.redirect('/#hero-action')
    }
  }

  public async storeLead({ request, response, session }: HttpContext) {
    try {
      const payload = await request.validateUsing(storeLeadValidator)

      await Lead.create({
        category: 'contact',
        source: 'homepage_lead_form',
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        profile: payload.profile,
        serviceQuery: null,
        message: payload.message ?? null,
        newsletterOptIn: payload.newsletterOptIn === 'on',
      })

      session.flash(
        'success',
        `Merci ${payload.fullName}. Votre demande ${payload.profile.toLowerCase()} a bien ete envoyee a l'equipe TindaX.`
      )

      return response.redirect('/#lead-form')
    } catch (error) {
      session.flash(
        'error',
        this.extractErrorMessage(
          error,
          'Merci de verifier vos informations avant de soumettre le formulaire TindaX.'
        )
      )

      return response.redirect('/#lead-form')
    }
  }

  public async vendorCta({ response, session }: HttpContext) {
    session.flash(
      'info',
      'Parlez-nous de votre commerce. Le formulaire TindaX est deja prepare plus bas.'
    )

    return response.redirect('/#lead-form')
  }

  public async driverCta({ response, session }: HttpContext) {
    session.flash(
      'info',
      'Partagez votre profil de livreur. Le formulaire TindaX est deja prepare plus bas.'
    )

    return response.redirect('/#lead-form')
  }

  private extractErrorMessage(error: unknown, fallbackMessage: string) {
    if (typeof error === 'object' && error !== null && 'messages' in error) {
      const messages = (error as { messages?: unknown }).messages

      if (Array.isArray(messages)) {
        const firstMessage = messages[0] as { message?: string } | undefined

        if (typeof firstMessage?.message === 'string') {
          return firstMessage.message
        }
      }

      if (typeof messages === 'object' && messages !== null) {
        const errorBag = messages as { errors?: Array<{ message?: string }> }
        const firstMessage = errorBag.errors?.[0]

        if (typeof firstMessage?.message === 'string') {
          return firstMessage.message
        }
      }
    }

    return fallbackMessage
  }
}
