var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Memory_usage = new Schema({
  container_Id : String,
  memory_usage : Number,
});

module.exports = Memory_usage;
