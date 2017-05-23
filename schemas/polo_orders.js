
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var poloOrders = new Schema({
  "created_at" : Date,
  "order_books": {}
});

var orders = mongoose.model('poloOrders', poloOrders);

module.exports = orders;