var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/testPoloniex');
var Moment = require('moment');
var poloOrders = require('./schemas/polo_orders');
var pairs = require('./pairs');
var pullData = function() {
    console.log('Is this being called?');
  var now = Moment();
  var xMinutesAgo = now.subtract(200, 'minutes');
  var xMinDate = xMinutesAgo.toDate();
  poloOrders.find({
    "created_at": {
      $gte: xMinDate
    }
  }, function(err, data) {
    if (err) {
      console.log('errrrr', err);
      throw err;
    }
    console.log('TEN MINUTES AGO: ', data);
  })
};

pullData();;