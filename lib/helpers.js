/**
 * Helpers for various tasks
 */

// Dependencies
const https = require('https');
const crypto = require('crypto');
const config = require('./config');

// Container for all the helpers
const helpers = {}

/**
 * Parse string to the object, on error return empty object
 * @param {string} string
 * @return {object} 
 */
helpers.parseJsonToObject = (string) => {
  try {
    return JSON.parse(string);
  } catch (e) {
    return {};
  }
}

/**
 * Create the SHA256 hash
 * @param {string} str
 * @return {string}
 */
helpers.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
  }

  return false;
};

/**
 * Create random string
 * @param {number} strLength 
 * @return {string | boolean}
 */
helpers.createRandomString = (strLength) => {
  const length = typeof strLength === 'number' && strLength > 0 ? strLength : false;
  if (length) {
    const possibleCharacters = 'absdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for (let i = 0; i < length; i++) {
      // Get a random charackter from the possible characters string
      const randomCharacter = possibleCharacters
        .charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the final string
      str += randomCharacter;
    }

    // Return final string
    return str;
  }

  return false;
}

/**
 * Use Stripe’s API to process charges.
 * Required fields: amount, currency, source
 * Optional fields: description
 * @param {{amount: number; currency: string; description: string; source: string}} param
 * @param {(error: boolean | string) => void} callback
 * @return {void}
 */
helpers.stripeCharges = ({ amount, currency, description, source }, callback) => {
  // curl https://api.stripe.com/v1/charges \
  //  -u sk_test_4eC39HqLyjWDarjtT1zdp7dc: \
  //  -d amount=999 \
  //  -d currency=usd \
  //  -d description="Example charge" \
  //  -d source=tok_visa

  // Check required fields
  const _amount = typeof amount === 'number' && amount > 0 ? amount : false;
  const _currency = typeof currency === 'string' ? currency : false;
  const _source = typeof source === 'string' ? source : false;

  // Check optional fields
  const _description = typeof description === 'string' ? description : 'Default text';

  if (_amount && _currency && _source) {
    // const postData = {
    //   amount: _amount,
    //   currency: _currency,
    //   description: _description,
    //   source: _source
    // };

    var dataString = `amount=${_amount}&currency=${_currency}&description=${_description}&source=${_source}`;

    var options = {
      protocol: 'https:',
      hostname: 'api.stripe.com',
      path: '/v1/charges',
      method: 'POST',
      body: dataString,
      auth: config.stripeAPI.authToken,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 'Content-Length': Buffer.byteLength(JSON.stringify(postData)),
      },
    };

    // Instantiate the request object
    const req = https.request(options, (res) => {
      // Grab the status of the sent request
      const status = res.statusCode;
      // Callback successfully if the request went through
      if (status === 200 || status === 201) {

        let buffer = '';
        res.on('data', (data) => {
          buffer += data;
        });

        res.on('end', () => {

          callback(false, JSON.parse(buffer));
        });

      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    req.on('error', (e) => {
      callback(e);
    });

    // write data to request body
    req.write(dataString);
    req.end();

  } else {
    callback('Requred fields where missing or invalid');
  }

}

/**
 * MailGun API send email
 * @param {{to: string; subject: string; text: string}} param
 * @param {(err: string | boolean) => void} callback 
 */
helpers.sendReceiptToEmail = ({ to, subject, text, html }, callback) => {

  const _to = typeof to === 'string' ? to : false;
  const _subject = typeof subject === 'string' ? subject : false;
  const _text = typeof text === 'string' ? text : false;

  if (_to && _subject && _text) {
    const dataString = `from=${config.mailGun.from}&to=${_to}&subject=${_subject}&html=${_text}`;

    const options = {
      protocol: 'https:',
      hostname: 'api.mailgun.net',
      path: '/v3/sandbox0dfbe77ab70347789d7fa4b8df8571e6.mailgun.org/messages',
      method: 'POST',
      auth: config.mailGun.apiKey,
      body: dataString,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 'Content-Length': Buffer.byteLength(JSON.stringify(postData)),
      },
    };
    
    // Instantiate the request object
    const req = https.request(options, (res) => {
      // Grab the status of the sent request
      const status = res.statusCode;
      // Callback successfully if the request went through
      if (status === 200 || status === 201) {

        let buffer = '';
        res.on('data', (data) => {
          buffer += data;
        });

        res.on('end', () => {
          callback(false, JSON.parse(buffer));
        });

      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    req.on('error', (e) => {
      callback(e);
    });

    // write data to request body
    req.write(dataString);
    req.end();
  } else {
    callback('Required params where missing or invalid');
  }

}

// Export module
module.exports = helpers;
