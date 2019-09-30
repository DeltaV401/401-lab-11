'use strict';

const User = require('./users-model.js');

module.exports = (req, res, next) => {

  try {
    let authorization = req.headers.authorization || '';
    let [authType, authString] = authorization.split(/\s+/);

    // BASIC Auth  ... Authorization:Basic ZnJlZDpzYW1wbGU=

    switch(authType.toLowerCase()) {
    case 'basic':
      return _authBasic(authString);
    default:
      return _authError();
    }

  } catch(e) {
    return _authError();
  }

  function _authBasic(authString) {
    let base64Buffer = Buffer.from(authString,'base64'); // <Buffer 01 02...>
    let bufferString = base64Buffer.toString(); // john:mysecret
    let [username,password] = bufferString.split(':');  // variables username="john" and password="mysecret"
    let auth = { username, password };  // {username:"john", password:"mysecret"}

    if(!password) {
      return _authError();
    }
    
    return User.authenticateBasic(auth)
      .then(user => _authenticate(user))
      .catch(_authError);
  }

  function _authenticate(user) {
    if ( user ) {
      req.user = user;
      next();
    }
    else {
      return _authError('User not found');
    }
  }

  function _authError() {
    next({status: 401, statusMessage: 'Unauthorized', message: 'Invalid User ID/Password'});
  }

};
  