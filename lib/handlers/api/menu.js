/**
 * Menu
 */

// Dependencies
const { MENU } = require('../../constants');
const { verifyToken } = require('./tokens');
const _data = require('../../data');
const { TOKENS_DIR } = require('../../constants');

// Container for menu methods
const menu = {};


/**
 * Menu - get
 * Required data: none
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {email: string}; method: string; headers: {token: string}; payload:{}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
menu.get = (data, callback) => {

  // 1. Check rquired fields
  // 2. Make sure the token is not expired
  // 3. Return menu

  // 1. Check required fields
  const { queryStringObject, headers: { token } } = data;
  // const email = typeof queryStringObject.email === 'string' ? queryStringObject.email : false;

  // Lookup the specified token
  _data.read(`${TOKENS_DIR}`, token, (err, tokenData) => {
    if (!err && tokenData) {
      const email = tokenData.email;

      if (email) {
        // 2. Make sure the token is not expired
        verifyToken(token, email, (verified) => {
          if (verified) {
            // 3. Return menu
            callback(200, MENU);
          } else {
            callback(400, { error: 'Missing required token in header, or token is invalid' })
          }
        });
      } else {
        callback(400, { error: 'Missing required fields' });
      }
    } else {
      callback(403, { error: 'Could not find the specified token' });
    }
  });

}

// Export module
module.exports = menu;
