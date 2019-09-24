const mongoose = require("mongoose");

// load Notification model
const Notification = mongoose.model("Notification");
// load User model
const User = mongoose.model("User");

// get all notifications
var getAll = function(req, res) {
  Notification.find(function(err, notifs) {
    if (!err) {
      res.send(notifs);
    } else {
      res.sendStatus(404);
    }
  });
};

// get notification by id
var getById = function(req, res) {
  var notifId = req.params.id;
  Notification.findById(notifId, function(err, notif) {
    if (!err && notif) {
      res.send(notif);
    } else {
      res.sendStatus(404);
    }
  });
};

// delete notification by id
var deleteById = function(req, res) {
  var notifId = req.params.id;
  Notification.findByIdAndDelete(notifId, function(err, notif) {
    if (!err) {
      res.send(notifId + "is deleted");
    } else {
      res.sendStatus(404);
    }
  });
};

// update notification by id
var updateById = function(req, res) {
  var notifId = req.params.id;
  Notification.findByIdAndUpdate(notifId, req.body, function(err, notif) {
    if (!err) {
      res.send(notifId + "is updated");
    } else {
      res.sendStatus(404);
    }
  });
};

// create a new notification
var create = function(req, res) {
  userId = req.params.userId;
  var notification = new Notification({
    userId: userId,
    datePosted: new Date(),
    content: req.body.content,

    thumbnailURL: req.body.thumbnailURL,
    seenStatus: false,

    category: req.body.category,
    refId: req.body.refId,

    protected: false
  });

  notification.save(function(err, newNotification) {
    if (!err) {
      res.send(newNotification);
    } else {
      res.status(400).send(err);
    }
  });
};

// set notification as seen
var setSeen = function(req, res) {
  var notifId = req.params.id;
  Notification.findById(notifId, function(err, notif) {
    if (!err && notif) {
      notif.seenStatus = true;
      res.send(notif);
    } else {
      res.sendStatus(404);
    }
  });
};

// given a userId, returns all notifications for that user
var getByUser = function(req, res) {
  var userId = req.params.userId;
  Notification.find({ userId: userId }, function(err, notifications) {
    if (!err) {
      res.send(notifications);
    } else {
      res.status(404);
    }
  });
};

// delete all unprotected notifications
//prettier-ignore
var deleteAll = function(req, res) {
  Notification.find({ protected: { $ne: true } }, function(err, unprotectedNotifications) {
    if (!err) {
      unprotectedNotifications.forEach(function(notification) {
        var notificationId = notification._id;
        Notification.findByIdAndDelete(notificationId, function(err) {
          if (!err) {
            console.log(notificationId + " deleted.");
          } else {
            res.sendStatus(404);
          }
        });
      });
      res.send("completed!");
    } else {
      res.status(500);
    }
  });
};

module.exports = {
  getAll,
  getById,
  deleteById,
  updateById,
  create,
  setSeen,
  getByUser,
  deleteAll
};
