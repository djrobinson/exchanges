var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});
var Moment = require('moment');

var poloOrders = require('./schemas/polo_orders');

///needs to be tested
var allMarkets = require('./pairs');

var openPairs = {};

var doYoShit = function(event, pair) {
  if (event.type === 'orderBookModify') {
    if (event.data.type === 'bid') {
      openPairs[pair].orderBookModify_BIDS++;
      openPairs[pair].bidChanges += (parseFloat(event.data.amount) * parseFloat(event.data.rate));
      openPairs[pair].totalChangeCount++;
    };

    if (event.data.type === 'ask') {
      openPairs[pair].orderBookModify_ASKS++;
      openPairs[pair].askChanges += (parseFloat(event.data.amount) * parseFloat(event.data.rate));
      openPairs[pair].totalChangeCount++;
    };


  }
  if (event.type === 'orderBookRemove') {
    openPairs[pair].orderBookRemove++;
    openPairs[pair].totalChangeCount++;
  }
  if (event.type === 'newTrade') {
    openPairs[pair].newTrade++;
    openPairs[pair].totalChangeCount++;
    if (event.data.type === 'buy') {
      openPairs[pair].buyVolume += parseFloat(event.data.total);
    }
    if (event.data.type === 'sell') {
      openPairs[pair].sellVolume += parseFloat(event.data.total);
    }
  }
};

var sortedOpenPairs = function(pairs) {
  return Object.keys(pairs).sort(function(a, b) {
    return pairs[b].totalChangeCount - pairs[a].totalChangeCount;
  });
};

var startMarket = function(pair, session) {
  function marketEvent (args,kwarg) {
    args.forEach(function(event) {
      doYoShit(event, pair);
    });
  }
  session.subscribe(pair, marketEvent);
};

connection.onopen = function (session) {
  console.log('Opening connection');
  allMarkets.forEach(function(pair) {
    openPairs[pair] = {
      orderBookModify_BIDS: 0,
      orderBookModify_ASKS: 0,
      newTrade: 0,
      orderBookRemove: 0,
      buyVolume: 0,
      sellVolume: 0,
      bidChanges: 0,
      askChanges: 0,
      totalChangeCount: 0
    };
    startMarket(pair, session);
  });
};

connection.onclose = function () {
  console.log("Websocket connection closed");
};

setInterval(function() {
  var orders = new poloOrders();
  var sorted = sortedOpenPairs(openPairs);
  orders.created_at = Moment().toDate();
  orders.order_books = openPairs;
  orders.save(function(err, data) {
    if (err) {
      throw err;
    } else {
      console.log('Data Saved: ', data);
      allMarkets.forEach(function(pair) {
        openPairs[pair] = {
          orderBookModify_BIDS: 0,
          orderBookModify_ASKS: 0,
          newTrade: 0,
          orderBookRemove: 0,
          buyVolume: 0,
          sellVolume: 0,
          bidChanges: 0,
          askChanges: 0,
          totalChangeCount: 0
        };
      });
    }
  })
}, 60000)


module.exports = connection;