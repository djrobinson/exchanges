require('dotenv').config();

var poloniex = require('./poloniex.es');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/testPoloniex');

poloniex.open();