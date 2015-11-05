/**
 * SharesController
 *
 * @description :: Server-side logic for managing shares
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var shortid = require('shortid');

module.exports = {

  create: function(req, res) {

    if(req.param('video_id') === null) {
      return res.badRequest();
    }

    Videos.findOne().where({id: req.param('video_id')}).populate('profile_id').exec(function (err, videoFind) {
      if(err){
        return res.serverError(err);
      }

      if(videoFind === undefined){
        return res.notFound();
      }
      if(videoFind.profile_id.name !== 'PrivateLink') {
        var link = 'link/' + shortid.generate();
        var paramsToSave = {

          video_id: videoFind.id,
          link: link
        };

        Shares.findOne({id: videoFind.id}, function(errShare, share) {

          if(errShare) {
            return res.serverError(errShare);
          }
          if(share === undefined) {
            Shares.create(paramsToSave, function (errCreate, shareCreated) {
              if(errCreate) {
                return res.serverError(errCreate);
              }
              var nb_shared = 1;
              Videos.update(videoFind.id, {nb_shared:nb_shared}, function (errUpdate, videoUpdated) {
                if(errUpdate) {
                  return res.serverError(errUpdate);
                }
                if(videoUpdated === undefined) {
                  return res.notFound();
                }
                return res.json(shareCreated);
              })
            })
          }
          else {
            var nb_shared = videoFind.nb_shared + 1;
            Videos.update(videoFind.id, {nb_shared:nb_shared}, function (errUpdate, videoUpdated) {
              if(errUpdate) {
                return res.serverError(errUpdate);
              }
              if(videoUpdated === undefined) {
                return res.notFound();
              }
              return res.json(share);
            })
          }
        });
      }
      else {
        return res.badRequest();
      }
    })

  },

  link: function(req, res) {
    var idShare = 'link/' + req.param('id');
    Shares.findOne({link: idShare}, function(errShare, share) {

      console.log(share);
      if(errShare) {
        return res.serverError(errShare);
      }
      if(share === undefined) {
        return res.notFound();
      }
      Videos.findOne().where({id: share.video_id}).populate('user_id').populate('profile_id').exec(function(err, videoFind){
        console.log(videoFind);
        if(err) {
          return res.serverError(err);
        }
        if(videoFind === undefined) {
          return res.notFound();
        }
        return res.json(videoFind);
      })
    });
  }
};

