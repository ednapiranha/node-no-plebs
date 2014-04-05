'use strict';

var NoPlebs = function (options) {
  var level = require('level');
  var uuid = require('uuid');
  var Sublevel = require('level-sublevel');
  var concat = require('concat-stream');

  var setTime = function () {
    return Date.now();
  };

  if (!options) {
    options = {};
  }

  this.dbPath = options.db || './db';
  this.origins = {};

  var self = this;

  var originClean = function (origin) {
    return origin.replace(/[^\w+]/gi, '').replace(/[\s+]/gi, '');
  };

  var getOrSetOrigin = function (origin) {
    if (!self.origins[origin]) {
      self.origins[origin] = Sublevel(level(self.dbPath + '/' + origin, {
        createIfMissing: true,
        valueEncoding: 'json'
      }));
    }

    return self.origins[origin];
  };

  this.addComment = function (comment, origin, author, next) {
    var defaultOrigin = origin;
    var commentClean = comment.replace(/[\s+]/gi, '');
    var authorClean = author.replace(/[\s+]/gi, '');

    if (commentClean.length < 1) {
      next(new Error('Comment cannot be empty'));
      return;
    }

    if (originClean(origin).length < 1) {
      next(new Error('Origin cnanot be empty'));
      return;
    }

    if (authorClean.length < 1) {
      next(new Error('Author cannot be empty'));
      return;
    }

    var originDB = getOrSetOrigin(originClean(origin));
    var currDate = setTime();

    var commentDetail = {
      key: currDate + '!comment',
      created: currDate,
      comment: comment,
      author: author,
      origin: defaultOrigin
    };

    originDB.put(currDate + '!comment', commentDetail, function (err) {
      if (err) {
        next(err);
        return;
      }

      next(null, commentDetail);
    });
  };

  this.getComments = function (origin, next) {
    origin = originClean(origin);

    var originDB = getOrSetOrigin(origin);

    var rs = this.origins[origin].createReadStream();

    rs.pipe(concat(function (comments) {
      next(null, {
        comments: comments
      });
    }));

    rs.on('error', function (err) {
      next(err);
    });
  };

  this.removeComment = function (origin, key, next) {
    var originDB = getOrSetOrigin(originClean(origin));

    originDB.del(key, function (err) {
      if (err) {
        next(err);
        return;
      }

      next(null, true);
    })
  };
};

module.exports = NoPlebs;
