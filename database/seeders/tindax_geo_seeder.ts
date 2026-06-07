import { BaseSeeder } from '@adonisjs/lucid/seeders'
import DriverProfile from '#models/driver_profile'
import Product from '#models/product'
import Store from '#models/store'
import User from '#models/user'
import { kinshasaCommunes, normalizeCommuneName } from '#services/kinshasa_communes'

const productTemplates = [
  {
    name: 'Poulet Mayo',
    description: 'Poulet roti sauce mayo, portion urbaine tres demandee a Kinshasa.',
    price: '10.50',
    category: 'repas' as const,
  },
  {
    name: 'Shawarma Poulet',
    description: 'Shawarma genereux, pratique pour lunch rapide et livraison express.',
    price: '8.50',
    category: 'repas' as const,
  },
  {
    name: 'Panier Courses Express',
    description: 'Selection d essentials du quotidien pour livraison de proximite.',
    price: '16.00',
    category: 'courses' as const,
  },
  {
    name: 'Petit Colis Prioritaire',
    description: 'Envoi local leger a travers la commune et les axes voisins.',
    price: '6.50',
    category: 'colis' as const,
  },
]

export default class extends BaseSeeder {
  static environment = ['development']

  public async run() {
    for (const [index, commune] of kinshasaCommunes.entries()) {
      const slug = normalizeCommuneName(commune.name)
      const latitudeOffset = ((index % 4) - 1.5) * 0.0012
      const longitudeOffset = ((index % 5) - 2) * 0.001
      const driverLatitudeOffset = ((index % 3) - 1) * 0.0018
      const driverLongitudeOffset = ((index % 4) - 1.5) * 0.0014

      await User.updateOrCreate(
        { email: `client.${slug}@tindax.test` },
        {
          fullName: `Client ${commune.name}`,
          email: `client.${slug}@tindax.test`,
          phone: `+243 812 ${String(1000 + index).padStart(4, '0')}`,
          password: null,
          role: 'client',
          isActive: true,
        }
      )

      const vendor = await User.updateOrCreate(
        { email: `vendor.${slug}@tindax.test` },
        {
          fullName: `Marchand ${commune.name}`,
          email: `vendor.${slug}@tindax.test`,
          phone: `+243 813 ${String(2000 + index).padStart(4, '0')}`,
          password: null,
          role: 'vendor',
          isActive: true,
        }
      )

      const store = await Store.updateOrCreate(
        { userId: vendor.id },
        {
          userId: vendor.id,
          name: `${commune.name} Food Hub`,
          description: `Boutique TindaX de ${commune.name}, orientee repas rapides, courses et petits colis urbains.`,
          logoImage: null,
          address: `${commune.name}, Kinshasa`,
          latitude: (commune.latitude + latitudeOffset).toFixed(7),
          longitude: (commune.longitude + longitudeOffset).toFixed(7),
          status: 'ouvert',
        }
      )

      for (const template of productTemplates) {
        await Product.updateOrCreate(
          {
            storeId: store.id,
            name: `${template.name} ${commune.name}`,
          },
          {
            storeId: store.id,
            name: `${template.name} ${commune.name}`,
            description: `${template.description} Disponible dans la zone de ${commune.name}.`,
            price: (Number(template.price) + (index % 3) * 0.75).toFixed(2),
            image: null,
            status: 'disponible',
            category: template.category,
          }
        )
      }

      const driver = await User.updateOrCreate(
        { email: `driver.${slug}@tindax.test` },
        {
          fullName: `Motard ${commune.name}`,
          email: `driver.${slug}@tindax.test`,
          phone: `+243 815 ${String(3000 + index).padStart(4, '0')}`,
          password: null,
          role: 'driver',
          isActive: true,
        }
      )

      await DriverProfile.updateOrCreate(
        { userId: driver.id },
        {
          userId: driver.id,
          latitude: (commune.latitude + driverLatitudeOffset).toFixed(7),
          longitude: (commune.longitude + driverLongitudeOffset).toFixed(7),
          status: 'disponible',
          vehicleType: 'moto',
        }
      )
    }

    console.log(
      `Seeder geo TindaX charge avec ${kinshasaCommunes.length} communes, ${kinshasaCommunes.length} boutiques et ${kinshasaCommunes.length} motards.`
    )
  }
}
