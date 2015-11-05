/**
* Shares.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName: 'Shares',
  attributes: {

    link: {
      type: 'text',
      required: false
    },
    video_id: {
      model: 'Videos'
    }

  }
};

