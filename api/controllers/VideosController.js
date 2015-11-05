/**
 * VideosController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var path = require('path'),
    glob = require('glob'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    formatSupported = ['.3gp', '.3g2', '.3gp2', '.asf', '.mts', '.m2ts', '.avi', '.mod', '.dv', '.ts', '.vob', '.xesc', '.mp4', '.mpeg',
    '.mpg',
    '.m2v', '.ismv', '.wmv', '.mov', '.qt'];

module.exports = {

  create: function(req, res) {

    // After for get token when user is authenticated
    /*var token = req.headers.access_token;

    if(req.headers.access_token === undefined) {
      token = req.param('access_token');
    }*/

    /*TokenService.checkToken(token, function(err, user) {

      if(err) {
        return res.serverError(err);
      }*/

      var params = req.params.all(),
          base = ConfigService.config().base,
          origifile = req.file('file')._files[0].stream.filename,
          extensionOfFile = path.extname(origifile),
          uuidGenerate = uuid.v1(),
          filename = uuidGenerate + extensionOfFile,
          dirName = base + ConfigService.config().pathVideoCreate + filename,
          uploadOptions = {
            saveAs: dirName,
            maxBytes: 524288000
          },
          paramsToSave = {
            profile_id: req.param('profile_id'),
            user_id: req.param('user_id'),
            title: req.param('title'),
            description: req.param('description'),
            name: uuidGenerate
          };

      if (formatSupported.indexOf(extensionOfFile) == -1) {
        return res.badRequest();
      }

      req.file('file').upload(uploadOptions, function (err, files) {

        if(err) {
          return res.serverError(err);
        }

        Videos.create(paramsToSave, function(errCreate, video) {

          if(errCreate) {
            res.serverError(errCreate);
          }

          if(video.profile_id === 3)
          {

            var toStore = {
              link: uuid.v1(),
              video_id: video.id
            };

            PrivateLinks.create(toStore, function (errCreatePrivLink, privLink) {

              if(errCreatePrivLink) {
                res.serverError(errCreatePrivLink);
              }

            });

          }

          UploadService.createThumbnailAndConvertVideo(video, extensionOfFile, res);

        });

      });

   /* });*/

  },

  like: function(req, res) {

    var video_id = req.param('video_id');
    var user_id = req.param('user_id');
    Videos.findOne(video_id, function(errVideo, videoFound) {

      if(errVideo) {
        return res.serverError(errVideo);
      }
      Users.findOne(user_id, function(errUser, userFound) {

        if(errUser) {
          return res.serverError(errUser);
        }
        var paramsLike = {user_id: user_id, video_id: video_id};
        Likes.create(paramsLike, function(errLike, like) {

          if(errLike) {
            return res.serverError(errLike);
          }
          var params = {nb_like : videoFound.nb_like + 1, score: videoFound.score + 1};
          Videos.update(video_id, params, function(err, videoUpdated) {

            if(err) {
              return res.serverError(err);
            }
            return res.ok(videoUpdated);

          });
        });
      });
    });
  },

  dislike: function(req, res) {

    var video_id = req.param('video_id');
    var user_id = req.param('user_id');
    Videos.findOne(video_id, function(errVideo, videoFound) {

      if(errVideo) {
        return res.serverError(errVideo);
      }
      Likes.findOne({user_id: user_id, video_id: video_id}, function(errLike, like) {

        if(errLike) {
          return res.serverError(errLike);
        }
        Likes.destroy({id: like.id}).exec(function(errDestroy, likeDestroy) {
          if(errDestroy) {
            return res.serverError(errDestroy);
          }
          var params = {nb_like : videoFound.nb_like - 1, score: videoFound.score - 1};
          Videos.update(video_id, params, function(err, videoUpdated) {

            if(err) {
              return res.serverError(err);
            }
            return res.ok(videoUpdated);

          });
        });
      });
    });
  },

  isLikedByUser: function(req, res) {
    var video_id = req.param('video_id');
    var user_id = req.param('user_id');
    Likes.findOne({user_id: user_id, video_id: video_id}, function(errLike, like) {
      if(like !== undefined) {
        return res.ok(like);
      }
      return res.ok(null);
    });
  },

  bestScore: function (req, res) {

    var token = req.param('mewpipe_token');

    if(token !== undefined)
    {
      try {
        var decoded = jwt.decode(token, secret);

        Videos.find({where : {profile_id: [1, 2]}, limit: 12, sort: 'score DESC'}, function(err, videos) {

          if(err) return res.serverError(err);

          return res.ok(videos);

        })

      }
      catch(e) {

        Videos.find({where : {profile_id: 1}, limit: 12, sort: 'score DESC'}, function(err, videos) {

          if(err) return res.serverError(err);

          return res.ok(videos);

        })

      }

    }
    else {

      Videos.find({where : {profile_id: 1}, limit: 12, sort: 'score DESC'}, function(err, videos) {

        if(err) return res.serverError(err);

        return res.ok(videos);

      })

    }

  },
  destroy: function(req, res) {

    var video_id = req.param('id'),
      pathEncodedVideo = ConfigService.config().pathEncodedVideo,
      pathThumbnails = ConfigService.config().pathThumbnails,
      pathVideo = ConfigService.config().pathVideo;

    if(video_id === null) {
      return res.badRequest();
    }

    Videos.findOne({id: video_id}, function(errVideo, video) {

      if (errVideo) {
        return res.serverError(errVideo);
      }

      if(video === undefined) {
        return res.badRequest();
      }

      Videos.destroy({id: video_id}).exec(function(errDestroy, videoDestroy) {

        if(errDestroy) {
          return res.serverError(errDestroy);
        }

        if(video.profile_id === 3) {

          PrivateLinks.destroy({video_id: video_id}, function(errPrivateLinks, privateLink) {

            if(errPrivateLinks)
            {
              return res.serverError(errPrivateLinks);
            }

          });
        }

        fs.unlink(pathEncodedVideo + video.name + '.mp4');
        fs.unlink(pathEncodedVideo + video.name + '.ogv');
        fs.unlink(pathEncodedVideo + video.name + '.webm');
        fs.unlink(pathThumbnails + video.thumbnail);

        glob(pathVideo + video.name + '.*', {}, function (err, files) {

          if(files.length > 0) {

            fs.unlink(files[0]);

          }

        });

        Likes.destroy({video_id: video_id}, function(errLike, likes) {

          if(errLike) {
            return res.serverError(errLike);
          }

          return res.ok();

        });


      });

    });

  }

};
