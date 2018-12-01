/**
 * Server related tasks
 */

// Dependencies
const url = require('url');
const http = require('http');
const config = require('./config');
const { StringDecoder } = require('string_decoder');
const helpers = require('./helpers');
const router = require('./router');
const handlers = require('./handlers');

/**
 1) Instantiate the server module
 2) Unified server for http/s
  2.1) Parse url
  2.2) Get path
  2.3) Get method
  2.4) Get headers
  2.5) Get stream data from request in utf-8
  2.6) Check if path exist in router
  2.7) Send response
 3) Start HTTP server
 4) Options for HTTPS server
 5) Start HTTPS server
 */

// Instantiate the server module object
const server = {};

server.router = router;

server.unifiedServer = (req, res) => {
  // Get url and parse it
  const parsedUrl = url.parse(req.url, true);
  const trimedPath = parsedUrl
    .pathname
    .replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get HTTP/S method
  const method = req.method.toLocaleLowerCase();

  // Get the header as an object
  const { headers } = req;

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // Choose handlet this request should go to. If one is not found, use the notFound handler.
    let choosenHandler = typeof server.router[trimedPath] !== 'undefined'
      ? server.router[trimedPath]
      : handlers.notFound;

    if (trimedPath.indexOf('public') > -1) {
      choosenHandler = server.router['public'];
    }

    // Construct the data object to send to the handler
    const data = {
      trimedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer)
    }

    // Route to the request to the handler specified in the router
    choosenHandler(data, (statusCode, payload, contentType) => {
      // Determine the type of response (fallback to JSON)
      const _contentType = typeof contentType === 'string' ? contentType : 'json';

      // Use the status code called back by handler, or default to 200
      const localStatusCode = typeof statusCode === 'number'
        ? statusCode
        : 200;

      // Conver the payload to the string
      let payloadString = '';

      // Switch to the content type
      switch (_contentType) {

        case 'json': {
          // Set header to response
          res.setHeader('Content-type', 'application/json');

          // Use the payload called back by handler, or default to an empty object
          const localPayload = typeof payload === 'object'
            ? payload
            : {};

          // Conver the payload to the string
          payloadString = JSON.stringify(localPayload);
          break;
        }

        case 'html': {
          // Set header to response
          res.setHeader('Content-type', 'text/html');
          payloadString = typeof payload === 'string' ? payload : '';
          break;
        }

        case 'favicon': {
          res.setHeader('Content-type', 'image/x-icon');
          payloadString = typeof payload !== 'undefined' ? payload : '';
          break;
        }

        case 'css': {
          res.setHeader('Content-type', 'text/css');
          payloadString = typeof payload !== 'undefined' ? payload : '';
          break;
        }

        case 'png': {
          res.setHeader('Content-type', 'image/png');
          payloadString = typeof payload !== 'undefined' ? payload : '';
          break;
        }

        case 'jpg': {
          res.setHeader('Content-type', 'image/jpeg');
          payloadString = typeof payload !== 'undefined' ? payload : '';
          break;
        }

        default: {
          res.setHeader('Content-type', 'text/plain');
          payloadString = typeof payload !== 'undefined' ? payload : '';
        }

      }

      // Return the response
      res.writeHead(localStatusCode);

      // Send the response
      res.end(payloadString);
    });

  });

}

// Start the http server
server.httpServer = http.createServer(server.unifiedServer);

server.init = (req, res) => {
  // Start HTTP server
  server.httpServer.listen(config.httpPort, () => {
    console.log('\x1b[36m%s\x1b[0m', `The server is listening on port ${config.httpPort} in ${config.envName} mode`);
  });
}

// Export module
module.exports = server;