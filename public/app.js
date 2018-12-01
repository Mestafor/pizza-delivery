// Observer event type
const UPDATE_SHOPING_CART = 'UPDATE_SHOPING_CART';
const INIT = 'INIT';

const observer = (() => {
  const subscribers = {}

  return {
    subscribe: (type, ...fn) => {
      if (typeof subscribers[type] === 'object' && Array.isArray(subscribers[type])) {
        subscribers[type].push(...fn);
      } else {
        subscribers[type] = [];
        subscribers[type].push(...fn);
      }
    },
    dispatch: (type) => {
      if (typeof subscribers[type] === 'object' && Array.isArray(subscribers[type])) {
        subscribers[type]
          .forEach(fn => typeof fn === 'function' && fn());
      }
    }
  }
})();

// Container for application stuff
const app = {};

// Application config
app.config = {
  sessionToken: false,
  loggedInBodyClass: 'loggedIn-user',
}

app.pages = {};


/**
 * Write token to the localStorage
 * @param {string | boolean} token 
 */
app.setSessionToken = (token) => {
  app.config.sessionToken = token;
  const tokenString = JSON.stringify(token);
  localStorage.setItem('token', tokenString);
  app.setLoggedInClass(typeof token === 'object');
};

/**
 * Get token from the localStorage
 * and write it to the app.config
 */
app.getSessionToken = async () => {
  const tokenString = localStorage.getItem('token');
  if (typeof tokenString === 'string') {
    try {
      const tokenObj = JSON.parse(tokenString);
      app.setSessionToken(tokenObj);
      app.setLoggedInClass(typeof tokenObj === 'object');
    } catch (err) {
      app.setSessionToken(false);
      app.setLoggedInClass(false);
    }
  }
};

/**
 * Update token expire time when user stay on the page
 */
app.renewToken = () => {
  // Get the current token id
  const token = typeof app.config.sessionToken.id === 'string' ? app.config.sessionToken.id : false;

  if (token) {
    fetch('/api/tokens', {
      method: 'PUT',
      headers: {
        token
      },
      body: JSON.stringify({
        id: token,
        extend: true,
      })
    })
      .then(res => res.json())
      .then(res => {
        if (!res.error) {
          app.setSessionToken(res);
        } else {
          throw new Error(res.error);
        }
      })
      .catch((e) => {
        app.setSessionToken(false);
        app.setLoggedInClass(false);
      });
  }
};

//  Renew every minute token expire time
app.renewTokenLoop = () => {
  setInterval(() => {
    app.renewToken();
  }, 1000 * 60);
};

/**
 * Set class on the document.body when user is logged, otherwise remove this class
 * @param {boolean} is - user is loggined?
 */
app.setLoggedInClass = (is) => {
  is
    ? document.body.classList.add(app.config.loggedInBodyClass)
    : document.body.classList.remove(app.config.loggedInBodyClass);
};

/**
 * Logout user
 * @param {boolean} redirectuser - optional, default true
 */
app.logUserOut = (redirectuser) => {
  // Set redirect to default to true
  const _redirect = typeof redirectuser === 'boolean' ? redirectuser : true;

  // Get the current token id
  const token = typeof app.config.sessionToken.id === 'string' ? app.config.sessionToken.id : false;

  fetch('/api/tokens', {
    method: 'DELETE',
    headers: {
      token,
    }
  })
    .then(res => res.json())
    .then(response => {
      app.setSessionToken(false);

      if (_redirect) {
        window.location = '/session/deleted';
      }
    })
    .catch((error) => {
      app.setSessionToken(false);
    });
}

/**
 * Bind logout user function to the click
 */
app.bindLogoutButton = () => {
  Array.from(
    document.querySelectorAll('.logoutButton')
  )
    .forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();

        app.logUserOut();
      });
    });
}

/**
 * Form behaviours
 */
app.bindForms = () => {
  Array.from(
    document.querySelectorAll('form')
  )
    .forEach(form => {
      const action = form.action;
      const method = form.dataset.method || form.method;
      const name = form.dataset.name;
      const errorBox = form.querySelector('.error-box');
      const successBox = form.querySelector('.success-box');

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = Array.from(e.currentTarget)
          .reduce((obj, item) => {
            if (item.name) {
              obj[item.name] = item.value;
            }
            return obj;
          }, {});

        const token = app.config.sessionToken && app.config.sessionToken.id || false;
        const requestObj = {
          method: method,
          headers: {
            'Content-type': 'application/json',
            token: token
          }
        };

        if (['PUT', 'DELETE', 'POST'].includes(method.toUpperCase())) {
          requestObj.body = JSON.stringify(data);
        }

        fetch(action, requestObj)
          .then(res => res.json())
          .then(response => {

            if (response.error) {
              errorBox && (errorBox.innerHTML = response.error);
              return;
            }

            errorBox && (errorBox.innerHTML = '');

            switch (name) {
              case 'accountCreate': {
                window.location = '/session/create';
                break;
              }
              case 'sessionCreate': {
                app.setSessionToken(response);
                window.location = '/menu/all';
                break;
              }
              case 'accountEdit': {
                successBox && (successBox.innerHTML = 'Your changes were saved successfully')
                break;
              }
              case 'accountDeleted': {
                window.location = '/account/deleted';
                break;
              }
            }
          })
          .catch(error => {
            errorBox && (errorBox.innerHTML = error);
          });
      });
    });

};

/**
 * Get user data for specified forms
 */
app.getUserData = () => {
  const formEdit = document.querySelectorAll('[data-name="accountEdit"]');
  const formDeleted = document.querySelectorAll('[data-name="accountDeleted"]');
  const forms = [...formEdit, ...formDeleted];

  if (forms.length > 0) {
    const token = app.config.sessionToken && app.config.sessionToken.id || '';

    if (!token) {
      return;
    }

    fetch(`/api/tokens?id=${token}`, {
      method: 'GET',
      headers: {
        token
      }
    })
      .then(res => res.json())
      .then(tokenData => {
        return fetch(`/api/users?email=${tokenData.email}`, {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            token
          }
        });
      })
      .then(res => res.json())
      .then((res) => {
        Array.from(forms)
          .forEach(
            form => Array.from(form).forEach(
              field => {
                const name = field.name;
                if (res[name]) {
                  field.setAttribute('value', res[name]);
                }
              }
            )
          )
      })
      .catch(console.error);
  }
};

/**
 * Add item to localestorage
 */
app.addMenuItemToLocaleStorage = (data) => {
  if (!data) {
    return;
  }

  if (typeof app.config.sessionToken === 'object') {

    const email = app.config.sessionToken.email;

    if (!email) {
      return;
    }

    let localShopingCart = localStorage.getItem(`${email}-shoping-cart`);

    try {
      localShopingCart = JSON.parse(localShopingCart);
    } catch (e) {
      console.error(e);
    }

    if (!localShopingCart) {
      localShopingCart = {
        email: app.config.sessionToken.email,
        list: []
      }
    }

    if (typeof localShopingCart === 'object') {
      let isAdded = false;
      localShopingCart.list = localShopingCart.list.map(item => {
        if (item.id === data.id) {
          item.count++;
          isAdded = true;
        }
        return item;
      });

      if (!isAdded) {
        localShopingCart.list.push({ id: data.id, count: 1, data });
      }

      localStorage.setItem(`${email}-shoping-cart`, JSON.stringify(localShopingCart));
      observer.dispatch(UPDATE_SHOPING_CART);
    }
  }
};

/**
 * Bind Add to cart
 * @param {HTMLElement | Document} context 
 */
app.bindAddToCart = (context = document) => {
  Array.from(
    context.querySelectorAll('.add-to-cart')
  )
    .forEach(
      btn => btn
        .addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            try {
              const data = JSON.parse(decodeURIComponent(e.currentTarget.dataset.item));
              app.addMenuItemToLocaleStorage(data);
            } catch (e) {
              console.error(e);
            }
          }
        ));
}

/**
 * Update count of picked products
 * @param {HTMLCollection} elems 
 */
app.updateShopingCartCout = (elems) => () => {
  if (!elems) {
    return;
  }

  const email = app.config.sessionToken && app.config.sessionToken.email;

  if (!email) {
    return;
  }

  const data = localStorage.getItem(email + '-shoping-cart');

  if (!data) {
    return;
  }

  try {
    const parsedData = JSON.parse(data);
    let count = 0;
    if (Array.isArray(parsedData.list) && parsedData.list.length > 0) {
      count = parsedData.list
        .reduce((sum, item) => {
          sum += +item.count || 0;
          return sum;
        }, 0);
    }

    Array.from(elems).forEach(elem => {
      count
        ? (elem.innerHTML = count)
        : (elem.innerHTML = '');
    });
  } catch (e) {
    console.error(e);
  }
}

/**
 * Update price of picked products
 * @param {HTMLCollection} elems 
 */
app.updateShopingCartPrice = (elems) => () => {
  if (!elems) {
    return;
  }

  const email = app.config.sessionToken && app.config.sessionToken.email;

  if (!email) {
    return;
  }

  const data = localStorage.getItem(email + '-shoping-cart');

  if (!data) {
    return;
  }

  try {
    const parsedData = JSON.parse(data);
    let price = 0;
    if (Array.isArray(parsedData.list) && parsedData.list.length > 0) {
      price = parsedData.list
        .reduce((sum, item) => {
          sum += item.data && +item.data.price * item.count || 0;
          return sum;
        }, 0);
    }

    Array.from(elems).forEach(elem => {
      price
        ? (elem.innerHTML = price)
        : (elem.innerHTML = '');
    });
  } catch (e) {
    console.error(e);
  }
}

/////////////////////////////// PAGES

// MENU PAGE
/**
 * Get all menu and render it
 */
app.getMenu = async () => {
  const gridSelector = 'menu-grid';

  const grid = document.querySelectorAll(`.${gridSelector}`);

  if (grid.length > 0) {

    // Get menu list
    const menuList = await fetch('/api/menu', {
      method: 'GET',
      headers: {
        token: app.config.sessionToken.id
      }
    })
      .then(res => res.json());

    if (menuList && typeof menuList.error === 'undefined') {
      // Render menu list
      const menu = menuList
        .map(item => {
          return `
          <div class="${gridSelector}__item">
            <h2>${item.name}</h2>
            <p>${item.description}</p>
            <button class="btn btn--style1 add-to-cart" data-id="${item.id}" data-item="${encodeURIComponent(JSON.stringify(item))}">Add to cart</button>
          </div>
        `;
        })
        .reduce((htmlStr, str) => htmlStr + str, '');

      if (menu) {
        grid.forEach(item => {
          item.innerHTML = menu;
          app.bindAddToCart(item);
        });

      }
    } else {
      // console.error(menuList.error);
    }

  }
};

app.changeShopingCartItemCount = (id) => (e) => {
  e.preventDefault();

  const target = e.currentTarget;

  const email = app.config.sessionToken && app.config.sessionToken.email;

  if (!email) {
    return;
  }

  const data = localStorage.getItem(email + '-shoping-cart');

  if (!data && !app.config.sessionToken) {
    console.error('Cart not found');
    return;
  }

  try {
    const parsedData = JSON.parse(data);

    if (Array.isArray(parsedData.list) && parsedData.list.length > 0) {
      parsedData.list.forEach(item => {
        if (item.id === id) {
          const value = +target.value;
          if (value > 0) {
            item.count = value;
          } else {
            item.count = 1;
            target.value = 1;
          }
        }
      });

      localStorage.setItem(email + '-shoping-cart', JSON.stringify(parsedData));
      observer.dispatch(UPDATE_SHOPING_CART);
    }

  } catch (e) {
    console.error(e);
  }

}

/**
 * Delete shoping cart item from localstorage
 * @param {number | string} id 
 */
app.deleteShopingCartItem = (id) => (e) => {
  e.preventDefault();

  const target = e.currentTarget;

  const email = app.config.sessionToken && app.config.sessionToken.email;

  if (!email) {
    return;
  }

  const data = localStorage.getItem(email + '-shoping-cart');

  if (!data && !app.config.sessionToken) {
    console.error('Cart not found');
    return;
  }

  try {
    const parsedData = JSON.parse(data);

    if (Array.isArray(parsedData.list) && parsedData.list.length > 0) {
      const newList = parsedData.list.filter(item => item.id != id);
      parsedData.list = newList;

      target.parentNode.parentNode.parentNode.removeChild(target.parentNode.parentNode);

      localStorage.setItem(email + '-shoping-cart', JSON.stringify(parsedData));
      observer.dispatch(UPDATE_SHOPING_CART);
    }

  } catch (e) {
    console.error(e);
  }

}

/**
 * Render shoping cart
 */
app.renderShopingCart = () => {

  // Lookup the shoping cart wrapper
  const shopingCartWrappers = document.querySelectorAll('.shoping-cart-wrapper');

  // If wraper not fount, return
  if (!shopingCartWrappers.length) {
    return;
  }

  if (!app.config.sessionToken) {
    return;
  }

  const email = app.config.sessionToken.email || false;

  if (!email) {
    return;
  }

  // Get shoping cart from the localestorage
  const data = localStorage.getItem(email + '-shoping-cart');
  if (!data) {
    return;
  }

  // Try to parse data and render to the table
  try {
    const parsedData = JSON.parse(data);

    // String to render
    let str = '';

    // Prepare all data to render
    if (Array.isArray(parsedData.list) && parsedData.list.length > 0) {
      str = parsedData.list.reduce((str, item) => {

        return str;
      }, '');

      const table = document.createElement('table');
      parsedData.list.forEach(item => {

        if (typeof item.data === 'object') {
          const tr = table.insertRow();
          Object.entries(item.data).forEach(([key, value]) => {
            const td = tr.insertCell();
            td.innerHTML = value;
          });

          const tdCount = tr.insertCell();
          const input = document.createElement('input');
          input.type = 'number';
          input.value = item.count;
          input.onchange = app.changeShopingCartItemCount(item.id);
          tdCount.appendChild(input);

          const tdDelete = tr.insertCell();
          const button = document.createElement('button');
          button.classList = 'btn btn--danger';
          button.onclick = app.deleteShopingCartItem(item.id);
          button.innerHTML = 'Delete';
          tdDelete.appendChild(button);

        }

      });

      shopingCartWrappers.forEach(wrapper => {
        wrapper.appendChild(table);
        wrapper.insertAdjacentHTML('beforeend', `
          <p class="text-right"><b>Total price:</b> <span class="shoping-cart-price"></span></p>
        `);
      });
    }


  } catch (e) {
    console.error(e);
  }
}
/**
 * Create shoping cart and order
 */
app.bindOrderIt = () => {
  const btns = document.querySelectorAll('.orderIt');
  const errorBlock = document.querySelectorAll('.orderIt-error');

  const showError = (message) => Array.from(errorBlock).forEach(block => { block.innerHTML = message });

  const processing = document.createElement('span');
  processing.className = 'processing';
  processing.innerHTML = '<em>Processing<span class="processing__dot">.</span><span class="processing__dot">.</span><span class="processing__dot">.</span></em>'

  Array.from(btns)
    .forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        const target = e.currentTarget;
        target.classList.add('disabled');
        target.parentNode.insertBefore(processing, target);

        const token = app.config.sessionToken;
        const email = token && token.email;

        if (!email) {
          return;
        }

        const data = localStorage.getItem(email + '-shoping-cart');
        if (!data) {
          console.error('Shoping cart not found');
          return;
        }

        try {
          const parsedData = JSON.parse(data);

          if (Array.isArray(parsedData.list) && parsedData.list.length > 0) {
            parsedData.list.forEach(item => {
              delete item.data;
            });


            if (typeof token === 'object' && !token.error) {
              // Create shoping cart and order
              fetch('/api/shopingCart', {
                method: 'POST',
                headers: {
                  token: token.id
                },
                body: JSON.stringify({
                  email: parsedData.email,
                  list: parsedData.list,
                })
              })
                .then((res) => res.json())
                .then(res => {
                  return fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                      token: token.id
                    },
                    body: JSON.stringify({
                      id: res.data.id
                    })
                  });
                })
                .then(res => res.json())
                .then(res => {
                  if (!res.error) {
                    // Clear shoping cart
                    localStorage.setItem(email + '-shoping-cart', false);

                    // Redirect to the success page
                    location.href = '/orders/success';
                  } else {
                    console.error(res.error);
                    target.classList.remove('disabled');
                    target.parentNode.removeChild(processing);
                    showError(res.error);
                  }
                })
                .catch(err => {
                  console.error(err);
                  target.classList.remove('disabled');
                  target.parentNode.removeChild(processing);
                  showError(err);
                });
            } else {
              console.error('Invalid token');
              target.classList.remove('disabled');
              target.parentNode.removeChild(processing);
              showError('Invalid token');
            }

          } else {
            target.classList.remove('disabled');
            target.parentNode.removeChild(processing);
            showError('You dont have items in shoping cart');
          }

        } catch (e) {
          target.classList.remove('disabled');
          target.parentNode.removeChild(processing);
          showError(e);
        }
      });
    });
}

/**
 * Get user orders list from server
 * @param {(err: {type: string, message: string}, data: [{currency: string, email: string, id: string, price: number, timestamp: number, list: [{id: string | number, name: string, description: string, price: number}]}] | string) => void} callback 
 */
app.getUserOrdersList = (callback) => {

  const { id: token, email } = app.config.sessionToken;

  // Check required field
  const _token = typeof token === 'string' && token.length > 0 ? token : false;
  const _email = typeof email === 'string' && email.length > 0 ? email : false;

  if (_token && _email) {
    fetch(`/api/users/orders?email=${_email}`, {
      method: 'GET',
      headers: {
        token: _token
      }
    })
      .then(res => res.json())
      .then(res => {

        if (!res.error) {
          typeof callback === 'function' && callback(false, res);
        } else {
          typeof callback === 'function' && callback(true, { type: 'fetch', message: res.error });
        }
      })
      .catch(err => {
        typeof callback === 'function' && callback(true, { type: 'fetch', message: err });
      });
  } else {
    typeof callback === 'function' && callback(true, { type: 'login', message: 'logIn first' });
  }
}

/**
 * 
 * @param {NodeListOf<HTMLElement> | null} nodeElement 
 */
app.renderOrdersList = (nodeElement) => {
  if (typeof nodeElement === 'object' && nodeElement.length > 0) {
    app.getUserOrdersList((getListError, data) => {
      if (!getListError && data) {
        Array.from(nodeElement)
          .forEach(elem => {
            // Create table
            const table = document.createElement('table');

            // Check if user have at least one order
            if (Array.isArray(data) && data.length > 0) {

              // Create heading
              const row = table.insertRow();
              Object.entries(data[0]).forEach(([key, value]) => {
                const col = row.insertCell();
                col.innerHTML = `<b>${key.toUpperCase()}</b>`;
              });

              // Render data
              data.forEach(item => {
                // Create row
                const row = table.insertRow();
                Object.entries(item).forEach(([key, value]) => {
                  const col = row.insertCell();
                  col.innerHTML = key === 'timestamp' ? new Date(value).toDateString() : value; // If is timestamp, convert to date string
                });
              });

              elem.appendChild(table);

            } else {
              elem.innerHTML = `<span class="">You did not order yet</span>`;
            }
          })
      } else {
        Array.from(nodeElement)
          .forEach(elem => {
            switch (data.type) {
              case 'login':
              case 'fetch': {
                elem.innerHTML = `<span class="error-box">${data.message}</span>`
                break;
              }
              default:
                elem.innerHTML = `<span class="error-box">Weird error</span>`
            }
          });
      }
    });
  }
};

// Subscribe
app.init = () => {
  // Testing observer
  observer.subscribe(INIT, app.getSessionToken, app.getUserData, app.getMenu);
  observer.dispatch(INIT);

  // Check the token is valid 
  app.renewToken();
  app.renewTokenLoop();

  // Bind form event
  app.bindForms();

  // bind Logout button
  app.bindLogoutButton();

  // Pages
  app.renderShopingCart();

  // Bind order button
  app.bindOrderIt();

  // Update locale shoping cart
  const updateShopingCartCount = app.updateShopingCartCout(document.querySelectorAll('.shoping-cart-count'));
  const updateShopingCartPrice = app.updateShopingCartPrice(document.querySelectorAll('.shoping-cart-price'));
  observer.subscribe(UPDATE_SHOPING_CART, updateShopingCartCount, updateShopingCartPrice);
  observer.dispatch(UPDATE_SHOPING_CART);

  // Render orders list
  app.renderOrdersList(
    document.querySelectorAll('.order-list-wrapper')
  );
}

// Run application when document was ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
