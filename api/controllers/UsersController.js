/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var passport = require('passport'),
    jwt = require('jwt-simple'),
    path = require('path'),
    glob = require('glob'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    secret = "mewpipeParis";

module.exports = {

  github: function(req, res) {

    var frontServer = ConfigService.config().frontUrl;

    passport.authenticate('github', {successRedirect: frontServer, failureRedirect: frontServer + '/login', scope: ['user'] },
      function(err, user) {
        if(err) {
          return res.redirect(frontServer + 'connection?failed=true');
        }
        else {
          if(user !== undefined) {
            var token = jwt.encode(user, secret);
            return res.redirect(
                frontServer + 'connection' + '?id='+ user.id + '&email=' + user.email + '&mewpipe_token=' + token + '&name=' + user.name
            );
          }
          else {
            return res.redirect(frontServer + 'connection?failed=true');
          }

        }

    })(req, res);

  },

  facebook: function(req, res) {

    var frontServer = ConfigService.config().frontUrl;

    passport.authenticate('facebook', { successRedirect: frontServer, failureRedirect: frontServer + '/login', scope: ['email'] },
      function(err, user) {

        if(err) {
          return res.redirect(frontServer + 'connection?failed=true');
        }
        else {

          if(user !== false) {
            var token = jwt.encode(user, secret);
            return res.redirect(
                frontServer + 'connection' + '?id='+ user.id + '&email=' + user.email + '&mewpipe_token=' + token + '&name=' + user.name
            );
          }
          else {
            return res.redirect(frontServer + 'connection?failed=true');
          }

        }

    })(req, res);

  },

  google: function(req, res) {

    var frontServer = ConfigService.config().frontUrl;

    passport.authenticate('google', {successRedirect: frontServer, failureRedirect: frontServer + '/login',
      scope: ['https://www.googleapis.com/auth/plus.login',
              'https://www.googleapis.com/auth/userinfo.email',
              'https://www.googleapis.com/auth/plus.profile.emails.read']
      },
      function(err, user) {

        if(err) {
          return res.redirect(frontServer + 'connection?failed=true');
        }
        else {
          if(user !== false) {
            var token = jwt.encode(user, secret);
            return res.redirect(
                frontServer + 'connection' + '?id='+ user.id + '&email=' + user.email + '&mewpipe_token=' + token + '&name=' + user.name
            );
          }
          else {
            return res.redirect(frontServer + 'connection?failed=true');
          }

        }

    })(req, res);

  },

  twitter: function(req, res) {

    var frontServer = ConfigService.config().frontUrl;

    passport.authenticate('twitter', { successRedirect: frontServer, failureRedirect: frontServer + '/login', scope: ['email'] },
      function(err, user) {

        if(err) {
          return res.redirect(frontServer + 'connection?failed=true');
        }
        else {
          if(user !== false) {
            var token = jwt.encode(user, secret);
            return res.redirect(
                frontServer + 'connection' + '?id='+ user.id + '&email=' + user.email + '&mewpipe_token=' + token + '&name=' + user.name
            );
          }
          else {
            return res.redirect(frontServer + 'connection?failed=true');
          }

        }

    })(req, res);

  },

  openid: function(req, res) {

    var frontServer = ConfigService.config().frontUrl;

    passport.authenticate('openid', { successRedirect: frontServer, failureRedirect: frontServer + '/login'},
      function(err, user) {

        if(err) {
          return res.redirect(frontServer + 'connection?failed=true');
        }
        else {
          if(user !== false) {
            var token = jwt.encode(user, secret);
            return res.redirect(
                frontServer + 'connection' + '?id='+ user.id + '&email=' + user.email + '&mewpipe_token=' + token + '&name=' + user.name
            );
          }
          else {
            return res.redirect(frontServer + 'connection?failed=true');
          }

        }

    })(req, res);

  },

  update: function(req, res) {
    //var token = req.headers.access_token;

    //TokenService.checkToken(token, function (errToken, tokenDecoded) {

      /*if (errToken) {
        return res.serverError(errToken);
      }*/

      var params = req.params.all(),
        hasFile = req.param('has_file');

      var img_server = ConfigService.config().imgServer;
      var paramsToSave = {};

      //params.id = tokenDecoded.id;

      // Params Upload
      // Not Checking Type

      if(hasFile == 1) {
        var base = ConfigService.config().base,
          formatAccepted = ['.jpg', '.png', '.jpeg', '.JPG', '.PNG', '.JPEG'],
          originalFile = req.file('file')._files[0].stream.filename,
          extensionOfFile = path.extname(originalFile),
          uuidGenerate = uuid.v1(),
          filename = uuidGenerate + extensionOfFile,
          filePath = base + ConfigService.config().pathProfilePicture + filename,
          uploadOptions = {
            saveAs: filePath
          };

        paramsToSave.profile_img_url = img_server + filename;

      }


      if(params.firstname !== undefined)
      {
        paramsToSave.firstname = params.firstname;
      }
      if(params.lastname !== undefined)
      {
        paramsToSave.lastname = params.lastname;
      }
      if(params.birthdate !== undefined)
      {
        paramsToSave.birthdate = params.birthdate;
      }

      // Not Checking Type
      if(hasFile == 1) {

        if (formatAccepted.indexOf(extensionOfFile) !== -1) {
          req.file('file')
            .upload(uploadOptions, function(err, uploadedFiles) {
              if(err) return res.serverError(err);

              Users.update(params.id, paramsToSave, function(errUpdate, userUpdated) {

                if(errUpdate) return res.serverError(errUpdate);

                console.log(userUpdated);

                  return res.ok(userUpdated);

                });

              })
            .on('progress', function (event) {
              if(event.percent === 100)
              {
                sails.io.sockets.emit('photoUpdated', {userId: params.id, profileImgUrl: paramsToSave.profile_img_url});
              }
            });

        }
        else {
          return res.badRequest('Invalid Format');
        }

      }
      else {
        Users.update(params.id, params, function (err, userUpdated) {

          if (err) {
            return res.serverError(err);
          }

          res.ok();

        });
      }
  },

  destroy: function(req, res) {

    var user_id = req.param('id'),
        pathEncodedVideo = ConfigService.config().pathEncodedVideo,
        pathThumbnails = ConfigService.config().pathThumbnails,
        pathVideo = ConfigService.config().pathVideo;

    console.log(req.params.all());
    if(user_id === null) {
      return res.badRequest();
    }

    Users.findOne({id: user_id}, function(err, user) {
      if (err) {
        return res.serverError(err);
      }

      if(user === undefined) {
        return res.badRequest();
      }

      Users.destroy({id:user_id}).exec(function(errUser, users) {
        if (errUser) {
          return res.serverError(errUser);
        }
        /*var userIds = users.map(function(user){
            return user.id;
          });*/

        Videos.destroy({user_id: user_id}).exec(function(errDestroy, videos) {

          if(errDestroy) {
            return res.serverError(errDestroy);
          }

          videos.forEach(function (video, index) {

            if(video.profile_id === 3)
            {
              PrivateLinks.destroy({video_id: video.id}, function(errPrivateLinks, privateLink) {

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

            glob(pathVideo + video.name + '.*', {}, function (er, files) {

              if(files.length > 0) {

                fs.unlink(files[0]);

              }

            })

          });

          Likes.destroy({user_id: user_id}, function(errLike, likes) {

            if(errLike) {
              return res.serverError(errLike);
            }

            return res.ok();
          });

        });

      });

    });

  }

};

