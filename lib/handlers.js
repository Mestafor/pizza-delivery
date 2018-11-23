/**
 * Handlers
 */

// Dependencies
const apiHandlers = require('./handlers/apiHandlers');
const helpers = require('./helpers');

// Container for all the handlers
const handlers = {
  api: {
    ...apiHandlers
  }
};

/**
 * Not found handler
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.notFound = (data, callback) => {
  callback(404);
};

/**
 * Not found handler
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.index = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && ['get'].includes(data.method) ? data.method : false;

  if (method) {
    helpers.getTemplate('index', (err, indexData) => {
      if (!err && indexData) {
        callback(200, indexData, 'html');
      } else {
        callback(500, { error: err });
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }

};

// Export module
module.exports = handlers;
