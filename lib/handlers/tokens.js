/**
 * Tokens
 */

// Dependencies
const helpers = require('../helpers');
const _data = require('../data');
const { USERS_DIR, TOKENS_DIR } = require('../constants');

// Container for all tokens method
const tokens = {};

/**
 * Token - post
 * Required data: email, password
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload:{email: string; password: string}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
tokens.post = (data, callback) => {
  // 1. Check required field
  // 2. Get user by email
  // 3. Check password
  // 4. Create token

  // 1. Check required field
  const { payload } = data;
  const email = typeof payload.email === 'string' ? payload.email : false;
  const password = typeof payload.password === 'string' ? payload.password : false;

  if (email && password) {

    // 2. Get user by email
    _data.read(USERS_DIR, email, (error, userData) => {
      if (!error && userData) {

        // 3. Check password
        const hashedPwd = helpers.hash(password);

        if (hashedPwd === userData.password) {

          // .4 Create token
          const tokenId = helpers.createRandomString(20);

          if (tokenId) {
            const expires = Date.now() + 1000 * 60 * 60;

            const tokenData = {
              id: tokenId,
              email,
              expires
            }

            _data.create(TOKENS_DIR, tokenId, tokenData, (tokenErr) => {
              if (!tokenErr) {
                callback(200, tokenData);
              } else {
                callback(500, { callback: 'Could not create the new token' });
              }
            });
          } else {
            callback(500, { error: 'Could not create token id' });
          }

        } else {
          callback(400, { error: 'Password does not match with the specified user\'s stored password' });
        }

      } else {
        callback(400, { error: 'Could not find the specified user' });
      }
    });

  } else {
    callback(400, { error: 'Missing require fields' });
  }

};

/**
 * Token - get
 * Required data: id
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {id: string}; method: string; headers: {token: string}; payload:{}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
tokens.get = (data, callback) => {
  // 1. Check required fields
  // 2. Lookup the specified token

  // 1. Check required fields
  const { queryStringObject, headers: { token } } = data;
  const id = typeof queryStringObject.id === 'string' && queryStringObject.id.trim().length === 20 ? queryStringObject.id : false;

  if (id) {
    // 2. lookup the specified token
    _data.read(TOKENS_DIR, id, (err, tokenData) => {
      if (!err && tokenData) {
        tokens.verifyToken(token, tokenData.email, (verified) => {
          if (verified) {
            callback(200, tokenData);
          } else {
            callback(400, { error: 'Missing required token in header, or token is invalid' });
          }
        });
      } else {
        callback(400, { error: 'Could not find the specified token' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

/**
 * Token - put
 * Required data: id, extend
 * Optional data: none
 * Questions: 
 * 1. Why we need 'extend' field here?
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {token: string}; payload:{id: string}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
tokens.put = (data, callback) => {
  // 1. Check required fields
  // 2. Lookup the specified token
  // 3. make sure the token is not already expired
  // 4. Update expire field

  // 1. Check required fields
  const { payload, headers: { token } } = data;
  const id = typeof payload.id === 'string' && payload.id.trim().length === 20 ? payload.id : false;
  const extend = typeof payload.extend === 'boolean' && payload.extend === true;

  if (id && extend) {
    // 2. Lookup the specified token
    _data.read(TOKENS_DIR, id, (readError, tokenData) => {
      if (!readError && tokenData) {
        // Make sure the user is owner of this token
        tokens.verifyToken(token, tokenData.email, (verified) => {
          if (verified) {
            // 3. Make sure the specified token is not already expired
            if (tokenData.expires > Date.now()) {
              // 4. Update expire field
              const newExpires = Date.now() + 1000 * 60 * 60;
              tokenData.expires = newExpires;

              _data.update(TOKENS_DIR, id, tokenData, (updateError) => {
                if (!updateError) {
                  callback(200);
                } else {
                  callback(500, { error: 'Could not update the specified token' });
                }
              });
            } else {
              callback(400, { error: 'The token has already expanded, and cannot be extended' });
            }
          } else {
            callback(400, { error: 'Missing reqired token in the headers, or token is invalid' });
          }
        });
      } else {
        callback(400, { error: 'Could not find the specified token' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

/**
 * Token - delete
 * Required data: id
 * Optional data: none
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {token: string}; payload:{id: string}}} data 
 * @param {(statusCode: string, payload: object) => void} callback 
 */
tokens.delete = (data, callback) => {
  // 1. Check required fields
  // 2. Check if token is exist
  // 3. Delete the specified token

  // 1. Check required fields
  const { payload, headers: {token} } = data;
  const id = typeof payload.id === 'string' && payload.id.trim().length === 20 ? payload.id : false;

  if (id) {
    // .2 Check if token is exist
    _data.read(TOKENS_DIR, id, (err, tokenData) => {
      if (!err && tokenData) {
        // Make sure the user is owner of this token
        tokens.verifyToken(token, tokenData.email, (verified) => {
          if (verified) {
            // .3 Delete the specified token
            _data.delete(TOKENS_DIR, id, (deleteError) => {
              if (!deleteError) {
                callback(200);
              } else {
                callback(500, { error: 'Could not delete the specified token' });
              }
            });
          } else {
            callback(400, { error: 'Missing required token in the headers, or token is invalid' });
          }
        });
      } else {
        callback(400, { error: 'Could not find specified token' });
      }
    });
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

/**
 * Verify if a given token id is currently valid for a given user
 * Required data: id, email
 * Optional data: none
 * @param {string} id
 * @param {string} email 
 * @param {(verified: boolean) => void} callback 
 */
tokens.verifyToken = (id, email, callback) => {
  // 1. Lookup the specified token
  // 2. Make sure the specified token is not expired

  // 1. Lookup the specified token
  _data.read(TOKENS_DIR, id, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.expires > Date.now() && tokenData.email === email) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Export modules
module.exports = tokens;
