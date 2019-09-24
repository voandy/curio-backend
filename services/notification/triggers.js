const mongoose = require("mongoose");
const expoHandler = require("./expo-handler");

// load User model
const User = mongoose.model("User");
// load Artefact model
const Artefact = mongoose.model("Artefact");
// load Notification model
const Notification = mongoose.model("Notification");

async function findArtefactById(artefactId) {
  return new Promise(resolve => {
    Artefact.findById(artefactId, function(err, artefact) {
      if (!err) {
        resolve(artefact);
      } else {
        resolve(null);
      }
    });
  });
}

async function findUserById(userId) {
  return new Promise(resolve => {
    User.findById(userId, function(err, user) {
      if (!err) {
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
}

//prettier-ignore
var triggerArtefactNotification = async function(artefactId, userId, comment=null) {
  // search for all required details
  let artefact = await findArtefactById(artefactId);
  let artefactActor = await findUserById(userId);
  let artefactOwner = await findUserById(artefact.userId);

  // guard against undefined details
  if (!artefact || !artefactActor || !artefactOwner) {
    console.error("Error in finding required information");
    return;
  }
  // prepare data based on notification type
  var type = (comment) ? "comment" : "like" ;
  var message = (comment) ? " has commented on your artefact: " : " has liked your artefact: ";

  // prepare the new notification
  var notification = new Notification({
    userId: artefactOwner._id,
    userPushToken: artefactOwner.userPushToken,
    datePosted: new Date(),
    thumbnailURL: artefactActor.profilePic,
    seenStatus: false,
    category: "artefact",
    refId: artefact._id,
    data: JSON.stringify({
      type,
      otherUser: artefactActor.name,
      artefactTitle: artefact.title,
      message: artefactActor.name + message + artefact.title
    })
  });
  // save the notification to database
  notification.save(function(err, newNotification) {
    if (!err) {
      expoHandler.addUnsentNotification(newNotification);
    } else {
      console.log(err);
    }
  });

  return;
};

module.exports = {
  triggerArtefactNotification
};
