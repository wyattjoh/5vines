var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var url = 'http://5vines.com/craft-beer/';
var redis = require("redis"),
    client = redis.createClient('redis://redis:6379');

var REDIS_KEY = "beers"; // the key in redis
var REDIS_EXPIRY = parseInt(process.env.EXPIRY); // one hour cache in redis

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  client.get(REDIS_KEY, function(err, reply) {
    if (reply) {
      var beers = JSON.parse(reply);

      res.json(beers);
      return;
    }

    request(url, function(err, response, html){
    // fs.readFile('src.html', function(err, html) {
      if (err) {
        return;
      }

      // Next, we'll utilize the cheerio library on the returned html which will
      // essentially give us jQuery functionality
      var $ = cheerio.load(html);

      async.parallel({
        current: function(cb) {
          var currentBeers = [];

          $('.wpb_row ul').eq(0).children().each(function(i, ulEL) {
            var beer = $(ulEL).text();

            currentBeers.push(beer);
          });

          cb(null, currentBeers);
        },
        soon: function(cb) {
          var upcommingBeers = [];

          $('.wpb_row ul').eq(1).children().each(function(i, ulEL) {
            var beer = $(ulEL).text();

            upcommingBeers.push(beer);
          });

          cb(null, upcommingBeers);
        }
      }, function(err, results) {
        client.set(REDIS_KEY, JSON.stringify(results));
        client.expire(REDIS_KEY, REDIS_EXPIRY);

        res.json(results);
      });
    });
  });
});

module.exports = router;
