/**
 * Menu
 */

// Dependencies
const _performance = require('perf_hooks').performance;
const util = require('util');
const debug = util.debuglog('performance');
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

  _performance.mark('beginning');

  // 1. Check rquired fields
  // 2. Make sure the token is not expired
  // 3. Return menu

  // 1. Check required fields
  const { headers: { token } } = data;
  _performance.mark('get token from headers');

  // Lookup the specified token
  _performance.mark('beginning lookup the token');
  _data.read(`${TOKENS_DIR}`, token, (err, tokenData) => {
    _performance.mark('lookup the token complete');

    if (!err && tokenData) {
      const email = tokenData.email;

      if (email) {
        // 2. Make sure the token is not expired
        _performance.mark('beginning verify the token');
        verifyToken(token, email, (verified) => {
          _performance.mark('verify the token complete');

          // Gather all the measurements
          _performance.measure('Beginning to end', 'beginning', 'verify the token complete');
          _performance.measure('Get token from headers', 'beginning', 'get token from headers');
          _performance.measure('Lookup the token', 'beginning lookup the token', 'lookup the token complete');
          _performance.measure('Verify the token', 'beginning verify the token', 'verify the token complete');

          _performance.getEntriesByType('measure').forEach(measure => {
            debug('\x1b[33m%s: %f\x1b[0m', measure.name, measure.duration);
          });

          _performance.clearMeasures();

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
