var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Cpu_usage = new Schema({
  container_Id : String,
  cpu_usage : Number,
});

module.exports = Cpu_usage;
