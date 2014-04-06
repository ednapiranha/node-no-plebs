'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');
var child = require('child_process');
var concat = require('concat-stream');
var NoPlebs = require('../main');

var n = new NoPlebs({
  db: './test/db'
});

var key;

describe('no', function () {
  after(function () {
    child.exec('rm -rf ./test/db/*');
  });

  describe('.addComment', function () {
    it('should add a new comment', function (done) {
      n.addComment('test comment', 'http://someurl/123', 'jen', function (err, c) {
        should.exist(c);
        key = c.key;
        c.comment.should.eql('test comment');
        c.origin.should.eql('http://someurl/123');
        c.author.should.eql('jen');
        done();
      });
    });

    it('should not add a new comment with a missing comment', function (done) {
      n.addComment(' ', 'http://someurl/123', 'jen', function (err, c) {
        should.not.exist(c);
        should.exist(err);
        done();
      });
    });

    it('should not add a new comment with a missing origin', function (done) {
      n.addComment('test comment', ' ', 'jen', function (err, c) {
        should.not.exist(c);
        should.exist(err);
        done();
      });
    });

    it('should not add a new comment with a missing author', function (done) {
      n.addComment('test comment', 'http://someurl/123', ' ', function (err, c) {
        should.not.exist(c);
        should.exist(err);
        done();
      });
    });
  });

  describe('.getComments', function () {
    it('should get comments', function (done) {
      n.getComments('http://someurl/123', false, function (err, c) {
        should.exist(c);
        done();
      });
    });
  });

  describe('.removeComment', function () {
    it('should remove a comment', function (done) {
      n.removeComment('http://someurl/123', key, function (err, c) {
        should.exist(c);
        n.getComments('http://someurl/123', false, function (err, c) {
          c.comments.length.should.eql(0);
          done();
        });
      });
    });
  });
});
