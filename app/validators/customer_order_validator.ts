import vine from '@vinejs/vine'

export const searchNearbyProductsValidator = vine.compile(
  vine.object({
    keyword: vine.string().trim().minLength(2).maxLength(120),
    latitude: vine.number(),
    longitude: vine.number(),
    radiusKm: vine.number().positive().max(25).optional(),
  })
)

export const storeCustomerOrderValidator = vine.compile(
  vine.object({
    storeId: vine.number().positive(),
    deliveryAddress: vine.string().trim().minLength(10).maxLength(255),
    customerLatitude: vine.number().optional(),
    customerLongitude: vine.number().optional(),
    items: vine
      .array(
        vine.object({
          productId: vine.number().positive(),
          quantity: vine.number().positive().withoutDecimals().range([1, 50]),
        })
      )
      .minLength(1),
  })
)
