(function() {
  var BrowserSync, browserSync, bsExists, bsPath, fs, http, log, mkdirp, path, version;

  fs = require('fs');

  log = require('de-logger');

  http = require('http');

  path = require('path');

  mkdirp = require('mkdirp');

  browserSync = require('browser-sync');

  version = null;

  bsExists = null;

  bsPath = path.resolve(__dirname, '../../../node_modules/browser-sync');

  fs.exists(bsPath, function(exists) {
    var ref;
    bsExists = exists;
    if (bsExists) {
      return ref = require('../../../node_modules/browser-sync/package.json'), version = ref.version, ref;
    } else {
      return log.warn('browser-sync not found');
    }
  });

  BrowserSync = (function() {
    function BrowserSync(server) {
      this.server = server;
      this.load();
    }

    BrowserSync.prototype.load = function() {
      this.filePath = path.resolve(__dirname, '../../../build/browser-sync.js');
      this.bs = browserSync.create();
      this.config = {
        ui: {
          port: 9000
        },
        port: 9001,
        logLevel: 'silent',
        logFileChanges: false
      };
      return this.bs.init(this.config, (function(_this) {
        return function(err) {
          if (err) {
            return log.error('LDE - BrowserSync', 'Couldn\'t start BrowserSync \n\n', err);
          }
          return _this.code();
        };
      })(this));
    };

    BrowserSync.prototype.reload = function(path) {
      log.info('LDE - BrowserSync', "Reload", path.replace(this.server.options.root + "/", ''));
      return this.bs.reload(path);
    };

    BrowserSync.prototype.code = function() {
      log.info('LDE - BrowserSync', "BrowserSync server started");
      return this.download("http://localhost:" + this.config.port + "/browser-sync/browser-sync-client." + version + ".js", (function(_this) {
        return function(err) {
          if (err) {
            return log.error('LDE - BrowserSync', "Unable to get browser-sync .js file", err);
          }
          log.info('LDE - BrowserSync', "Ready at localhost:" + _this.config.ui.port);
          if (_this.server.options.browserSync.enabled) {
            _this.server.browserify.w.require('socket.io-client', {
              expose: 'socket.io-client'
            });
            _this.server.browserify.w.add(path.resolve(__dirname, '../../helper/socket.io-client'));
            _this.server.browserify.w.add(_this.filePath);
          }
          _this.ready = true;
          return _this.server.watch.browserify();
        };
      })(this));
    };

    BrowserSync.prototype.download = function(url, cb) {
      return mkdirp(path.dirname(this.filePath), (function(_this) {
        return function() {
          _this.file = fs.createWriteStream(_this.filePath);
          return http.get(url, function(response) {
            return response.pipe(_this.file).on('error', function(err) {
              fs.unlink(_this.file);
              return cb(err);
            }).on('finish', function() {
              return _this.file.close(cb);
            });
          });
        };
      })(this));
    };

    return BrowserSync;

  })();

  module.exports = BrowserSync;

}).call(this);
