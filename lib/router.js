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
  'api/tokens': handlers.api.tokens,
  'api/menu': handlers.api.menu,
  'api/orders': handlers.api.orders,
  'api/shopingCart': handlers.api.shopingCart,

  // Page router
  '': handlers.index,
  'user/create': handlers.userCreate,
  'user/update': handlers.userUpdate,
  'user/deleted': handlers.userDeleted,
  'menu': handlers.menu,
  'shopingCart': handlers.shopingCart,
  'orders/list': handlers.ordersList
}

module.exports = router;
