var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Percpu_usage = new Schema({
  container_Id : String,
  Core0 : Number,
  Core1 : Number,
  Core2 : Number,
  Core3 : Number,
});

module.exports = Percpu_usage;
