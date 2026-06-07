/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const LandingController = () => import('#controllers/landing_controller')
const CustomerOrderController = () => import('#controllers/customer_order_controller')
const VendorController = () => import('#controllers/vendor_controller')

router.get('/', [LandingController, 'index']).as('home')
router.get('/services', [LandingController, 'services']).as('landing.services')
router.get('/a-propos/qui-sommes-nous', [LandingController, 'aboutCompany']).as(
  'landing.about.company'
)
router.get('/a-propos/nos-engagements', [LandingController, 'aboutCommitments']).as(
  'landing.about.commitments'
)
router.get('/a-propos/notre-politique', [LandingController, 'aboutPolicy']).as(
  'landing.about.policy'
)
router.get('/a-propos/notre-equipe', [LandingController, 'aboutTeam']).as('landing.about.team')

router.post('/demandes/service', [LandingController, 'storeServiceRequest']).as(
  'landing.service.store'
)
router.post('/contact', [LandingController, 'storeLead']).as('landing.lead.store')

router.get('/partenaires/marchands', [LandingController, 'vendorCta']).as('landing.cta.vendor')
router.get('/recrutement/livreurs', [LandingController, 'driverCta']).as('landing.cta.driver')
router.get('/test-geo', [CustomerOrderController, 'testGeo']).as('test.geo')

router
  .group(() => {
    router.get('/search', [CustomerOrderController, 'search']).as('search')
    router.post('/orders', [CustomerOrderController, 'store']).as('orders.store')
  })
  .prefix('/customer')
  .as('customer')
  .use([middleware.auth(), middleware.role({ role: 'client' })])

router
  .group(() => {
    router.get('/', [VendorController, 'dashboard']).as('dashboard')
    router.get('/products', [VendorController, 'products']).as('products')
    router.get('/orders', [VendorController, 'orders']).as('orders')
    router.post('/products', [VendorController, 'storeProduct']).as('products.store')
    router.post('/products/:productId/update', [VendorController, 'updateProduct']).as(
      'products.update'
    )
    router.post('/products/:productId/delete', [VendorController, 'destroyProduct']).as(
      'products.destroy'
    )
    router.post('/products/:productId/toggle-status', [VendorController, 'toggleProductStatus']).as(
      'products.toggleStatus'
    )
    router.post('/store/status', [VendorController, 'updateStatus']).as('store.status')
    router.post('/orders/:orderId/advance-status', [VendorController, 'advanceOrderStatus']).as(
      'orders.advanceStatus'
    )
    router.post('/orders/:orderId/cancel', [VendorController, 'cancelOrder']).as('orders.cancel')
  })
  .prefix('/vendor')
  .as('vendor')
  .use([middleware.auth(), middleware.role({ role: 'vendor' })])
