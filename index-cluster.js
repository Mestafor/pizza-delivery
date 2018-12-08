/**
 * Primary file for the API
 */

// Dependencies
const cluster = require('cluster');
const os = require('os');
const server = require('./lib/server');
const cli = require('./lib/cli');

// Declare the app
const app = {};

// Init function
app.init = () => {

  if (cluster.isMaster) {
    // If cluster is master, start CLI API
    setTimeout(() => {
      cli.init();
    }, 50);

    for (let i = 0, cpuLength = os.cpus().length; i < cpuLength; i++) {
      cluster.fork();
    }
  } else {
    // If cluster is not master, start the server
    server.init();
  }
};

// Execute
app.init();

// Export the app
module.exports = app;
