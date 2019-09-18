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
    images: [{
      URL: String,
      dateAdded: { type: Date, default: Date.now }
    }],

    // list of user ids who've liked
    likes: [String],

    // privacy: 0 = public, 1 = private
    privacy: { type: Number, default: Date.now },

    protected: { type: Boolean, default: false }
  }
);

const Artefact = mongoose.model('Artefact', artefactSchema);

module.exports = Artefact;
