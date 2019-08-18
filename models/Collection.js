const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionSchema = new Schema(
  {
    // admin id, foreign key
    adminId: { type: String, required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },

    dateCreated: { type: Date, default: Date.now },

    // cover photo URL
    coverPhoto: String,

    // list of artefacts in this collection
    artefacts: [{
      artefactId: String,
      dateAdded: { type: Date, default: Date.now }
    }],

    // list of comments made on this collection
    comments: [String]
  }
);

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
