var ffmpeg = require('fluent-ffmpeg');

var checkDurationVideo = function(video, extensionOfFile, res){

  var base = ConfigService.config().base,
      videoPath = base + ConfigService.config().pathVideoCreate,
      path = videoPath + video.name + extensionOfFile;

  ffmpeg.ffprobe(path, function(err, metadata) {

      var params = {
        duration: metadata.format.duration
      };
      var width = metadata.streams[0].width,
          height = metadata.streams[0].height;

      createThumbnail(video, width, height, path, params, res);
      convertVideo(video, width, height, extensionOfFile);

  });

};

var createThumbnail = function(video, width, height, path, params, res) {

  var size = width + 'x' + height,
      base = ConfigService.config().base,
      thumbnailPath = base + ConfigService.config().pathCreateThumb;

  console.log(size);
  ffmpeg(path)
    .screenshots({
      count: 1,
      timestamps: ['00:00:02'],
      filename: video.name + '.png',
      folder: thumbnailPath,
      size: size
    }) .on('end', function() {

      params.thumbnail = video.name + '.png';

      updateVideo(video, params);
      res.ok(video);

    }) .on('error', function (err) {
        console.log(err);
    });

};

var convertVideo = function(video, width, heigth, extensionOfFile) {

  var size = width + "x" + heigth,
      base = ConfigService.config().base,
      videoPath = base + ConfigService.config().pathVideoCreate,
      targetDir = base + ConfigService.config().targetDir,
      filepath = videoPath + video.name + extensionOfFile;

  // Convert Video To MP4
  ffmpeg(filepath)
    .videoCodec('libx264')
    .size(size)
    .on('error', function(err) {
      console.log('error when converting to MP4');
    })
    .on('end', function() {
      console.log('video encoded to MP4');

      setTimeout(function() {

        var params = {
          encoded: true
        };

        updateVideo(video, params);
        sails.io.sockets.emit('videoEncoded', video.id);
      }, 2000);

    })
    .save(targetDir + video.name + '.mp4');

  /*// Convert Video To OGV
  ffmpeg(filepath)
    .videoCodec('libtheora')
    .audioCodec('libvorbis')
    .size(size)
    .on('error', function(err) {
      console.log('error when converting to OGV');
    })
    .on('end', function() {
      console.log('video encoded to OGV');
    })
    .save(targetDir + video.name + '.ogv');

  // Convert Video To WEBM
  ffmpeg(filepath)
    .videoCodec('libvpx')
    .audioCodec('libvorbis')
    .size(size)
    .on('error', function(err) {
      console.log('error when converting to WEBM');
    })
    .on('end', function() {

      console.log('video encoded to WEBM');
      var params = {
        encoded: true
      };

      updateVideo(video, params);
      sails.io.sockets.emit('videoEncoded', video.id);

    })
    .save(targetDir + video.name + '.webm');*/


};

var updateVideo = function(video, params) {

  Videos.update(video.id, params, function(err, videoUpdated) {

    if(err) {
      console.log(err);
    }

    console.log('Video updated');

  });

};

exports.createThumbnailAndConvertVideo = function(video, extensionOfFile, res) {

  checkDurationVideo(video, extensionOfFile, res);

};

