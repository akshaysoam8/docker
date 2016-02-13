var mongoose = require('mongoose');

var Schema = mongoose.Schema;

module.exports = new Schema({
  container_Id : String,
  type : String,
  time : Date,
  threshold : Number,
  current_value : Number
});
