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

var mainPairs = ['BTC_XRP', 'BTC_ETH', 'BTC_ETC', 'BTC_XMR', 'BTC_LTC', 'BTC_STR', 'BTC_XEM', 'BTC_ZEC', 'BTC_DGB', 'BTC_DASH'];

const d3formatter = (data, type) => {
  // var pairKeys = Object.keys(data[0].order_books);
  var pairKeys = mainPairs;
  const sortedChangesByPair = data.reduce((acc, value) => {
    pairKeys.forEach(val => {
      var current = (!acc[val]) ? [] : acc[val];
      if (value.order_books) {
        current.push((value.order_books[val].bidChanges  - value.order_books[val].askChanges))
        acc[val] = current;
      }
    })
    return acc;
  }, {});
  const sortedChangesAll = data.reduce((acc, value) => {
    pairKeys.forEach(val => {
      if (value.order_books) {
        acc.push((value.order_books[val].bidChanges  - value.order_books[val].askChanges))
      }
    })
    return acc;
  }, []);
  const n = data.length + 1;
  console.log("Here's N: ", n);
  const allN = sortedChangesAll.length;
  console.log("All N: ", allN);
  const allD = Math.floor(allN / 10);
  console.log("All D: ", allD);
  const d = Math.floor(n / 10);
  console.log("Single D: ", d);
  function sortNumber(a,b) {
    return a - b;
  }
  const averaged = data.reduce((acc, value) => {
    pairKeys.forEach(val => {
      var current = acc[val] || 0;
      if (value.order_books) {
        current += ((value.order_books[val].bidChanges  - value.order_books[val].askChanges));
        acc[val] = current;
      }
    });
    return acc;
  }, {});
  // console.log('Averaged!', averaged);
  var superSorted = pairKeys.reduce((acc, val) => {
    const s = sortedChangesByPair[val].sort(sortNumber);
    acc[val] = [s[0], s[d], s[d * 2], s[d * 3], s[d * 4], s[d * 5], s[d * 6], s[d * 7], s[d * 8], s[d * 9]];
    return acc;
  }, {});
  console.log('Super Sorted', superSorted);
  var superSortedAll = pairKeys.reduce((acc, val) => {
    const s = sortedChangesAll.sort(sortNumber);
    var dec = [s[0], s[allD], s[allD * 2], s[allD * 3], s[allD * 4], s[allD * 5], s[allD * 6], s[allD * 7], s[allD * 8], s[allD * 9]];
    return dec;
  });
  console.log("Super Sorted All", superSortedAll);
  function normalizeData(count, val) {
    var iterator = 0;
    superSorted[val].forEach(dec => {
      if (count > superSorted[val][iterator]) {
        iterator++;
      }
    });
    return iterator;
  }
  function normalizeAllData(count) {
    var iterator = 0;
    superSortedAll.forEach(dec => {
      if (count >= dec) {
        iterator++;
      }
    });
    return iterator;
  }
  function movingAverage(acc, val) {
    var endOfAcc = acc.length;
    acc.reduce((acc2, val2) => {
      acc2
    }, 0);

  }

  const returnValue = data.reduce((acc, value) => {

    const dayPairs = pairKeys.map(val => {
      // const orderBookNormalizer = normalizeData(((value.order_books[val].orderBookModify_BIDS - value.order_books[val].orderBookRemoveBid) - (value.order_books[val].orderBookModify_ASKS - value.order_books[val].orderBookRemoveAsk)), val);
      const orderBookNormalizer = normalizeData((value.order_books[val].bidChanges  - value.order_books[val].askChanges), val);
      // const tempTest = ((value.order_books[val].orderBookModify_BIDS - value.order_books[val].orderBookRemoveBid) - (value.order_books[val].orderBookModify_ASKS - value.order_books[val].orderBookRemoveAsk));
      return {
        pair: val,
        minute: Moment(value.created_at).utc().format(),
        value: orderBookNormalizer,
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
  var xMinutesAgo = now.subtract(180, 'minutes');
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
  var xMinutesAgo = now.subtract(1200, 'minutes');
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
    // console.log('NOrmalized', formatted);
    res.json(formatted)
  })
});




module.exports = router;