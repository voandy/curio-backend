const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artefactSchema = new Schema(
  {
    // owner id, foreign key
    userId: { type: String, required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },

    datePosted: { type: Date, default: Date.now },
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
    imageURLs: [String],

    // list of user ids who've liked
    likes: [String],

    // list of comments made on this artefact
    comments: [String]
  }
);

const Artefact = mongoose.model('Artefact', artefactSchema);

module.exports = Artefact;
