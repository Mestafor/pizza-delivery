/**
 * CLI-Related Tasks
 */

// Dependencies
const fs = require('fs');
const readline = require('readline');
const EventEmmiter = require('events');
class _EventEmmiter extends EventEmmiter { };
const e = new _EventEmmiter();
const { MENU, ORDERS_DIR, USERS_DIR, TOKENS_DIR } = require('./constants');
const _data = require('./data');

// container for cli methods
const cli = {};

/**
 * Horizontal line wit specified char or string, default "-"
 * @param {String} str 
 */
cli.horizontalLine = (str) => {
  const _str = typeof str === 'string' && str.trim().length > 0 ? str : '-';

  // Get the available screen size
  const width = process.stdout.columns;

  let line = '';
  for (let i = 0; i < width; i++) {
    line += _str;
  }

  console.log(line);
}

/**
 * Centered the string in the output screen
 * @param {string} str 
 */
cli.centered = (str) => {
  const _str = typeof str === 'string' && str.trim().length > 0 ? str : '';

  // Get the available screen size
  const width = process.stdout.columns;

  const leftPadding = (width - _str.length) / 2;
  let line = '';
  for (let i = 0; i < leftPadding; i++) {
    line += ' ';
  }
  line += _str;
  console.log(line);
}

/**
 * Add lines
 * @param {number} lines 
 */
cli.verticalSpace = (lines) => {
  const _lines = typeof lines === 'number' && lines > 0 ? lines : 1;
  for (let i = 0; i < _lines; i++) {
    console.log('');
  }
}

// Initialize events
e.on('man', (str) => {
  cli.responders.help();
});

e.on('help', (str) => {
  cli.responders.help();
});

e.on('exit', (str) => {
  cli.responders.exit();
});

e.on('list menu', (str) => {
  cli.responders.listMenu();
});

e.on('list orders', (str) => {
  cli.responders.listOrders();
});

e.on('more order info', (str) => {
  cli.responders.moreOrderInfo(str);
});

e.on('list users', (str) => {
  cli.responders.listUsers();
});

e.on('more user info', (str) => {
  cli.responders.moreUserInfo(str);
});

// Responders object
cli.responders = {};

/**
 * Show man / help page
 */
cli.responders.help = () => {
  // Available commands
  const commands = {
    'man': 'Show this help page',
    'help': 'Aliace to the "man" command',
    'exit': 'Kill the CLI (and rest of application)',
    'list menu': 'Show all the current menu items',
    'list orders': 'Show all the recent orders in the system (orders placed in the last 24 hours)',
    'more order info --{orderId}': 'Show the details of a specific order by order ID',
    'list users': 'Show all the users who have signed up in the last 24 hours',
    'more user info --{userEmail}': 'Show the details of a specific user by email address',
  };

  cli.horizontalLine();
  cli.centered('MAN / HELP');
  cli.horizontalLine();
  cli.verticalSpace(2);


  Object.entries(commands)
    .forEach(([key, value]) => {
      let line = `\x1b[33m${key}\x1b[0m`;
      for (let i = 0, length = 60 - key.length; i < length; i++) {
        line += ' ';
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    });
};

/**
 * Kill CLI
 */
cli.responders.exit = () => {
  process.exit(0);
}

/**
 * List menu
 */
cli.responders.listMenu = () => {
  if (MENU instanceof Array) {
    cli.horizontalLine();
    cli.centered('MENU');
    cli.horizontalLine();
    cli.verticalSpace();
    const showKey = ['id', 'name', 'price', 'description'];
    for (let i = 0, length = MENU.length; i < length; i++) {
      let line = '';
      Object.entries(MENU[i])
        .forEach(([key, value]) => {
          if (showKey.includes(key)) {
            line += `\x1b[33m${key.toUpperCase()}:\x1b[0m ${value} `;
          }
        });
      console.log(line);
      cli.verticalSpace();
    }
  }
}

/**
 * Show all orders maked in last 24 hours
 */
cli.responders.listOrders = () => {
  _data.list(ORDERS_DIR, (err, data) => {
    if (!err && data && data.length > 0) {
      cli.verticalSpace();
      cli.horizontalLine();
      cli.centered('Orders List (orders placed in the last 24 hours)');
      cli.horizontalLine();
      cli.verticalSpace();
      const showKey = ['id', 'email', 'price', 'curency'];
      data.forEach(fileName => {
        // Lookup specified order
        _data.read(ORDERS_DIR, fileName, (err, fileData) => {
          if (!err && fileData) {
            const fileCreate = fileData.timestamp;
            const _24hours = 24 * 60 * 60 * 1000;
            const now = Date.now();
            // Check if orders is not older 24 hours
            if ((now - fileCreate) < _24hours) {
              let line = '';
              Object.entries(fileData)
                .forEach(([key, value]) => {
                  if (showKey.includes(key)) {
                    line += `\x1b[33m${key.toUpperCase()}:\x1b[0m ${value} `;
                  }
                });
              console.log(line);
              cli.verticalSpace();
            }
          }
        });
      });
    }
  });
}

/**
 * Show more information about order by ID
 */
cli.responders.moreOrderInfo = (str) => {
  const arr = str.split('--');
  const orderId = typeof arr[1] === 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

  if (orderId) {
    cli.horizontalLine();
    cli.centered(`Order - ${orderId}`);
    cli.horizontalLine();
    cli.verticalSpace();
    _data.read(ORDERS_DIR, orderId, (err, orderData) => {
      if (!err && orderData) {
        console.dir(orderData, { colors: true });
        cli.verticalSpace();
      }
    });
  }
}

/**
 * Show all users who signed up in last 24 hours
 */
cli.responders.listUsers = () => {
  // Use token to find users who signed up in the last 24 hours
  _data.list(TOKENS_DIR, (err, list) => {
    const validTokenArray = [];
    const _24hours = 24 * 60 * 60 * 1000;
    let checkedToken = 0;

    if (!err && list && list.length > 0) {
      list.forEach((fileName) => {
        _data.read(TOKENS_DIR, fileName, (readErr, tokenData) => {
          checkedToken++;

          // Get latest users tokens
          if (!readErr && tokenData) {
            const now = Date.now();

            const _expires = typeof tokenData.expires === 'number' ? tokenData.expires : false;

            if (_expires) {
              // Check if token lifetime is less then 24 hours
              if ((now - tokenData.expires) < _24hours) {
                if (!validTokenArray.some(token => token.email === tokenData.email)) {
                  // Add only once
                  validTokenArray.push(tokenData);
                }
              }
            }
          }

          // After checking all tokens, show all user signed up in the last 24 hours
          if (checkedToken === list.length) {
            cli.verticalSpace();
            cli.horizontalLine();
            cli.centered('Users List (signed up in the last 24 hours)');
            cli.horizontalLine();
            cli.verticalSpace();

            validTokenArray.forEach(token => {
              // Lookup user to show
              _data.read(USERS_DIR, token.email, (userErr, userData) => {
                const showKey = ['name', 'email', 'street'];

                let line = '';
                Object.entries(userData)
                  .forEach(([key, value]) => {
                    if (showKey.includes(key)) {
                      line += `\x1b[33m${key.toUpperCase()}:\x1b[0m ${value} `;
                    }
                  });
                console.log(line);
                cli.verticalSpace();
              });
            });
          }

        });
      });
    }
  });
};

/**
 * Show more information about user
 */
cli.responders.moreUserInfo = (str) => {
  const arr = str.split('--');
  const userEmail = typeof arr[1] === 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

  if (userEmail) {
    _data.read(USERS_DIR, userEmail, (err, userData) => {
      if (!err && userData) {
        cli.horizontalLine()
        cli.centered(`User - ${userEmail}`);
        cli.horizontalLine()
        cli.verticalSpace();
        delete userData.password;
        console.dir(userData, { colors: true });
        cli.verticalSpace();

      }
    });
  }
};

/**
 * Input process
 * @param {string} str 
 */
cli.processInput = (str) => {
  const _str = typeof str === 'string' && str.trim().length > 0 ? str.trim() : false;

  // Only process the input if the user actually wrote something. Otherwise ignore.
  if (_str) {
    // Codify the unique strings, that identify the unique questions allowed to be asked
    const uniqueInputs = [
      'man',
      'help',
      'exit',
      'list menu',
      'list orders',
      'more order info',
      'list users',
      'more user info'
    ];

    // Go throug the possible inputs, emit event when a match is found
    const matchFound = uniqueInputs.some((input) => {
      if (str.includes(input)) {
        e.emit(input, str);

        return true;
      }

      return false;
    });

    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log('Sorry, try again');
    }
  }
};

/**
 * Init script
 */
cli.init = () => {
  // Send the start message to the console, in datk blue
  console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

  // Start the readline
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle of each line of input separetly
  _interface.on('line', (str) => {

    // Send to the input processor
    cli.processInput(str);

    // re-initilize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process
  _interface.on('close', () => {
    process.exit(0);
  });
};

// Export module
module.exports = cli;
