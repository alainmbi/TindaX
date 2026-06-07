import vine from '@vinejs/vine'

const drcPhoneRegex = /^(?:(?:\+|00)?243|0)(?:[\s.-]?\d){9}$/

export const storeLeadValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(160),
    phone: vine.string().trim().regex(drcPhoneRegex),
    email: vine.string().trim().email().maxLength(255),
    profile: vine
      .string()
      .trim()
      .in(['Client entreprise', 'Commercant', 'Livreur', 'Partenaire']),
    message: vine.string().trim().maxLength(1500).optional(),
    newsletterOptIn: vine.string().trim().in(['on']).optional(),
  })
)
