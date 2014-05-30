'use strict';

var NoPlebs = function (options) {
  var level = require('level');
  var uuid = require('uuid');
  var Sublevel = require('level-sublevel');
  var concat = require('concat-stream');
  var through2 = require('through2');

  var setTime = function () {
    return Date.now();
  };

  options = options || {};

  var LIMIT = 25;
  var WS_MATCH = /[\s+]/gi;

  this.dbPath = options.db || './db';
  this.origins = {};
  this.limit = parseInt(options.limit || LIMIT, 10);

  var self = this;

  var originClean = function (origin) {
    return origin.replace(/[^\w+]/gi, '').replace(WS_MATCH, '');
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
    var commentClean;

    if (typeof comment !== 'object') {
      commentClean = comment.replace(WS_MATCH, '');

      if (commentClean.length < 1) {
        next(new Error('Comment cannot be empty'));
        return;
      }
    }

    var authorClean = author.replace(WS_MATCH, '');

    if (originClean(origin).length < 1) {
      next(new Error('Origin cannot be empty'));
      return;
    }

    if (authorClean.length < 1) {
      next(new Error('Author cannot be empty'));
      return;
    }

    var originDB = getOrSetOrigin(originClean(origin));
    var currDate = setTime();

    var commentDetail = {
      key: currDate,
      created: currDate,
      comment: comment,
      author: author,
      origin: defaultOrigin,
      anchorLink: defaultOrigin + '#comments-' + currDate
    };

    originDB.put(currDate, commentDetail, function (err) {
      if (err) {
        next(err);
        return;
      }

      next(null, commentDetail);
    });
  };

  this.getComments = function (origin, reverse, next) {
    origin = originClean(origin);

    var originDB = getOrSetOrigin(origin);

    var rs = this.origins[origin].createReadStream({
      limit: this.limit,
      reverse: reverse
    });

    rs.pipe(concat(function (comments) {
      next(null, {
        comments: comments
      });
    }));

    rs.on('error', function (err) {
      next(err);
    });
  };

  this.getAllCommentKeys = function (origin, next) {
    origin = originClean(origin);

    var originDB = getOrSetOrigin(origin);
    var keys = [];

    var rs = this.origins[origin].createKeyStream();

    rs.pipe(through2(function (data, encoding, next) {
      keys.push(data.toString());
      next();
    })).pipe(concat(function () {
      next(null, {
        comments: keys
      });
    }));

    rs.on('error', function (err) {
      next(err);
    });
  };

  this.getComment = function (origin, key, next) {
    origin = originClean(origin);

    var originDB = getOrSetOrigin(origin);

    originDB.get(key, function (err, comment) {
      if (err) {
        next(err);
        return;
      }

      next(null, comment);
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
