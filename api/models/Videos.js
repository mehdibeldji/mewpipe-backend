/**
* Videos.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName: 'Videos',
  attributes: {

    profile_id: {
      model: 'Profiles'
    },
    user_id: {
      model: 'Users'
    },
    name: {
      type: 'text',
      required: true
    },
    thumbnail: {
      type: 'text',
      required: false
    },
    title: {
      type: 'string',
      maxLength: 255,
      required: true
    },
    description: {
      type: 'text',
      required: false
    },
    duration: {
      type: 'integer',
      required: false
    },
    encoded: {
      type: 'boolean',
      required: false,
      defaultsTo: false
    },
    nb_views: {
      type: 'integer',
      required: false,
      defaultsTo: 0
    },
    nb_shared: {
      type: 'integer',
      required: false,
      defaultsTo: 0
    },
    nb_like: {
      type: 'integer',
      required: false,
      defaultsTo: 0
    },
    score: {
      type: 'integer',
      required: false,
      defaultsTo: 0
    }

  }
};

