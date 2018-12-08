/**
 * Primary file for the API
 */

// Dependencies
const server = require('./lib/server');
const cli = require('./lib/cli');

// Declare the app
const app = {};

// Init function
app.init = () => {
  // Start the server
  server.init();

  // Start CLI API
  setTimeout(() => {
    cli.init();
  }, 50)
};

// Self invoking only if required directly
if (require.main === module) {
  app.init();
}

// Export the app
module.exports = app;
