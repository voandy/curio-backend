const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    // admin id, foreign key
    adminId: { type: String, required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },

    dateCreated: { type: Date, default: Date.now },

    // cover photo URL
    coverPhoto: String,

    // list of artefacts posted in this group
    artefacts: [{
      artefactId: String,
      dateAdded: { type: Date, default: Date.now }
    }],

    // list of comments made on this group
    comments: [String]
  }
);

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
