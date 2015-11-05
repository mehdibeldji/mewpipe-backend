'use strict';
/* jshint unused:false */

/**
 * hasJsonWebToken
 *
 * @module      :: Policy
 * @description :: Assumes that your request has an jwt;
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

var jwt = require('jwt-simple');

module.exports = function(req, res, next) {

  var token = req.param('mewpipe_token'),
      secret = "mewpipeParis";

  if(token !== undefined)
  {
    try {
      var decoded = jwt.decode(token, secret);
      next();

    }
    catch(e) {
      return res.forbidden();
    }

  }
  else {
    return res.forbidden();
  }

};
