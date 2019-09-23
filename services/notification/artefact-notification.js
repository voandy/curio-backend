const mongoose = require("mongoose");
const expoHandler = require("./expo-handler");

// load User model
const User = mongoose.model("User");
// load comment model
const Comment = mongoose.model("Comment");
// load Artefact model
const Artefact = mongoose.model("Artefact");
// load Notification model
const Notification = mongoose.model("Notification");

var triggerLikeNotification = function(artefactId, userId) {
  Artefact.findById(artefactId, function(err, artefact) {
    User.findById(userId, function(err, artefactLiker) {
      User.findById(artefact.userId, function(err, artefactOwner) {
        var notification = new Notification({
          userId: artefactOwner._id,
          userPushToken: artefactOwner.userPushToken,
          datePosted: new Date(),
          content:
            artefactLiker.name +
            "has liked your artefact: " +
            artefact.title +
            ".",
          thumbnailURL: artefactLiker.profilePic,
          seenStatus: false,
          category: "Artefact",
          refId: artefact._id,
          protected: false
        });
        // save it to database
        notification.save(function(err, newNotification) {
          if (!err) {
            expoHandler.addUnsentNotifications(newNotification);
          } else {
            console.log(err);
          }
        });
      });
    });
  });
};

module.exports = {
  triggerLikeNotification
};
