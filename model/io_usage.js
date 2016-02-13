var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var IO_usage = new Schema({
  container_Id : String,
  read : Number,
  write : Number,
  sync : Number,
  async : Number,
  total : Number
});

module.exports = IO_usage;
