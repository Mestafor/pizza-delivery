/**
 * Shoping cart handlers
 */

// Dependencies
const _data = require('../../data');
const helpers = require('../../helpers');
const { MENU, SHOPING_CART_DIR, USERS_DIR } = require('../../constants');
const { verifyToken } = require('./tokens');

// Container for all shoping cart methods
const shopingCart = {};

/**
 * Shoping cart Model
 {
   id: string,
   email: string,
   timestamp: number,
   list: [
     {
       id: string,
       count: number 
     }
   ]
 }
 */

/**
 * Shoping cart - post
 * Required data: email, list
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {token: string}; payload:{email: string; list: [{id: number, count: number}]}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
shopingCart.post = (data, callback) => {
  // 1. Check required fields
  // 2. Make sure the token is not expired
  // 3. Make sure the list values is valid
  // 4. Create and write orders
  // 5. Add order id to user orders array

  // 1. Check required fields
  const { payload, headers: { token } } = data;
  const email = typeof payload.email === 'string' ? payload.email : false;
  const list = typeof payload.list === 'object' && Array.isArray(payload.list) && payload.list.length > 0 ? payload.list : false;

  if (email && list) {
    // 2. Make sure the token is not expired
    verifyToken(token, email, (verified) => {
      if (verified) {
        // 3. Make sure list values is valid
        const productList = MENU.filter(item => list.map(l => l.id).includes(item.id));


        if (productList.length === list.length) {
          // 4. Create and write orders
          const id = helpers.createRandomString(20);
          const ordersData = {
            id,
            email,
            list,
            timestamp: Date.now()
          };

          _data.create(SHOPING_CART_DIR, id, ordersData, (err) => {
            if (!err) {
              _data.read(USERS_DIR, email, (readErr, userData) => {
                if (!readErr && userData) {

                  if (!Array.isArray(userData.shopingCart)) {
                    userData.shopingCart = [];
                  }

                  // 5. Add order id to user shoping cart array
                  userData.shopingCart.push(id);

                  const orderedMenu = [];
                  _data.update(USERS_DIR, email, userData, (updateErr) => {
                    if (!updateErr) {
                      callback(200, { message: 'Shoping cart created' });
                    } else {
                      callback(500, { error: 'Could not update order lsit' });
                    }
                  });
                } else {
                  callback(500);
                }
              });
            } else {
              callback(500, { error: 'Could not create the order' });
            }
          });

        } else {
          callback(500, { error: 'Fake product id detected' });
        }
      } else {
        callback(400, { error: 'Missing require token in the header, or token is invalid' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields, or list of product is empty' });
  }

};

/**
 * Orders - get
 * Required data: id
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {id: string}; method: string; headers: {token: string}; payload:{}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
shopingCart.get = (data, callback) => {
  // 1. Check required fields
  // 2. Lookup the specified order
  // 3. Make sure the token is not expired

  // 1. Check required fields
  const { queryStringObject, headers: { token } } = data;
  const id = typeof queryStringObject.id === 'string' && queryStringObject.id.trim().length === 20 ? queryStringObject.id : false;

  if (id) {
    // 2. Lookup the specified order
    _data.read(SHOPING_CART_DIR, id, (err, orderData) => {
      if (!err && orderData) {
        // 3. make sure  the token is not expired
        verifyToken(token, orderData.email, (verified) => {
          if (verified) {
            callback(200, orderData);
          } else {
            callback(400, { error: 'Missing required token in the header, or token is invalid' });
          }
        });
      } else {
        callback(500, { error: 'Could not get specified order' });
      }
    });
  } else {
    callback(400, { error: 'Missing require fields' });
  }

};

/**
 * Orders - put
 * Required data: id
 * Optional data: list
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {token: string}; payload:{id: string; list: [{id: string; count: number}]}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
shopingCart.put = (data, callback) => {
  // 1. Check the required fields
  // 2. Check the optional fields
  // 3. Lookup the order
  // 4. Verify token
  // 5. Update

  // 1. Check the required fields
  const { payload, headers: { token } } = data;
  const id = typeof payload.id === 'string' && payload.id.trim().length === 20 ? payload.id.trim() : false;

  if (id) {
    // 2. Check optional fields
    const list = typeof payload.list === 'object' && Array.isArray(payload.list) && payload.list.length > 0 ? payload.list : false;

    if (list) {
      // 3. Lookup the order
      _data.read(SHOPING_CART_DIR, id, (err, orderData) => {
        if (!err && orderData) {
          // 4. Verify token
          verifyToken(token, orderData.email, (verified) => {
            if (verified) {
              // Validation product
              const productList = MENU.filter(item => list.map(l => l.id).includes(item.id));

              if (productList.length === list.length) {

                // 5. Update
                const newOrderData = Object.assign({}, orderData, { list });

                _data.update(SHOPING_CART_DIR, id, newOrderData, (updateErr) => {
                  if (!updateErr) {
                    callback(200);
                  } else {
                    callback(500, { error: 'Could not update specified order' });
                  }
                });
              } else {
                callback(400, { error: 'Fake product is detected' });
              }

            } else {
              callback(400, { error: 'Missing required token in the header, or token is invalid' });
            }
          });
        } else {
          callback(400, { error: 'Could not find specified order' });
        }
      });
    } else {
      callback(400, { error: 'Nothing to update' });
    }
  } else {
    callback(400, { error: 'Missing required fields' });
  }

};

/**
 * Orders - delete
 * Required data: id
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {token: string}; payload:{id: string;}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
shopingCart.delete = (data, callback) => {
  // 1. Check required data
  // 2. Lookup the order
  // 3. Make sure the token is not expired
  // 4. Delete

  // 1. Check required data
  const { payload, headers: { token } } = data;
  const id = typeof payload.id === 'string' && payload.id.trim().length === 20 ? payload.id.trim() : false;

  if (id) {
    // 2. Lookup the order
    _data.read(SHOPING_CART_DIR, id, (err, orderData) => {
      if (!err && orderData) {
        // 3. Make sure the token is not expired
        verifyToken(token, orderData.email, (verified) => {
          if (verified) {
            // 4. Delete
            _data.delete(SHOPING_CART_DIR, id, (deleteErr) => {
              if (!deleteErr) {

                // Delete from user orders list
                _data.read(USERS_DIR, orderData.email, (readErr, userData) => {
                  if (!readErr && userData) {
                    if (Array.isArray(userData.orders)) {
                      userData.orders = userData.orders.filter(orderId => orderId !== orderData.id);
                    }

                    _data.update(USERS_DIR, orderData.email, userData, (updateErr) => {
                      if (!updateErr) {
                        callback(200);
                      } else {
                        callback(500);
                      }
                    });
                  } else {
                    callback(500);
                  }
                });

              } else {
                callback(500, { error: 'Could not delete the specified order' });
              }
            })
          } else {
            callback(400, { error: 'Missing required token in header, or token is invalid' });
          }
        });
      } else {
        callback(400, { error: 'Could not find specified order' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
}

// Export module
module.exports = shopingCart;

