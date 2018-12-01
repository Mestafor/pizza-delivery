/**
 * User handlers
 */

// Dependencies
const _data = require('../../data');
const helpers = require('../../helpers');
const { USERS_DIR, TOKENS_DIR, ORDERS_DIR, SHOPING_CART_DIR } = require('../../constants');
const { verifyToken } = require('./tokens');

// Container for user's handlers
const users = {};

/**
 * User - post
 * Required data: name, email, streetAddr, password
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload:{name:string; email: string; street: string; password: string}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
users.post = (data, callback) => {
  // Get payload data
  const { payload } = data;

  // Check that all required fields are filled out
  const name = typeof payload.name === 'string' ? payload.name : false;
  const email = typeof payload.email === 'string' ? payload.email : false;
  const street = typeof payload.street === 'string' ? payload.street : false;
  const password = typeof payload.password === 'string' ? payload.password : false;

  if (name && email && street && password) {

    //Make sure that the user does not already exist
    _data.read(USERS_DIR, email, (readErr) => {
      if (readErr) {
        // Create hashed password
        const hashedPwd = helpers.hash(password);

        if (hashedPwd) {
          // Create user
          _data.create(USERS_DIR, email, { name, email, street, password: hashedPwd }, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { error: 'Could not create the user' });
            }
          });
        } else {
          callback(400, { error: 'Could not hashed the user\'s password' });
        }
      } else {
        callback(400, { error: 'User already exist' });
      }
    });
  }
  else {
    callback(400, { error: 'Missing required fields' });
  }

};

/**
 * User - get
 * Required data: email
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {email: string}; method: string; headers: {token: string}; payload: {}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
users.get = (data, callback) => {
  // Check required field
  const { queryStringObject: payload, headers } = data;
  const email = typeof payload.email === 'string' ? payload.email : false;

  if (email) {
    // Verify the token is valid for the email
    const { token } = headers;

    verifyToken(token, email, (verified) => {
      if (verified) {
        // Get user data
        _data.read(USERS_DIR, email, (err, userData) => {
          if (!err && userData) {
            const newUserData = JSON.parse(JSON.stringify(userData));
            delete newUserData.password;
            callback(200, newUserData);
          } else {
            callback(500, { error: 'User could not exist yet' });
          }
        });
      } else {
        callback(400, { error: 'Missing required token in the header, or token is invalid' });
      }
    });


  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

/**
 * User - put
 * Required data: email
 * Optional data: name, street, password (at least one must be specified)
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {name:string; email: string; street: string; password: string}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
users.put = (data, callback) => {

  // Check for required fields
  const { payload, headers } = data;
  const email = typeof payload.email === 'string' ? payload.email : false;

  if (email) {

    // Check for optional fields
    const name = typeof payload.name === 'string' ? payload.name : false;
    const street = typeof payload.street === 'string' ? payload.street : false;
    const password = typeof payload.password === 'string' ? payload.password : false;

    if (name || street || password) {
      // Verify the token is valid for the email
      const { token } = headers;

      verifyToken(token, email, (verified) => {
        if (verified) {
          _data.read(USERS_DIR, email, (err, userData) => {
            if (!err && userData) {

              const newUserData = userData;

              if (name) {
                newUserData.name = name;
              }

              if (street) {
                newUserData.street = street;
              }

              if (password) {
                const hashedPwd = helpers.hash(password);
                if (hashedPwd) {
                  newUserData.password = hashedPwd;
                }
              }

              // Write new data to the user
              _data.update(USERS_DIR, email, newUserData, (updateerror) => {
                if (!updateerror) {
                  callback(200);
                } else {
                  callback(500, { error: 'Could not update the user' });
                }
              });

            } else {
              callback(500, { error: 'Could not fint the user' });
            }
          });

        } else {
          callback(400, { error: 'Missing require token in the header, or token is invalid' });
        }
      });

    } else {
      callback(400, { error: 'Missing fields to update' });
    }

  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

/**
 * User - delete
 * Required data: email
 * Optional data: none
 * @TODO Clenup (delete) any other data files associated with this user
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {email: string;}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
users.delete = (data, callback) => {

  // Check reqired field
  const { payload, headers } = data;
  const email = typeof payload.email === 'string' ? payload.email : false;

  if (email) {

    // Verify the token is valid for the email
    const { token } = headers;

    verifyToken(token, email, (verified) => {
      if (verified) {
        // Lookup the specified user
        _data.read(USERS_DIR, email, (userReadErr, userData) => {
          if (!userReadErr && userData) {
            _data.delete(USERS_DIR, email, (err) => {
              if (!err) {

                let hasError = false;

                // When send callback 200?
                // @TODO - delete all tokens
                _data.list(TOKENS_DIR, (tokenListErr, tokensList) => {
                  if (!tokenListErr && tokensList.length > 0) {
                    tokensList.forEach(token => {
                      _data.read(TOKENS_DIR, token, (tokenReadErr, tokenData) => {
                        if (!tokenReadErr && tokenData) {

                          if (tokenData.email === email) {
                            _data.delete(TOKENS_DIR, token, (tokenDeleteErr) => {
                              if (tokenDeleteErr) {
                                hasError = true;
                              }
                            });
                          }
                        } else {
                          hasError = true;
                        }
                      });
                    });
                  }
                });

                // delete all orders
                if (Array.isArray(userData.orders) && userData.orders.length > 0) {
                  userData.orders.forEach(order => {
                    _data.delete(ORDERS_DIR, order, (orderDeleteErr) => {
                      if (orderDeleteErr) {
                        hasError = true;
                      }
                    });
                  });
                }

                // delete all shoping cart
                if (Array.isArray(userData.shopingCart) && userData.shopingCart.length > 0) {
                  userData.shopingCart.forEach(cart => {
                    _data.delete(SHOPING_CART_DIR, cart, (cartDeleteErr) => {
                      if (cartDeleteErr) {
                        hasError = true;
                      }
                    });
                  });
                }

                if (!hasError) {
                  callback(200);
                } else {
                  callback(500, { error: 'Errors encountered while attempting to delete all of the users files. All users files may not have been deleted from the system successfully' });
                }

              } else {
                callback(500, { error: 'Could not delete the specified user' });
              }
            });
          } else {
            callback(400, { error: 'Could not fint specified user' });
          }
        });

      } else {
        callback(400, { error: 'Missing require token in the header, or token is invalid' });
      }
    });

  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// Container for user orders
users.orders = {}

/**
 * User.orders - get
 * Required data: email
 * Optional data: none
 * @TODO Clenup (delete) any other data files associated with this user
 * @param {{trimedPath: string; queryStringObject: {email: string}; method: string; headers: {token: string}; payload: {}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
users.orders.get = (data, callback) => {
  // Check required field
  const { queryStringObject, headers: { token } } = data;
  const email = typeof queryStringObject.email === 'string' ? queryStringObject.email : false;

  if (email) {

    // Check required token in header
    verifyToken(token, email, (verified) => {
      if (verified) {

        // Lookup user data
        _data.read(USERS_DIR, email, async (userErr, userData) => {
          if (!userErr && userData) {
            // Lookup orders
            const ordersList = userData.orders;

            if (typeof ordersList === 'object' && Array.isArray(ordersList)) {
              const list = [];

              for (var i = 0, length = ordersList.length; i < length; i++) {
                await new Promise((resolve, reject) => {
                  _data.read(ORDERS_DIR, ordersList[i], (orderError, orderData) => {
                    if (!orderError && orderData) {

                      // Delete unused data
                      delete orderData.email;
                      delete orderData.list;

                      resolve(orderData);
                    } else {
                      reject(orderError);
                    }
                  });
                })
                  .then(data => {
                    list.push(data);
                  })
                  .catch(console.error);
              }

              callback(200, list);
            } else {
              callback(404, { error: 'You dont have orders yet.' });
            }
          } else {
            callback(500);
          }
        });
        // Return orders list

      } else {
        callback(404, { error: 'Missing required token in the headers, or token is invalid' });
      }
    });

  } else {
    callback(404, { error: 'Missing required fields' });
  }
}

// Export module
module.exports = users;
