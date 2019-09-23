const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  userId: { type: String, required: true },
  userPushToken: { type: String, required: true },

  datePosted: { type: Date, default: Date.now },
  content: String,

  thumbnailURL: String,
  seenStatus: { type: Boolean, required: true, default: false },

  category: { type: String, required: true },
  refId: { type: String, required: true },

  protected: { type: Boolean, default: false }
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
