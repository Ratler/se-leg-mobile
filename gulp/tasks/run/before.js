var utils = require(global.GULP_DIR + '/utils');
var config = require(global.GULP_DIR + '/gulp.config');

var plugins = require('gulp-load-plugins')({lazy: true});

/**
 * Run needed tasks before running the app.
 */
module.exports = {
  dep: [],
  fn: function (gulp, done) {
    utils.log('*** Run needed tasks before running the app ***');

    return plugins.sequence.use(gulp)(
      'environment',
      'startup',
        done
    );
  }
};

