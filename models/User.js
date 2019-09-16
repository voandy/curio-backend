const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    // username: { type: String, required: true },
    username: String,
    name: { type: String, required: true },
    password: { type: String, required: true },

    dateJoined: { type: Date, default: Date.now },
    dob: Date,

    profilePic: String,

    // list of groups of which this user is a member
    groups: [{
      groupId: String,
      dateJoined: { type: Date, default: Date.now },
      pinned: false
    }],

    protected: { type: Boolean, default: false }
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
