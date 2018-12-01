/**
 * Orders handlers
 */

// Dependencies
const _data = require('../../data');
const helpers = require('../../helpers');
const { MENU, ORDERS_DIR, USERS_DIR, SHOPING_CART_DIR } = require('../../constants');
const { verifyToken } = require('./tokens');

// Container for all shoping cart methods
const orders = {};

/**
 * Order Model
 {
   id: string,
   timestamp: number,
   list: [
     {
       id: string,
       count: number,
       price: number,
       currency: string
     }
   ],
   price: number,
   currency: string
 }
 */

/**
 * Orders - post
 * Required data: id
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {token: string}; payload:{id: string}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
orders.post = (data, callback) => {
  // Check required fields
  const { payload, headers: { token } } = data;
  const shopingCartId = typeof payload.id === 'string' ? payload.id : false;

  if (shopingCartId) {
    // lookup the shoping catt
    _data.read(SHOPING_CART_DIR, shopingCartId, (cartError, shopingCartData) => {
      if (!cartError && shopingCartData) {
        const email = typeof shopingCartData.email === 'string' ? shopingCartData.email : false;
        const list = typeof shopingCartData.list === 'object' && Array.isArray(shopingCartData.list) && shopingCartData.list.length > 0 ? shopingCartData.list : false;
        if (email && list) {
          // lookup the user
          _data.read(USERS_DIR, email, (readErr, userData) => {
            if (!readErr && userData) {

              // Check token if is not expired
              verifyToken(token, email, (verified) => {
                if (verified) {
                  const productList = MENU.filter(item => list.map(l => l.id).includes(item.id));


                  if (productList.length === list.length) {
                    // 4. Create and write orders
                    const id = helpers.createRandomString(20);

                    const orderedMenu = [];
                    const amount = list.reduce((sum, item) => {
                      const menuIndex = MENU
                        .map(m => m.id)
                        .indexOf(item.id);

                      orderedMenu.push(Object.assign({}, MENU[menuIndex], { count: item.count }));

                      return sum + MENU[menuIndex].price * item.count;
                    }, 0);

                    const ordersData = {
                      id,
                      email,
                      list: orderedMenu,
                      timestamp: Date.now(),
                      price: amount,
                      currency: 'usd'
                    };

                    _data.create(ORDERS_DIR, id, ordersData, (err) => {
                      if (!err) {

                        // Write order id to the user
                        if (!Array.isArray(userData.orders)) {
                          userData.orders = [];
                        }

                        // 5. Add order id to user orders array
                        userData.orders.push(id);

                        _data.update(USERS_DIR, email, userData, (updateErr) => {
                          if (!updateErr) {
                            // Send payment

                            const stripeObject = {
                              amount,
                              currency: 'usd',
                              source: 'tok_visa'
                            };

                            helpers.stripeCharges(stripeObject, (chargesErr) => {
                              if (!chargesErr) {
                                // Send email 
                                helpers.sendReceiptToEmail(
                                  {
                                    to: `${userData.name} <${userData.email}>`,
                                    subject: 'Pizza-delivery receipt',
                                    text: `
                                      <h3>Receipt</h3>
                                      <b>Price:</b> ${amount} ${stripeObject.currency} <br/>
                                      <b>Ordered pizza: </b> <br/>
                                      <pre>
                                        ${JSON.stringify(orderedMenu, null, 4)}
                                      </pre>
                                      <script>
                                        alrt(1);
                                      </script>
                                    `
                                  },
                                  (e) => {
                                    if (!e) {
                                      callback(200, { message: 'Receipt sent to your email' });
                                    } else {
                                      callback(400, { error: e });
                                    }
                                  }
                                );

                              } else {
                                callback(400, { error: chargesErr });
                              }
                            });

                          } else {
                            callback(500, { error: 'Could not update order list' });
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
                  callback(400, { error: 'Missing required token in the header or token is invalid' });
                }
              });

            } else {
              callback(400, { error: 'Could not find the user' });
            }
          });
        } else {
          callback(400, { error: 'Email or list are invalid' });
        }

      } else {
        callback(400, { error: 'Could not find the specified shoping cart' });
      }
    });

  } else {
    callback(400, { error: 'Missing required field' });
  }

};

/**
 * Orders - get
 * Required data: id
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {id: string}; method: string; headers: {token: string}; payload:{}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
orders.get = (data, callback) => {
  // 1. Check required fields
  // 2. Lookup the specified order
  // 3. Make sure the token is not expired

  // 1. Check required fields
  const { queryStringObject, headers: { token } } = data;
  const id = typeof queryStringObject.id === 'string' && queryStringObject.id.trim().length === 20 ? queryStringObject.id : false;

  if (id) {
    // 2. Lookup the specified order
    _data.read(ORDERS_DIR, id, (err, orderData) => {
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

// /**
//  * Orders - put
//  * Required data: id
//  * Optional data: list
//  * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {token: string}; payload:{id: string; list: [{id: string; count: number}]}}} data 
//  * @param {(statusCode: string, payload: object) => void} callback 
//  */
// orders.put = (data, callback) => {
//   // 1. Check the required fields
//   // 2. Check the optional fields
//   // 3. Lookup the order
//   // 4. Verify token
//   // 5. Update

//   // 1. Check the required fields
//   const { payload, headers: { token } } = data;
//   const id = typeof payload.id === 'string' && payload.id.trim().length === 20 ? payload.id.trim() : false;

//   if (id) {
//     // 2. Check optional fields
//     const list = typeof payload.list === 'object' && Array.isArray(payload.list) && payload.list.length > 0 ? payload.list : false;

//     if (list) {
//       // 3. Lookup the order
//       _data.read(ORDERS_DIR, id, (err, orderData) => {
//         if (!err && orderData) {
//           // 4. Verify token
//           verifyToken(token, orderData.email, (verified) => {
//             if (verified) {
//               // Validation product
//               const productList = MENU.filter(item => list.map(l => l.id).includes(item.id));

//               if (productList.length === list.length) {

//                 // 5. Update
//                 const newOrderData = Object.assign({}, orderData, { list });

//                 _data.update(ORDERS_DIR, id, newOrderData, (updateErr) => {
//                   if (!updateErr) {
//                     callback(200);
//                   } else {
//                     callback(500, { error: 'Could not update specified order' });
//                   }
//                 });
//               } else {
//                 callback(400, { error: 'Fake product is detected' });
//               }

//             } else {
//               callback(400, { error: 'Missing required token in the header, or token is invalid' });
//             }
//           });
//         } else {
//           callback(400, { error: 'Could not find specified order' });
//         }
//       });
//     } else {
//       callback(400, { error: 'Nothing to update' });
//     }
//   } else {
//     callback(400, { error: 'Missing required fields' });
//   }

// };

// /**
//  * Orders - delete
//  * Required data: id
//  * Optional data: none
//  * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {token: string}; payload:{id: string;}}} data 
//  * @param {(statusCode: string, payload: object) => void} callback 
//  */
// orders.delete = (data, callback) => {
//   // 1. Check required data
//   // 2. Lookup the order
//   // 3. Make sure the token is not expired
//   // 4. Delete

//   // 1. Check required data
//   const { payload, headers: { token } } = data;
//   const id = typeof payload.id === 'string' && payload.id.trim().length === 20 ? payload.id.trim() : false;

//   if (id) {
//     // 2. Lookup the order
//     _data.read(ORDERS_DIR, id, (err, orderData) => {
//       if (!err && orderData) {
//         // 3. Make sure the token is not expired
//         verifyToken(token, orderData.email, (verified) => {
//           if (verified) {
//             // 4. Delete
//             _data.delete(ORDERS_DIR, id, (deleteErr) => {
//               if (!deleteErr) {

//                 // Delete from user orders list
//                 _data.read(USERS_DIR, orderData.email, (readErr, userData) => {
//                   if (!readErr && userData) {
//                     if (Array.isArray(userData.orders)) {
//                       userData.orders = userData.orders.filter(orderId => orderId !== orderData.id);
//                     }

//                     _data.update(USERS_DIR, orderData.email, userData, (updateErr) => {
//                       if (!updateErr) {
//                         callback(200);
//                       } else {
//                         callback(500);
//                       }
//                     });
//                   } else {
//                     callback(500);
//                   }
//                 });

//               } else {
//                 callback(500, { error: 'Could not delete the specified order' });
//               }
//             })
//           } else {
//             callback(400, { error: 'Missing required token in header, or token is invalid' });
//           }
//         });
//       } else {
//         callback(400, { error: 'Could not find specified order' });
//       }
//     });
//   } else {
//     callback(400, { error: 'Missing required fields' });
//   }
// }

// Export module
module.exports = orders;
