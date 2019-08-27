const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    posterId: { type: String, required: true },
    datePosted: { type: Date, default: Date.now },
    content: String,
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
