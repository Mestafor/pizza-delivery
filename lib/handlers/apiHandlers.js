/*
 * API handlers  
*/

// Dependencies
const users = require('./api/users');
const tokens = require('./api/tokens');
const menu = require('./api/menu');
const shopingCart = require('./api/shopingCart');
const orders = require('./api/orders');


// Container for api handlers
const apiHandlers = {};

// Ping handle
/**
 * Test 
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}) => void} callback 
 */
apiHandlers.ping = (data, callback) => {
  callback(200, data);
}

/**
 * Users handlers
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}) => void} callback 
 */
apiHandlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];

  if (acceptableMethods.includes(data.method)) {

    const userHandler = users[data.method];
    if (typeof userHandler === 'function') {
      userHandler(data, callback);
    } else {
      callback(500);
    }

  } else {
    // 405 - Method not allowed
    callback(405);
  }
};

/**
 * Tokens handlers
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}) => void} callback 
 */
apiHandlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];

  if (acceptableMethods.includes(data.method)) {

    const tokensHandler = tokens[data.method];
    if (typeof tokensHandler === 'function') {
      tokensHandler(data, callback);
    } else {
      callback(500);
    }

  } else {
    // 405 - Method not allowed
    callback(405);
  }
};

/**
 * Menu handlers
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}) => void} callback 
 */
apiHandlers.menu = (data, callback) => {
  const acceptableMethods = ['get'];

  if (acceptableMethods.includes(data.method)) {

    const menuHandler = menu[data.method];
    if (typeof menuHandler === 'function') {
      menuHandler(data, callback);
    } else {
      callback(500);
    }

  } else {
    // 405 - Method not allowed
    callback(405);
  }
};

/**
 * Shoping cart handlers
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}) => void} callback 
 */
apiHandlers.shopingCart = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];

  if (acceptableMethods.includes(data.method)) {

    const shopingCartHandler = shopingCart[data.method];
    if (typeof shopingCartHandler === 'function') {
      shopingCartHandler(data, callback);
    } else {
      callback(500);
    }

  } else {
    // 405 - Method not allowed
    callback(405);
  }
};

/**
 * Orders handlers
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}) => void} callback 
 */
apiHandlers.orders = (data, callback) => {
  const acceptableMethods = ['post', 'get'];

  if (acceptableMethods.includes(data.method)) {

    const ordersHandler = orders[data.method];
    if (typeof ordersHandler === 'function') {
      ordersHandler(data, callback);
    } else {
      callback(500);
    }

  } else {
    // 405 - Method not allowed
    callback(405);
  }
};

// Export module
module.exports = apiHandlers;
