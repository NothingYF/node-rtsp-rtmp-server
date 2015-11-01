(function() {
  var Bits, StreamServer, logger, streamServer, url;

  url = require('url');

  StreamServer = require('./src/stream_server');

  Bits = require('./src/bits');

  logger = require('./src/logger');

  Bits.set_warning_fatal(true);

  logger.setLevel(logger.LEVEL_INFO);

  streamServer = new StreamServer;

  streamServer.setLivePathConsumer(function(uri, callback) {
    var isAuthorized, pathname;
    pathname = url.parse(uri).pathname.slice(1);
    isAuthorized = true;
    if (isAuthorized) {
      return callback(null);
    } else {
      return callback(new Error('Unauthorized access'));
    }
  });

  process.on('SIGINT', (function(_this) {
    return function() {
      console.log('Got SIGINT');
      return streamServer.stop(function() {
        return process.kill(process.pid, 'SIGTERM');
      });
    };
  })(this));

  process.on('uncaughtException', function(err) {
    streamServer.stop();
    throw err;
  });

  streamServer.start();

}).call(this);