import vine from '@vinejs/vine'

export const storeServiceRequestValidator = vine.compile(
  vine.object({
    serviceQuery: vine.string().trim().minLength(3).maxLength(255),
  })
)
