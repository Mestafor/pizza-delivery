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
 * Example error 
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.exampleError = (data, callback) => {
  const foo = bar;
  callback(200);
}

/**
 * Not found handler
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.notFound = (data, callback) => {
  callback(404);
};

/**
 * Public assets 
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.public = (data, callback) => {

  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  if (method) {
    const trimedPath = data.trimedPath;
    helpers.getStaticAssets(trimedPath, (err, fileData) => {
      if (!err && fileData) {
        let contentType = 'plain';
        if (trimedPath.indexOf('.css') > -1) {
          contentType = 'css';
        }
        else if (trimedPath.indexOf('.ico') > -1) {
          contentType = 'favicon';
        }
        else if (trimedPath.indexOf('.png') > -1) {
          contetnType = 'png';
        }
        else if (trimedPath.indexOf('.jpg') > -1) {
          contentType = 'jpg';
        }

        callback(200, fileData, contentType);

      } else {
        callback(404);
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }
};

/**
 * Get favicon 
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.favicon = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  if (method) {
    helpers.getStaticAssets('public/favicon.ico', (err, fileData) => {
      if (!err && fileData) {
        callback(200, fileData, 'favicon');
      } else {
        callback(404);
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }
};

/**
 * Index handler
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.index = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  const templateData = {
    'head.title': 'Pizza-delivery',
    'head.description': 'Description',
    'body.class': 'index app-home-page',
  };

  if (method) {
    helpers.getTemplate('index', templateData, (err, indexStr) => {
      if (!err && indexStr) {
        helpers.addUniversalTemplates(indexStr, templateData, (layoutErr, newStr) => {
          if (!layoutErr && newStr) {
            callback(200, newStr, 'html');
          } else {
            callback(500);
          }
        });
      } else {
        callback(500, { error: err });
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }

};

/**
 * Create account page
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.accountCreate = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  const templateData = {
    'head.title': 'Account Create',
    'head.description': 'Description',
    'body.class': 'index app-accountCreate-page',
  };

  if (method) {
    helpers.getTemplate('accountCreate', templateData, (err, indexStr) => {
      if (!err && indexStr) {
        helpers.addUniversalTemplates(indexStr, templateData, (layoutErr, newStr) => {
          if (!layoutErr && newStr) {
            callback(200, newStr, 'html');
          } else {
            callback(500);
          }
        });
      } else {
        callback(500, { error: err });
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }

};

/**
 * Edit account page
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.accountEdit = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  const templateData = {
    'head.title': 'Account Edit',
    'head.description': 'Description',
    'body.class': 'index app-accountEdit-page',
  };

  if (method) {
    helpers.getTemplate('accountEdit', templateData, (err, indexStr) => {
      if (!err && indexStr) {
        helpers.addUniversalTemplates(indexStr, templateData, (layoutErr, newStr) => {
          if (!layoutErr && newStr) {
            callback(200, newStr, 'html');
          } else {
            callback(500);
          }
        });
      } else {
        callback(500, { error: err });
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }

};

/**
 * Deleted account page
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.accountDeleted = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  const templateData = {
    'head.title': 'Account Deleted',
    'head.description': 'Description',
    'body.class': 'index app-accountDeleted-page',
  };

  if (method) {
    helpers.getTemplate('accountDeleted', templateData, (err, indexStr) => {
      if (!err && indexStr) {
        helpers.addUniversalTemplates(indexStr, templateData, (layoutErr, newStr) => {
          if (!layoutErr && newStr) {
            callback(200, newStr, 'html');
          } else {
            callback(500);
          }
        });
      } else {
        callback(500, { error: err });
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }

};


/**
 * Create session page
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.sessionCreate = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  const templateData = {
    'head.title': 'Session Create',
    'head.description': 'Description',
    'body.class': 'index app-sessionCreate-page',
  };

  if (method) {
    helpers.getTemplate('sessionCreate', templateData, (err, indexStr) => {
      if (!err && indexStr) {
        helpers.addUniversalTemplates(indexStr, templateData, (layoutErr, newStr) => {
          if (!layoutErr && newStr) {
            callback(200, newStr, 'html');
          } else {
            callback(500);
          }
        });
      } else {
        callback(500, { error: err });
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }

};

/**
 * Deleted session page
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.sessionDeleted = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  const templateData = {
    'head.title': 'Session Deleted Page',
    'head.description': 'Description',
    'body.class': 'index app-sessionDeleted-page',
  };

  if (method) {
    helpers.getTemplate('sessionDeleted', templateData, (err, indexStr) => {
      if (!err && indexStr) {
        helpers.addUniversalTemplates(indexStr, templateData, (layoutErr, newStr) => {
          if (!layoutErr && newStr) {
            callback(200, newStr, 'html');
          } else {
            callback(500);
          }
        });
      } else {
        callback(500, { error: err });
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }

};

/**
 * Menu all page
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.menuAll = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  const templateData = {
    'head.title': 'All Menu',
    'head.description': 'Description',
    'body.class': 'index app-menuAll-page',
  };

  if (method) {
    helpers.getTemplate('menuAll', templateData, (err, indexStr) => {
      if (!err && indexStr) {
        helpers.addUniversalTemplates(indexStr, templateData, (layoutErr, newStr) => {
          if (!layoutErr && newStr) {
            callback(200, newStr, 'html');
          } else {
            callback(500);
          }
        });
      } else {
        callback(500, { error: err });
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }

};

/**
 * Shoping cart page
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.shopingCart = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  const templateData = {
    'head.title': 'Shoping cart',
    'head.description': 'Description',
    'body.class': 'index app-shopingCart-page',
  };

  if (method) {
    helpers.getTemplate('shopingCart', templateData, (err, indexStr) => {
      if (!err && indexStr) {
        helpers.addUniversalTemplates(indexStr, templateData, (layoutErr, newStr) => {
          if (!layoutErr && newStr) {
            callback(200, newStr, 'html');
          } else {
            callback(500);
          }
        });
      } else {
        callback(500, { error: err });
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }

};

/**
 * Orders success page
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.ordersSuccess = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  const templateData = {
    'head.title': 'Orders Success',
    'head.description': 'Description',
    'body.class': 'index app-ordersSuccess-page',
  };

  if (method) {
    helpers.getTemplate('ordersSuccess', templateData, (err, indexStr) => {
      if (!err && indexStr) {
        helpers.addUniversalTemplates(indexStr, templateData, (layoutErr, newStr) => {
          if (!layoutErr && newStr) {
            callback(200, newStr, 'html');
          } else {
            callback(500);
          }
        });
      } else {
        callback(500, { error: err });
      }
    });
  } else {
    callback(405, { error: 'Method not allowed' });
  }

};

/**
 * Orders all page
 * @param {{trimedPath: string; queryStringObject: {}; method: string; headers: {}; payload: {}}} data 
 * @param {(statusCode: number; data: {}, contentType: string) => void} callback 
 */
handlers.ordersAll = (data, callback) => {
  // Check the method
  const method = typeof data.method === 'string' && data.method === 'get' ? data.method : false;

  const templateData = {
    'head.title': 'Orders All',
    'head.description': 'Description',
    'body.class': 'index app-ordersAll-page',
  };

  if (method) {
    helpers.getTemplate('ordersAll', templateData, (err, indexStr) => {
      if (!err && indexStr) {
        helpers.addUniversalTemplates(indexStr, templateData, (layoutErr, newStr) => {
          if (!layoutErr && newStr) {
            callback(200, newStr, 'html');
          } else {
            callback(500);
          }
        });
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
