var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Network_usage = new Schema({
  container_Id : String,
  received_usage : Number,
  sent_usage : Number,
});

module.exports = Network_usage;
