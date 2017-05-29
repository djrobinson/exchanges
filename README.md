# exchanges
Sample websocket (or polling where applicable) connections to 4 largest crytpoexchanges

## Purpose
Hack together examples of data feeds to the most active exchanges of Spring 2017 and select a candidate for long term price gathering.

## Instructions
To test a connection to a single exchange, execute each file individually:

```javacript
node poloniex.es
node bittrex.es
node bitfinex.es
node kraken.es
```

For saving and manipulating Poloniex data specifically, have mongodb running locally and run
```javascript
node app.js
```
Make alterations to how the data is stored in mongo inside of the poloniex.es file and adjust your schema & route files accordingly
