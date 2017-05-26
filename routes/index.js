var express = require('express');
var router = express.Router();
var poloOrders = require('../schemas/polo_orders');
var Moment = require('moment');

router.get('/poloorders', function(req, res) {
  poloOrders.find({}, function(err, data) {
    if (err) {
      res.json(err);
    }
    res.json(data);
  });
});

var mainPairs = ['ETH_ETC', 'ETH_ZEC', 'BTC_XRP', 'BTC_ETH', 'BTC_ETC', 'BTC_XMR', 'BTC_LTC', 'BTC_STR', 'BTC_DOGE', 'BTC_XEM', 'BTC_SC', 'BTC_SYS', 'BTC_ZEC', 'BTC_DGB', 'BTC_DASH', 'BTC_BCN'];

const d3formatter = (data, type) => {
  var pairKeys = mainPairs;
  const sortedChanges = data.reduce((acc, value) => {
    pairKeys.forEach(val => {
      var current = (!acc[val]) ? [] : acc[val];
      if (value.order_books) {
        current.push(value.order_books[val].orderBookRemoveAsk - value.order_books[val].orderBookRemoveBid)
        acc[val] = current;
      }
    })
    return acc;
  }, {});

  const n = data.length + 1;
  const d = Math.floor(n / 10);
  function sortNumber(a,b) {
    return a - b;
  }
  var superSorted = pairKeys.reduce((acc, val) => {
    const s = sortedChanges[val].sort(sortNumber);
    console.log('Did S sort right?', s);
    acc[val] = [s[0], s[d * 2], s[d * 3], s[d * 4], s[d * 5], s[d * 6], s[d * 7], s[d * 8], s[d * 9]];
    return acc;
  }, {});
  function normalizeData(count, val) {
    var iterator = 0;
    superSorted[val].forEach(dec => {
      if (count > superSorted[val][iterator]) {
        iterator++;
      }
    });
    return iterator;
  }
  const returnValue = data.reduce((acc, value) => {

    const dayPairs = pairKeys.map(val => {
      const orderBookNormalizer = normalizeData((value.order_books[val].orderBookRemoveAsk - value.order_books[val].orderBookRemoveBid), val);
      return {
        pair: val,
        minute: Moment(value.created_at).utc().format(),
        value:(value.order_books[val].orderBookRemoveAsk - value.order_books[val].orderBookRemoveBid),
        totalChangeCount: value.order_books[val].totalChangeCount,
        askChanges: value.order_books[val].askChanges,
        bidChanges: value.order_books[val].bidChanges,
        sellVolume: value.order_books[val].sellVolume,
        buyVolume: value.order_books[val].buyVolume,
        orderBookRemove: value.order_books[val].orderBookRemove,
        newTrade: value.order_books[val].newTrade,
        orderBookModify_ASKS: value.order_books[val].orderBookModify_ASKS,
        orderBookModify_BIDS: value.order_books[val].orderBookModify_BIDS,
        orderBookRemoveBid: value.order_books[val].orderBookRemoveBid,
        orderBookRemoveAsk: value.order_books[val].orderBookRemoveAsk
      }
    });
    return acc.concat(dayPairs);
  }, [])
  return returnValue;
}
//created_at: 2017-05-24T22:20:11.649Z

router.get('/poloorders/five', function(req, res) {
  var now = Moment();
  var xMinutesAgo = now.subtract(60, 'minutes');
  var xMinDate = xMinutesAgo.toDate();
  poloOrders.find({
    "created_at": {
      $gte: xMinDate
    }
  }, function(err, data) {
    if (err) {
      res.json(err);
    }
    const formatted = d3formatter(data);
    res.json(formatted)
  })
})

router.get('/poloorders/thirty', function(req, res) {
  var now = Moment();
  var xMinutesAgo = now.subtract(600, 'minutes');
  var xMinDate = xMinutesAgo.toDate();
  poloOrders.find({
    "created_at": {
      $gte: xMinDate
    }
  }, function(err, data) {
    if (err) {
      res.json(err);
    }
    const formatted = d3formatter(data);
    res.json(formatted)
  })
});




module.exports = router;