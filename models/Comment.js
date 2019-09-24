const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    posterId: { type: String, required: true },
    // the id of a artefact or group
    postedOnId: { type: String, required: true },
    datePosted: { type: Date, default: Date.now },
    content: { type: String, required: true },
    protected: { type: Boolean, default: false }
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
