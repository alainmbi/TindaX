import vine from '@vinejs/vine'

export const storeProductValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(160),
    description: vine.string().trim().maxLength(2000).optional(),
    price: vine.number().positive(),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
      })
      .optional(),
    status: vine.string().trim().in(['disponible', 'rupture']).optional(),
    category: vine.string().trim().in(['repas', 'colis', 'courses']),
  })
)

export const updateProductValidator = vine.compile(
  vine.object({
    editProductId: vine.number().positive().optional(),
    editName: vine.string().trim().minLength(2).maxLength(160).optional(),
    editDescription: vine.string().trim().maxLength(2000).optional(),
    editPrice: vine.number().positive().optional(),
    editImage: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
      })
      .optional(),
    editStatus: vine.string().trim().in(['disponible', 'rupture']).optional(),
    editCategory: vine.string().trim().in(['repas', 'colis', 'courses']).optional(),
  })
)

export const updateStoreLogoValidator = vine.compile(
  vine.object({
    logoImage: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
      })
      .optional(),
  })
)

export const updateStoreStatusValidator = vine.compile(
  vine.object({
    storeStatus: vine.string().trim().in(['ouvert', 'ferme']),
  })
)
