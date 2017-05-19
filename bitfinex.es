const WS = require('ws')
const _ = require('lodash')
const async = require('async')
const fs = require('fs')
const moment = require('moment')

const pair = process.argv[2]

const conf = {
  wshost: "wss://api.bitfinex.com/ws/2"
}

const logfile = __dirname + '/logs/ws-book-err.log'

const BOOK = {}

console.log(pair, conf.wshost)

let connected = false
let connecting = false
let cli

function connect() {
  if (connecting || connected) return
  connecting = true

  cli = new WS(conf.wshost, { /*rejectUnauthorized: false*/ })

  cli.on('open', function open() {
    console.log('WS open')
    connecting = false
    connected = true
    BOOK.bids = {}
    BOOK.asks = {}
    BOOK.psnap = {}
    BOOK.mcnt = 0
    cli.send(JSON.stringify({ event: "subscribe", channel: "book", pair: pair, prec: "P0" }))
  })

  cli.on('close', function open() {
    console.log('WS close')
    connecting = false
    connected = false
  })

  cli.on('message', function(msg) {
    console.log('Heres the message', msg);
    msg = JSON.parse(msg)

    if (msg.event) return
    if (msg[1] === 'hb') return

    if (BOOK.mcnt === 0) {
      _.each(msg[1], function(pp) {
        pp = { price: pp[0], cnt: pp[1], amount: pp[2] }
        const side = pp.amount >= 0 ? 'bids' : 'asks'
        pp.amount = Math.abs(pp.amount)
        BOOK[side][pp.price] = pp
      })
    } else {
      let pp = { price: msg[1], cnt: msg[2], amount: msg[3], ix: msg[4] }
      if (!pp.cnt) {
        let found = true
        if (pp.amount > 0) {
          if (BOOK['bids'][pp.price]) {
            delete BOOK['bids'][pp.price]
          } else {
            found = false
          }
        } else if (pp.amount < 0) {
          if (BOOK['asks'][pp.price]) {
            delete BOOK['asks'][pp.price]
          } else {
            found = false
          }
        }
        if (!found) {
          fs.appendFileSync(logfile, "[" + moment().format() + "] " + pair + " | " + JSON.stringify(pp) + " BOOK delete fail side not found\n")
        }
      } else {
        let side = pp.amount >= 0 ? 'bids' : 'asks'
        pp.amount = Math.abs(pp.amount)
        BOOK[side][pp.price] = pp
      }
    }

    _.each(['bids', 'asks'], function(side) {
      let sbook = BOOK[side]
      let bprices = Object.keys(sbook)

      let prices = bprices.sort(function(a, b) {
        if (side === 'bids') {
          return +a >= +b ? -1 : 1
        } else {
          return +a <= +b ? -1 : 1
        }
      })

      BOOK.psnap[side] = prices
      //console.log("num price points", side, prices.length)
    })

    BOOK.mcnt++
    checkCross(msg)
  })
}

setInterval(function() {
  if (connected) return
  connect()
}, 2500)

function checkCross(msg) {
  let bid = BOOK.psnap.bids[0]
  let ask = BOOK.psnap.asks[0]
  if (bid >= ask) {
    let lm = [moment.utc().format(), "bid(" + bid + ")>=ask(" + ask + ")"]
    fs.appendFileSync(logfile, lm.join('/') + "\n")
  }
}

function saveBook() {
  const now = moment.utc().format('YYYYMMDDHHmmss')
  fs.writeFileSync(__dirname + "/logs/tmp-ws-book-" + pair + '-' + now + '.log', JSON.stringify({ bids: BOOK.bids, asks: BOOK.asks}))
}

setInterval(function() {
  saveBook()
}, 3000)