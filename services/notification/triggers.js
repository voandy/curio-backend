const mongoose = require("mongoose");
const expoHandler = require("./expo-handler");

// load User model
const User = mongoose.model("User");
// load Artefact model
const Artefact = mongoose.model("Artefact");
// load Notification model
const Notification = mongoose.model("Notification");
// load Group model
const Group = mongoose.model("Group");

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

// artefact notification triggers functions //
//prettier-ignore
const triggerArtefactNotif = async function(artefactId, userId, comment=null) {
  // search for all required details
  let artefact = await findArtefactById(artefactId);
  // run search query simultaneously (improve efficiency)
  Promise.all([
    findUserById(userId),
    findUserById(artefact.userId)
  ]).then(users => {
    // assign users
    let artefactActor = users[0];
    let artefactOwner = users[1];
    // guard against undefined details
    if (!artefact || !artefactActor || !artefactOwner) {
      console.error("Error in finding required information");
      return;
    }
    // prepare data based on notification type
    const type = (comment) ? "comment" : "like" ;
    // send notification to artefact owner
    sendArtefactNotif(artefact, artefactOwner, artefactActor, artefactOwner, type);
    // send notifications to the associated group's members if found
    //prettier-ignore
    Group.findOne({ artefacts: { $elemMatch: { artefactId }}}, function(err, group) {
      // early return
      if (err) return res.sendStatus(404);
      // if no such group exists, return early
      if (!group) return;
      // send notification to each member
      for (member of group.members) {
        // skips owner to avoid duplicate notification
        if (member.memberId.toString() === artefactOwner._id.toString()) continue;
        // find each member's data 
        User.findById(member.memberId, function(err, user) {
          // send out notification
          sendArtefactNotif(
            artefact, 
            user, 
            artefactActor, 
            artefactOwner, 
            type
          );
        })
    }});
  });
  return;
};

//prettier-ignore
const sendArtefactNotif = function(artefact, target, artefactActor, artefactOwner, type) {
  // decide the person's identity to be used in message 
  const notifTarget = (target._id.toString() === artefactOwner._id.toString())
    ? "your"
    : artefactOwner.name + "'s";
  // create message based on type and notifOwner
  const message = (type === "comment")
    ? ` has commented on ${notifTarget} artefact: `
    : ` has liked ${notifTarget} artefact: `;

  // prepare the new notification
  var notification = new Notification({
    userId: target._id,
    userPushToken: target.userPushToken,
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
      // send to expo backend to show notification on user's device
      expoHandler.addUnsentNotification(newNotification);
    } else {
      console.log(err);
    }
  });
  return;
};

// delete all notifications associated with the artefact
const deleteAllArtefactNotif = async function(artefactId) {
  Notification.deleteMany({ refId: artefactId }, function(err) {
    if (err) {
      console.log("Error deleting all notifications for artefact: " + err);
    }
  });
};

module.exports = {
  triggerArtefactNotif,
  deleteAllArtefactNotif
};
