# Pizza-delivery
You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager: 

1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.
2. Users can log in and log out by creating or destroying a token.
3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system). 
4. A logged-in user should be able to fill a shopping cart with menu items
5. A logged-in user should be able to create an order. 
6. When an order is placed, you should email the user a receipt.

## 1. Generate certificate
------
```
cd https
openssl req -newKey rsa:2048 -new -nodes -x509 -days 3650 -keyoutkey.pem -out cert.pem
```

## 2. Run server
------
```
node index.js
```

## 3. Using:
------
### 3.1 User

```
 * User - post
 * Required data: name, email, streetAddr, password
 * Optional data: none
 * Example:
  POST localhost:3000/users
  body: {
    name: string,
    email: string,
    street: string,
    password: string
  }
```

```
 * User - get
 * Required data: email, token (in headers)
 * Optional data: none
 * Example: GET localhost:3000/users?email=your@email.com
 * Return user object
```

```
 * User - put
 * Required data: email, token(in header)
 * Optional data: name, street, password (at least one must be specified)
 * Example:
  PUT localhost:3000/users
  body: {
    name: string,
    email: string,
    street: string,
    password: string
  }
  headers: {
    token: string
  }
```

```
 * User - delete
 * Required data: email, token(in header)
 * Optional data: none
 * Example:
  DELETE localhost:3000/users
  body: {
    email: string
  }
  headers: {
    token: string
  }
```

### 3.2 Token

```
 * Token - post
 * Required data: email, password
 * Optional data: none
 * Example:
 POST localhost:3000/tokens
 body: {
   email: string,
   password: string,
 }
 * Return token object
```

```
 * Token - get
 * Required data: id, token (in headers)
 * Optional data: none
 * Example: GET localhost:3000/tokens?id=50r4mtmqo01ojrq6tsk3
 headers: {
   token: string
 }
 * Return token object
```

```
 * Token - put
 * Required data: id, extend, token(in header)
 * Optional data: none
 * Example:
 PUT localhost:3000/tokens
 body: {
   id: string,
   extend: boolean
 }
 headers: {
   token: string
 }
```

```
 * Token - delete
 * Required data: id, token(in headers)
 * Optional data: none
 * Example:
 DELETE localhost:3000/tokens
 body: {
   id: string
 }
 headers: {
   token: string
 }
```

### 3.3 Menu

```
 * Menu - get
 * Required data: email, token(in headers)
 * Optional data: none
 * Example: GET localhost:3000/menu
 headers: {
   token: string
 }
 * Return menu object
```

### 3.4 Shoping cart 

```
 * Shoping cart - post
 * Required data: email, list, token(in headers)
 * Optional data: none
 *Example: 
 POST localhost:3000shopingCart
 body: {
   email: string,
   list: [
     {
       id: string, // menu item id
       count: number // item count
     },
     {
       id: string,
       count: number
     }
   ]
 }
 headers: {
   token: string
 }
```

```
 * Shoping cart - get
 * Required data: id, token(in headers)
 * Optional data: none
 * Example:
 GET localhost:3000shopingCart?id=1hn598pf6syvbw9oeidz
 headers: {
   id: string
 }
 * Return order object
```

```
 * Shoping cart - put
 * Required data: id, token(in headers)
 * Optional data: list
 * Example
 PUT localhost:3000shopingCart
 body: {
   id: string,
   list: [
     {
       id: string,
       count: number
     }
   ]
 }
 headers: {
   token: string
 }
```

```
 * Shoping cart - delete
 * Required data: id, token (in headers)
 * Optional data: none
 * Example: 
 DELETE localhost:3000/shopingCart
 body: {
   id: string
 }
 headers: {
   token: string
 }
```

### 3.5 Orders

```
 * Orders - post
 * Required data: id, token(in headers)
 * Optional data: none
 * Examples:
 POST localhost:3000/orders
 body: {
   id: string
 }
 headers: {
   token: string
 }
```