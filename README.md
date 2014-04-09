# No Plebs

Commenting module for your blog.

This is a standalone module to connect to any blog that can be pinned to a specific URL or identifier, an author and a comment.

## Setting up

```js
var n = new NoPlebs({
  db: './db-no-plebs',
  limit: 25
});
```

## Add a comment

```js
n.addComment('that track is amazing. wow mom.', 'http://someblog.com/123', <author>, function (err, comment) {
  if (!err) {
    console.log(comment);
  }
});
```

`author` is an identifier for the user posting. This can be whatever you want - Twitter username, real name, etc.

## Get all recent comments

```js
n.getComments('http://someblog.com/123', <reverse>, function (err, comments) {
  if (!err) {
    console.log(comments);
  }
});
```

`reverse` is an optional boolean to reverse the comment history from latest -> earliest. Defaults at earliest -> latest.

## Get a single comment

```js
n.getComment('http://someblog.com/123', <key>, function (err, comment) {
  if (!err) {
    console.log(comment);
  }
});
```

## Remove a comment

```js
n.removeComment('http://someblog.com/123', '1396755219283', function (err, status) {
  if (!err) {
    console.log('deleted!');
  }
});
```

## Tests

    npm test
