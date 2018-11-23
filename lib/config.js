/**
 * Create and export configuration variables
 */

// Dependencies
const secureData = require('../.env');
const path = require('path');

// secureData === {
//   stripeAPI: {
//     authToken: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'
//   },
//   mailGun: {
//     apiKey: 'api:423423.......',
//     from: 'Mailgun Sandbox <postmaster@san........mailgun.org>'
//   }
// };

// Container for all enviroments
const enviroments = {};

// Staging (default) enviroment
enviroments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'fte%^8=F+6:qS&}h',
  publicAssets: {
    publicAssetsDir: path.join(`${__dirname}`, '../public/'),
  },
  templateGlobals: {
    templatesDir: path.join(`${__dirname}`, '../templates/'),
    appName: 'Pizza-delivery',
    companyName: 'Not A real Company',
    yearCreated: 2018,
    baseUrl: 'http://localhost:3000/',
  },
  ...secureData
}

// Production enviroment
enviroments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'staging',
  hashingSecret: '%JSk)QGrdQ#=n+Fng6b{',
  publicAssets: {
    publicAssetsDir: path.join(`${__dirname}`, '../public/'),
  },
  templateGlobals: {
    templatesDir: path.join(`${__dirname}`, '../templates/'),
    appName: 'Pizza-delivery',
    companyName: 'Not A real Company',
    yearCreated: 2018,
    baseUrl: 'http://localhost:3000/',
  },
  ...secureData
}

const enviromentToExport = process.env['NODE_ENV'] && process.env['NODE_ENV'] == 'production'
  ? enviroments.production
  : enviroments.staging;

// Export enviroment
module.exports = enviromentToExport;
