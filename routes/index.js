var express = require('express');
var router = express.Router();
var poloOrders = require('../schemas/polo_orders');
var Moment = require('moment');

router.get('/test', function(req, res) {
  res.json({
    "test": 0
  });
});

router.get('/poloorders', function(req, res) {
  poloOrders.find({}, function(err, data) {
    if (err) {
      res.json(err);
    }
    res.json(data);
  });
});

router.get('/poloorders/five', function(req, res) {
  var now = Moment();
  var xMinutesAgo = now.subtract(5, 'minutes');
  var xMinDate = xMinutesAgo.toDate();
  poloOrders.find({
    "created_at": {
      $gte: xMinDate
    }
  }, function(err, data) {
    if (err) {
      res.json(err);
    }
    res.json(data)
  })
})

router.get('/poloorders/thirty', function(req, res) {
  var now = Moment();
  var xMinutesAgo = now.subtract(30, 'minutes');
  var xMinDate = xMinutesAgo.toDate();
  poloOrders.find({
    "created_at": {
      $gte: xMinDate
    }
  }, function(err, data) {
    if (err) {
      res.json(err);
    }
    res.json(data)
  })
})

module.exports = router;