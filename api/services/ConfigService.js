exports.config = function(){

  var CONFIG = {

    dev: {
      backUrl: 'http://localhost:1337/',
      frontUrl: 'http://localhost:3000/#/',
      imgServer: 'http://localhost:1337/uploads/profile/',
      pathEncodedVideo: 'assets/uploads/videos/convert/',
      pathVideo: 'assets/uploads/videos/',
      pathVideoCreate: '/assets/uploads/videos/',
      pathThumbnails: 'assets/uploads/thumbnails/',
      pathCreateThumb: '/assets/uploads/thumbnails',
      pathProfilePicture: '/assets/uploads/profile/',
      targetDir: '/assets/uploads/videos/convert/',
      pathFixtures: '/api/fixtures',
      base: process.env.PWD
    },
    prod: {
      backUrl: 'http://api.mewpipe.com/',
      frontUrl: 'http://mewpipe.com/#/',
      imgServer: 'http://api.mewpipe.com/uploads/profile/',
      pathEncodedVideo: 'assets/uploads/videos/convert/',
      pathVideo: 'assets/uploads/videos/',
      pathVideoCreate: '/assets/uploads/videos/',
      pathThumbnails: 'assets/uploads/thumbnails/',
      pathCreateThumb: '/assets/uploads/thumbnails',
      pathProfilePicture: '/assets/uploads/profile/',
      targetDir: '/assets/uploads/videos/convert/',
      pathFixtures: '/api/fixtures',
      base: process.cwd()
    }

  };

  return CONFIG.prod;

};
