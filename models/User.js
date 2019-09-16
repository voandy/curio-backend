const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    username: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },

    dateJoined: { type: Date, default: Date.now },
    dob: Date,

    profilePic: String,

    // list of comment ids made on this User
    comments: [String]
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
