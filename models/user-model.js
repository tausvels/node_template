const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// creating user data-sctructure/schema //
const userSchema = new Schema({
  username: String,
  email: String,
  google_id: String,
  thumbnail: String
});

// creating the user model according to the schema
const User = mongoose.model('user', userSchema);

module.exports = User;