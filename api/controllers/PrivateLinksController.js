/**
 * PrivateLinksController
 *
 * @description :: Server-side logic for managing privatelinks
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var uuid = require('node-uuid');

module.exports = {

  create: function(req, res) {

    var videoId = req.param('video_id'),
        userId = req.param('user_id'),
        privLink = uuid.v1();

    Videos.findOne({id: videoId}, function(errFind, videoFind) {

      if (errFind) {
        return res.serverError(errFind);
      }
      if (videoFind === undefined) {
        return res.notFound();
      }
      if(videoFind.user_id != userId) {
        return res.forbidden();
      }

      PrivateLinks.create({video_id: videoId, link: privLink}, function(err, data) {

        if (err)
        {
          return res.serverError(err);
        }

        return res.ok(data);

      });

    });

  },

  find: function (req, res) {

    var videoId = req.param('video_id'),
        privLink = req.param('link'),
        sharePage = req.param('sharePage');

    if (sharePage)
    {

      PrivateLinks.findOne({link: privLink}, function(err, privateLink) {

        if(err)
        {
          return res.serverError(err);
        }

        if(privateLink === undefined)
        {
          return res.notFound();
        }

        Videos.findOne({id: privateLink.video_id}).populate('user_id').exec(function(errFindOneVideo, video) {

          if(errFindOneVideo)
          {
            return res.serverError(errFindOneVideo);
          }
          if(video === undefined)
          {
            return res.notFound();
          }

          return res.ok(video);

        });

      });

    }
    else {

      PrivateLinks.findOne({video_id: videoId}, function(err, privateLink) {

        if(err)
        {
          return res.serverError(err);
        }

        if(privateLink === undefined)
        {
          return res.notFound();
        }

        return res.ok(privateLink);

      });

    }

  }

};

