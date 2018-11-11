/**
 * Handlers
 */

// Dependencies
const users = require('./handlers/users');
const tokens = require('./handlers/tokens');
const menu = require('./handlers/menu');
const shopingCart = require('./handlers/shopingCart');
const orders = require('./handlers/orders');

// Container for all the handlers
const handlers = {};

// Ping handle
/**
 * Test 
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}) => void} callback 
 */
handlers.ping = (data, callback) => {
  callback(200, data);
}

/**
 * Not found handler
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}) => void} callback 
 */
handlers.notFound = (data, callback) => {
  callback(404);
}

/**
 * Users handlers
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}) => void} callback 
 */
handlers.users = (data, callback) => {
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
handlers.tokens = (data, callback) => {
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
handlers.menu = (data, callback) => {
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
handlers.shopingCart = (data, callback) => {
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
handlers.orders = (data, callback) => {
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
module.exports = handlers;
