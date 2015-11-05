/**
* Users.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName: 'Users',
  attributes: {
    provider: {
      type: 'string'
    },
    uid: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    firstname:{
      type: 'string'
    },
    lastname:{
      type: 'string'
    },
    profile_img_url: {
      type: 'text'
    },
    birthdate: {
      type: 'string'
    }
  }
};

