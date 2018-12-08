/*
* Routes for application
*/

// Dependencies
const handlers = require('./handlers');

// Container for all routes
const router = {
  // Api router
  'api/ping': handlers.api.ping,
  'api/users': handlers.api.users,
  'api/users/orders': handlers.api.users.orders,
  'api/tokens': handlers.api.tokens,
  'api/menu': handlers.api.menu,
  'api/orders': handlers.api.orders,
  'api/shopingCart': handlers.api.shopingCart,

  // Page router
  '': handlers.index,
  'public': handlers.public,
  'favicon.ico': handlers.favicon,
  'account/create': handlers.accountCreate, // +
  'account/edit': handlers.accountEdit,
  'account/deleted': handlers.accountDeleted,
  'session/create': handlers.sessionCreate, // +
  'session/deleted': handlers.sessionDeleted,
  'menu/all': handlers.menuAll,
  'shopingCart': handlers.shopingCart,
  'orders/success': handlers.ordersSuccess,
  'orders/all': handlers.ordersAll,
  'examples/error': handlers.exampleError,
}

module.exports = router;
