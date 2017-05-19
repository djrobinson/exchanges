var bittrex = require('./node_modules/node.bittrex.api/node.bittrex.api.js');

// bittrex.options({
//     'apikey' : API_KEY,
//     'apisecret' : API_SECRET,
//     'stream' : true,
//     'verbose' : true,
//     'cleartext' : false
// });

bittrex.getmarketsummaries( function( data ) {
    for( var i in data.result ) {
        bittrex.getticker( { market : data.result[i].MarketName }, function( ticker ) {
            console.log( ticker );
        });
    }
});

bittrex.getorderbook({ market : 'BTC-LTC', depth : 10, type : 'both' }, function( data ) {
    console.log( data );
});