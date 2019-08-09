const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artefactSchema = new Schema(
  {
    // owner id, foreign key
    userId: String,

    Title: { type: String, required: true },
    Description: { type: String, required: true },

    dateAdded: { type: Date, default: Date.now },
    dateObtained: Date,

    // current location
    currLoc: String,
    currLng: Number,
    currLat: Number,

    // obtained location
    obtLoc: String,
    obtLng: Number,
    obtLat: Number,

    // url of the images
    imageURLs:[String],

    // list of user ids who've liked
    likes: [String]
  }
);

const Artefact = mongoose.model('Artefact',artefactSchema);

module.exports = Artefact;
