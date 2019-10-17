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
const triggerArtefactNotif = async function(artefactId, userId, type) {
  // search for all required details
  let artefact = await findArtefactById(artefactId);
  // run search query simultaneously (improve efficiency)
  Promise.all([
    findUserById(userId),
    findUserById(artefact.userId)
  ]).then(users => {
    // assign users
    // if userId is not passed in, it means actor = owner
    let artefactActor = !users[0] ? users[1] : users[0];
    let artefactOwner = users[1];
    // guard against undefined details
    if (!artefact || !artefactActor || !artefactOwner) {
      console.error("Error finding required information for artefact notification");
      return;
    }
    // send notification to artefact owner
    // if new artefact is added to group, no need to notify owner
    if (type !== "addNewArtefact") {
      sendArtefactNotif(artefact, artefactOwner, artefactActor, artefactOwner, type);
    }
    // for like and comment triggers, no need to notify group members
    if (type === "like" || type === "comment") return;

    // notify associated group's members
    Group.findOne({ artefacts: { $elemMatch: { artefactId }}}, function(err, group) {
      // early return
      if (err) return console.log("Error finding group for artefact notification");
      // if no such group exists, return early
      if (!group) return;
      // send notification to each member
      for (member of group.members) {
        // skips owner to avoid duplicate notification
        if (member.memberId === artefactOwner._id.toString()) continue;
        // find each member's data 
        User.findById(member.memberId, function(err, user) {
          // send out notification
          sendArtefactNotif(
            artefact, 
            user, 
            artefactActor, 
            artefactOwner, 
            type,
            group
          );
        })
    }});
  });
  return;
};

//prettier-ignore
const sendArtefactNotif = function(artefact, target, artefactActor, artefactOwner, type, group=null) {
  // decide the person's identity to be used in message 
  const notifTarget = (target._id.toString() === artefactOwner._id.toString())
    ? "your"
    : artefactOwner.name + "'s";

  let message;
  // create message based on type and notifOwner
  switch (type) {
    case "comment":
      message = `${artefactActor.name} commented on ${notifTarget} artefact: ${artefact.title}`;
      break;
    case "like":
      message = `${artefactActor.name} liked ${notifTarget} artefact: ${artefact.title}`;
      break;
    case "addNewArtefact":
      message = `${artefactActor.name} added ${artefact.title} to group: ${group.title}`;
      break;
  }
  // prepare the new notification
  var notification = new Notification({
    userId: target._id,
    userPushToken: target.userPushToken,
    datePosted: new Date(),
    thumbnailURL: artefactActor.profilePic,
    seenStatus: false,
    category: "artefact",
    refId: artefact._id,
    data: {
      type,
      message,
      otherUser: artefactActor._id,
    }
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

// delete artefact-liked notifications when the artefact is unliked
deleteArtefactLikeNotif = function(artefactId, userId) {
  // find the one notification to delete
  Notification.deleteOne(
    {
      userId,
      refId: artefactId,
      category: "artefact",
      "data.type": "like"
    },
    function(err) {
      if (err) {
        console.log(
          "Error deleting all artefact-liked notifications for artefact: " + err
        );
      }
    }
  );
};

// delete all notifications associated with the artefact
//prettier-ignore
const deleteAllArtefactNotif = async function(artefactId) {
  Notification.deleteMany({ refId: artefactId, category: "artefact" }, function(err) {
    if (err) {
      console.log("Error deleting all notifications for artefact: " + err);
    }
  });
};

// invitation notification triggers functions //
//prettier-ignore
const triggerInvitationNotif = function(groupId, userId, type) {
  // find the target group
  Group.findById(groupId, function(err, group) {
    if (err)
      return console.log("Error finding group for invitation notification");
    // find the user being invited and group admin
    Promise.all([
      findUserById(userId), 
      findUserById(group.adminId)
    ]).then(
      users => {
        let target = users[0];
        let admin = users[1];
        // early return
        if (!target || !admin) {
          console.log("Error finding users for invitation notification");
          return;
        }
        // prepare notification data
        let message;
        let userId;
        let userPushToken;
        let thumbnailURL;
        let otherUser;
        // assign notification data accordingly
        switch (type) {
          case "invite": 
            message = `${admin.name} invited you to join group: ${group.title}`;
            userId = target._id;
            userPushToken = target.userPushToken;
            thumbnailURL = admin.profilePic;
            otherUser = admin._id;
            break;
          case "accept":
            message =`${target.name} has accepted your invitation to join group: ${group.title}`;
            userId = admin._id;
            userPushToken = admin.userPushToken;
            thumbnailURL = target.profilePic;
            otherUser = target._id;
            break;
          default:
            break;
        }
        // prepare the new notification 
        var notification = new Notification({
          userId,
          userPushToken,
          datePosted: new Date(),
          thumbnailURL,
          seenStatus: false,
          category: "invitation",
          refId: group._id,
          data: {
            type,
            message,
            otherUser,
          }
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
      }
    );
  });
};

// delete all notifications associated with the invitation
//prettier-ignore
deleteInvitationNotif = function(groupId, userId) {
  Notification.deleteMany(
    { userId, refId: groupId, category: "invitation" }, function(err) {
      if (err) {
        console.log("Error deleting all notifications for artefact: " + err);
      }
    }
  );
};

// delete all notifications associated with the artefact
//prettier-ignore
const deleteAllGroupNotif = async function(groupId) {
  Notification.deleteMany({ refId: groupId }, function(err) {
    if (err) {
      console.log("Error deleting all notifications for groups: " + err);
    }
  });
};

module.exports = {
  triggerArtefactNotif,
  deleteAllGroupNotif,
  deleteArtefactLikeNotif,
  deleteAllArtefactNotif,
  triggerInvitationNotif,
  deleteInvitationNotif
};
