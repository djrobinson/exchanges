var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});


var allMarkets = ['BTC_AMP',
'BTC_ARDR',
'BTC_BCN',
'BTC_BCY',
'BTC_BELA',
'BTC_BLK',
'BTC_BTCD',
'BTC_BTM',
'BTC_BTS',
'BTC_BURST',
'BTC_CLAM',
'BTC_DASH',
'BTC_DCR',
'BTC_DGB',
'BTC_DOGE',
'BTC_EMC2',
'BTC_ETC',
'BTC_ETH',
'BTC_EXP',
'BTC_FCT',
'BTC_FLDC',
'BTC_FLO',
'BTC_GAME',
'BTC_GNO',
'BTC_GNT',
'BTC_GRC',
'BTC_HUC',
'BTC_LBC',
'BTC_LSK',
'BTC_LTC',
'BTC_MAID',
'BTC_NAUT',
'BTC_NAV',
'BTC_NEOS',
'BTC_NMC',
'BTC_NOTE',
'BTC_NXC',
'BTC_NXT',
'BTC_OMNI',
'BTC_PASC',
'BTC_PINK',
'BTC_POT',
'BTC_PPC',
'BTC_RADS',
'BTC_REP',
'BTC_RIC',
'BTC_SBD',
'BTC_SC',
'BTC_SJCX',
'BTC_STEEM',
'BTC_STR',
'BTC_STRAT',
'BTC_SYS',
'BTC_VIA',
'BTC_VRC',
'BTC_VTC',
'BTC_XBC',
'BTC_XCP',
'BTC_XEM',
'BTC_XMR',
'BTC_XPM',
'BTC_XRP',
'BTC_XVC',
'BTC_ZEC',
'ETH_ETC',
'ETH_GNO',
'ETH_GNT',
'ETH_LSK',
'ETH_REP',
'ETH_STEEM',
'ETH_ZEC',
'USDT_BTC',
'USDT_DASH',
'USDT_ETC',
'USDT_ETH',
'USDT_LTC',
'USDT_NXT',
'USDT_REP',
'USDT_STR',
'USDT_XMR',
'USDT_XRP',
'USDT_ZEC',
'XMR_BCN',
'XMR_BLK',
'XMR_BTCD',
'XMR_DASH',
'XMR_LTC',
'XMR_MAID',
'XMR_NXT',
'XMR_ZEC'];

const openPairs = {};

var doYoShit = function(event, pair) {
  if (event.type === 'orderBookModify') {
    // console.log(event, 'ZE OPEN 111 ');
    if (event.data.type === 'bid') {
      // openPairs[pair] += event.amount;
      openPairs[pair].orderBookModify_BIDS++;
      // console.log('Ze Open', openPairs[pair], 'Pair:', pair);

    };

    if (event.data.type === 'ask') {
      // openPairs[pair] += event.amount;
      openPairs[pair].orderBookModify_ASKS++;
      // console.log('Ze Open', openPairs[pair], 'Pair:', pair);

    };


    // console.log(pair, 'MODIFY', openPairs);
  }
  if (event.type === 'orderBookRemove') {
    // console.log(pair, 'REMOVE', event);
    openPairs[pair].orderBookRemove++;
  }
  if (event.type === 'newTrade') {
    // console.log(pair, 'NEWTRADE', event);
    openPairs[pair].newTrade++;
  }
};

var sortedOpenPairs = function(pairs) {
  return Object.keys(pairs).sort(function(a, b) {
    return pairs[b].newTrade - pairs[a].newTrade;
  });
};

var startMarket = function(pair, session) {
  function marketEvent (args,kwarg) {
    const sorted = sortedOpenPairs(openPairs);
    console.log('#1: ', sorted[0], openPairs[sorted[0]]);
    console.log('#2: ', sorted[1], openPairs[sorted[1]]);
    console.log('#3: ', sorted[2], openPairs[sorted[2]]);
    console.log('#4: ', sorted[3], openPairs[sorted[3]]);
    console.log('#5: ', sorted[4], openPairs[sorted[4]]);
    console.log('#6: ', sorted[5], openPairs[sorted[5]]);
    console.log('#7: ', sorted[6], openPairs[sorted[6]]);
    console.log('#8: ', sorted[7], openPairs[sorted[7]]);

    args.forEach(function(event) {
      doYoShit(event, pair);
    });
  }
  session.subscribe(pair, marketEvent);

};

connection.onopen = function (session) {
  allMarkets.forEach(function(pair) {
    openPairs[pair] = {
      orderBookModify_BIDS: 0,
      orderBookModify_ASKS: 0,
      newTrade: 0,
      orderBookRemove: 0
    };
    startMarket(pair, session);
  });

};

connection.onclose = function () {
  console.log("Websocket connection closed");
};

connection.open();