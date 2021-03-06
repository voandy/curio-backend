const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  // admin id, foreign key
  adminId: { type: String, required: true },

  title: { type: String, required: true },
  description: { type: String, required: true },

  dateCreated: { type: Date, default: Date.now },

  // cover photo URL
  coverPhoto: String,

  // list of artefacts posted in this group
  artefacts: [
    {
      artefactId: String,
      dateAdded: { type: Date, default: Date.now }
    }
  ],

  // list of members of this group
  members: [
    {
      memberId: String,
      dateAdded: { type: Date, default: Date.now }
    }
  ],

  // list of user ids who've liked
  likes: [String],

  // list of users who have been invited to join a group
  pendingInvitations: [String],

  // list of users who have requested to join a private grou
  pendingRequests: [String],

  // privacy: 0 = public, 1 = private
  privacy: { type: Number, default: 0 },

  protected: { type: Boolean, default: false }
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
