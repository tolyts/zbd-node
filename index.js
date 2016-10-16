var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();
var pg = require('pg');
var async = require('async');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response) {
  var loc = {};
  async.parallel([
    function(callback) {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
          client.query('SELECT * FROM salesforce.contact LIMIT 5', function(err, result) {
            done();
            if (err) {
              console.error(err);
              callback(err);
            }
            else {
              loc.contacts = result.rows;
            }
            callback();
          });
        });
      },
      function(callback) {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
          client.query('SELECT * FROM salesforce.story__c LIMIT 5', function(err, result) {
            done();
            if (err) {
              console.error(err);
              callback(err);
            }
            else {
              loc.stories = result.rows;
            }
            callback();
          });
        });
      }
  ], function(err) {
    response.render('pages/index', { loc });
      // results is now equals to: {one: 'abc\n', two: 'xyz\n'}
  });

});

app.get('/story/:id', function(request, response) {
  var loc = {};
  var storyId = request.params.id;
  async.parallel([
    function(callback) {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
          client.query({
              text: 'SELECT * FROM salesforce.story__c where story_id__c= $1',
              values: [storyId]
            }, function(err, result) {
            done();
            if (err) {
              console.error(err);
              callback(err);
            }
            else {
              loc.story = result.rows[0];
            }
            callback();
          });
        });
      },
      function(callback) {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
          client.query('SELECT * FROM salesforce.story__c LIMIT 10', function(err, result) {
            done();
            if (err) {
              console.error(err);
              callback(err);
            }
            else {
              loc.stories = result.rows;
            }
            callback();
          });
        });
      }
  ], function(err) {
    response.render('pages/story', { loc });
      // results is now equals to: {one: 'abc\n', two: 'xyz\n'}
  });
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});

app.get('/contacts', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM salesforce.contact', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
