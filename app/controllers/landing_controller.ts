import type { HttpContext } from '@adonisjs/core/http'
import Lead from '#models/lead'
import Product from '#models/product'
import { storeLeadValidator } from '#validators/store_lead_validator'
import { storeServiceRequestValidator } from '#validators/store_service_request_validator'

export default class LandingController {
  public async index({ view }: HttpContext) {
    return view.render('pages/home', {
      navSection: 'home',
    })
  }

  public async aboutCompany({ view }: HttpContext) {
    return view.render('pages/about/section', {
      navSection: 'about',
      ...this.getAboutPageViewModel('company'),
    })
  }

  public async aboutCommitments({ view }: HttpContext) {
    return view.render('pages/about/section', {
      navSection: 'about',
      ...this.getAboutPageViewModel('commitments'),
    })
  }

  public async aboutPolicy({ view }: HttpContext) {
    return view.render('pages/about/section', {
      navSection: 'about',
      ...this.getAboutPageViewModel('policy'),
    })
  }

  public async aboutTeam({ view }: HttpContext) {
    return view.render('pages/about/section', {
      navSection: 'about',
      ...this.getAboutPageViewModel('team'),
    })
  }

  public async services({ view }: HttpContext) {
    const products = await Product.query()
      .where('status', 'disponible')
      .whereHas('store', (storeQuery) => {
        storeQuery.where('status', 'ouvert')
      })
      .preload('store')
      .orderBy('category', 'asc')
      .orderBy('name', 'asc')

    const serviceMeta = {
      repas: {
        label: 'Repas & Restaurants',
        eyebrow: 'Livraison gourmande',
        description:
          'Plats urbains, snacks et options dejeuner disponibles dans les boutiques TindaX ouvertes.',
        accentClass: 'service-accent-meal',
        anchor: 'repas',
      },
      courses: {
        label: 'Courses & Quotidien',
        eyebrow: 'Courses du quotidien',
        description:
          'Paniers express, indispensables maison et achats de proximite prepares pour livraison rapide.',
        accentClass: 'service-accent-grocery',
        anchor: 'courses',
      },
      colis: {
        label: 'Colis & Envois',
        eyebrow: 'Logistique locale',
        description:
          'Petits colis prioritaires et envois legers pris en charge entre communes et axes proches.',
        accentClass: 'service-accent-parcel',
        anchor: 'colis',
      },
    } as const

    const services = (Object.keys(serviceMeta) as Array<keyof typeof serviceMeta>).map((key) => {
      const items = products
        .filter((product) => product.category === key)
        .map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          storeName: product.store.name,
          commune: product.store.address,
          status: product.status,
        }))

      const storeCount = new Set(items.map((item) => item.storeName)).size
      const startingPrice = items.length > 0 ? Math.min(...items.map((item) => item.price)) : null

      return {
        key,
        ...serviceMeta[key],
        items,
        totals: {
          itemCount: items.length,
          storeCount,
          startingPrice,
        },
      }
    })

    return view.render('pages/services', {
      navSection: 'services',
      services,
      totalProducts: products.length,
      totalStores: new Set(products.map((product) => product.storeId)).size,
    })
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

      return response.redirect('/#contact')
    } catch (error) {
      session.flash(
        'error',
        this.extractErrorMessage(
          error,
          'Merci de verifier vos informations avant de soumettre le formulaire TindaX.'
        )
      )

      return response.redirect('/#contact')
    }
  }

  public async vendorCta({ response, session }: HttpContext) {
    session.flash(
      'info',
      'Parlez-nous de votre commerce. Les informations de contact TindaX sont disponibles plus bas.'
    )

    return response.redirect('/#contact')
  }

  public async driverCta({ response, session }: HttpContext) {
    session.flash(
      'info',
      'Partagez votre profil de livreur. Les informations de contact TindaX sont disponibles plus bas.'
    )

    return response.redirect('/#contact')
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

  private getAboutPageViewModel(currentPage: 'company' | 'commitments' | 'policy' | 'team') {
    const navigation = [
      { key: 'company', label: 'Qui sommes nous', href: '/a-propos/qui-sommes-nous' },
      { key: 'commitments', label: 'Nos engagements', href: '/a-propos/nos-engagements' },
      { key: 'policy', label: 'Notre politique', href: '/a-propos/notre-politique' },
      { key: 'team', label: 'Notre equipe', href: '/a-propos/notre-equipe' },
    ] as const

    const pages = {
      company: {
        eyebrow: 'Notre vision',
        title: "L'infrastructure de confiance a Kinshasa",
        description:
          "TindaX comble le fosse entre les clients exigeants, les vendeurs locaux ambitieux et un reseau de coursiers multi-services rigoureusement selectionnes. Nous batissons l'autoroute numerique et logistique de la RDC.",
        imagePath: '/images/delivery/courier-red-box-outdoor.jpg',
        primaryCta: { label: 'Decouvrir nos solutions', href: '/services' },
        secondaryCta: { label: 'Voir le manifeste', href: '/a-propos/nos-engagements' },
        highlights: [
          {
            title: 'Securite & Confiance',
            text: "Nous imposons des audits physiques KYC stricts pour chaque livreur. Votre tranquillite d'esprit est notre priorite absolue.",
          },
          {
            title: 'Innovation Locale',
            text: "Notre technologie de livraison et notre assistant conversationnel IA sont penses pour les realites urbaines complexes de Kinshasa.",
          },
          {
            title: 'Excellence Operationnelle',
            text: "Une rigueur millimetree dans chaque expedition pour garantir des delais plus rapides et une execution plus fiable.",
          },
        ],
      },
      commitments: {
        eyebrow: 'Equipe & valeurs',
        title: 'Nos engagements : rendre service en toute securite',
        description:
          "Au coeur de Kinshasa, nous batissons une infrastructure de confiance pour connecter les talents locaux aux besoins urbains, avec une rigueur absolue.",
        imagePath: '/images/delivery/courier-female-phone-red.jpg',
        primaryCta: { label: 'Devenir partenaire', href: '/#contact' },
        secondaryCta: { label: 'Consulter la charte', href: '/a-propos/notre-politique' },
        highlights: [
          {
            title: 'Pour nos clients',
            text: 'Prestataires 100% audites, assurance dommages incluse et support client local base a Kinshasa.',
          },
          {
            title: 'Pour nos riders',
            text: 'Revenu equitable, kit complet et formation a la conduite comme au service.',
          },
          {
            title: 'Pour nos vendeurs',
            text: 'Vitrine premium sans frais fixes, gestion fluide des stocks et tableaux de bord en temps reel.',
          },
        ],
      },
      policy: {
        eyebrow: 'Engagement RSE',
        title: "TindaX : impacter positivement l'ecosysteme congolais",
        description:
          "Nous voulons prouver qu'une logistique urbaine premium peut aussi soutenir l'emploi local, accelerer le commerce de proximite et reduire l'empreinte operationnelle.",
        imagePath: '/images/delivery/courier-female-street-boxes.jpg',
        primaryCta: { label: 'Voir nos engagements', href: '/a-propos/nos-engagements' },
        secondaryCta: { label: 'Decouvrir notre equipe', href: '/a-propos/notre-equipe' },
        highlights: [
          {
            title: 'Inclusion economique des jeunes',
            text: "Nous professionalisons des milliers de livreurs avec une base de revenus plus stable et un cadre de travail plus digne.",
          },
          {
            title: 'Soutien au commerce local',
            text: "Nous deployons des catalogues numeriques et une visibilite accrue pour les petites boutiques, restaurants et PME congolaises.",
          },
          {
            title: 'Logistique eco-responsable',
            text: "En optimisant les trajets et la repartition des courses, nous reduisons la congestion et les emissions inutiles.",
          },
        ],
      },
      team: {
        eyebrow: "L'excellence congolaise",
        title: 'Les esprits derriere TindaX',
        description:
          "Une equipe d'experts passionnes unie pour batir l'infrastructure de confiance et de logistique de proximite en Republique Democratique du Congo.",
        imagePath: '/images/delivery/courier-red-box-garden.jpg',
        primaryCta: { label: 'Voir les opportunites', href: '/#contact' },
        secondaryCta: { label: 'Notre vision', href: '/a-propos/qui-sommes-nous' },
        highlights: [
          {
            title: "Direction & execution",
            text: "Un pilotage proche du terrain, entre vision produit, excellence operationnelle et croissance responsable.",
          },
          {
            title: 'Design & technologie',
            text: "Une equipe qui pense chaque interface, chaque flux et chaque outil comme des leviers de confiance.",
          },
          {
            title: 'Impact local',
            text: "Nous recrutons et structurons des talents congolais pour construire une infrastructure utile a long terme.",
          },
        ],
        teamMembers: [
          {
            name: 'Emmanuel Kabamba',
            role: 'DevOps engineer',
            bio: "Ingenieur logiciel chevronne, Emmanuel batit l'infrastructure numerique securisee qui propulse TindaX au-dela des standards locaux.",
            imagePath: '/images/about/emmanuel-kabamba.jpg',
          },
          {
            name: 'Alain Mbi',
            role: 'Head of Design & Developpement Web',
            bio: "Expert en communication digitale, Alain faconne l'experience utilisateur TindaX pour la rendre intuitive, fluide et prestigieuse.",
            imagePath: '/images/about/alain-mbi.jpg',
          },
        ],
      },
    } as const

    return {
      currentPage,
      navigation,
      page: pages[currentPage],
    }
  }
}
