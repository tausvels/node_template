const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// creating a new data structure/Schema to pass that into model
const userSchema = new Schema({
  username: String,
  email: String,
  google_id: String,
  thumbnail: String
});

// creating the model/collection
const User = mongoose.model('user', userSchema);

module.exports = User;