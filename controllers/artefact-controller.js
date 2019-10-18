const mongoose = require("mongoose");

// load Artefact model
const Artefact = mongoose.model("Artefact");
// load comment model
const Comment = mongoose.model("Comment");
// load User model
const User = mongoose.model("User");
// load Group model
const Group = mongoose.model("Group");
// notification triggers
const triggers = require("../services/notification/triggers");

// get all artefacts
var getAll = function(req, res) {
  Artefact.find(function(err, artefacts) {
    if (!err) {
      res.send(artefacts);
    } else {
      res.sendStatus(404);
    }
  });
};

// get artefact by id
var getById = function(req, res) {
  var artefactId = req.params.id;
  Artefact.findById(artefactId)
    .lean()
    .exec(function(err, artefact) {
      if (!err && artefact) {
        res.send(artefact);
      } else {
        res.sendStatus(404);
      }
    });
};

// delete artefact by id
var deleteById = function(req, res) {
  var artefactId = req.params.id;
  // try to find the group that's associated with the artefact
  //prettier-ignore
  Group.findOne({ artefacts: { $elemMatch: { artefactId }}}, function(err, group) {
    if (!err) {
      // such group exist, therefore remove the association
      if (group) {
        group.artefacts = group.artefacts.filter(
          x => x.artefactId !== artefactId
        );
        group.save();
      }
    } else {
      res.sendStatus(404);
    }
  });
  // find and delete artefact by id
  Artefact.findByIdAndDelete(artefactId, function(err, artefact) {
    if (!err) {
      // delete all associated notifications
      triggers.deleteAllArtefactNotif(artefactId);
      // response
      res.send(artefactId + " is deleted");
    } else {
      res.sendStatus(404);
    }
  });
};

// update artefact by id
var updateById = function(req, res) {
  var artefactId = req.params.id;
  Artefact.findByIdAndUpdate(artefactId, req.body, function(err, artefact) {
    if (!err) {
      res.send(artefact);
    } else {
      res.sendStatus(404);
    }
  });
};

// create artefact
var create = function(req, res) {
  // create the artefact
  var artefact = new Artefact({
    userId: req.body.userId,

    title: req.body.title,
    description: req.body.description,
    category: req.body.category,

    datePosted: new Date(),
    dateObtained: new Date(req.body.dateObtained),

    currLoc: req.body.currLoc,
    currLng: req.body.currLng,
    currLat: req.body.currLat,

    // obtained location
    obtLoc: req.body.obtLoc,
    obtLng: req.body.obtLng,
    obtLat: req.body.obtLat,

    likes: [],

    protected: false
  });

  // add and image if one is specified
  if (req.body.imageURL) {
    var newImage = {
      URL: req.body.imageURL,
      dateAdded: new Date()
    };
    artefact.images = [newImage];
  } else {
    artefact.images = [];
  }

  // privacy setting for artefact, default = public
  if (req.body.privacy) {
    artefact.privacy = req.body.privacy;
  } else {
    artefact.privacy = 0;
  }

  // send it to database
  artefact.save(function(err, newArtefact) {
    if (!err) {
      res.send(newArtefact);
    } else {
      res.status(400).send(err);
    }
  });
};

// given a userId returns all artefacts posted by that user
var getByUser = function(req, res) {
  var userId = req.params.userId;
  Artefact.find({ userId: userId }, function(err, artefacts) {
    if (!err) {
      res.send(artefacts);
    } else {
      res.status(404);
    }
  });
};

// record and increment the like of the artefact by 1
var like = function(req, res) {
  var artefactId = req.params.id;
  var userId = req.params.userId;
  Artefact.findById(artefactId, function(err, artefact) {
    if (!err && artefact) {
      likes = artefact.likes;
      var index = likes.indexOf(userId);
      // if user isn't in the likes array
      if (index < 0) {
        likes = artefact.likes;
        likes.push(userId);
        artefact.likes = likes;
        artefact.save();
        res.send(artefact);
        // trigger notification
        triggers.triggerArtefactNotif(artefactId, userId, "like");
      } else {
        // other user has already liked the artefact
        res.status(400).send("User already liked this artefact");
      }
    } else {
      res.status(404).send("Artefact not found.");
    }
  });
};

// record and decrement the like of the artefact by 1
var unlike = function(req, res) {
  var artefactId = req.params.id;
  var userId = req.params.userId;
  Artefact.findById(artefactId, function(err, artefact) {
    if (!err && artefact) {
      likes = artefact.likes;
      var index = likes.indexOf(userId);
      // if user is in likes array
      if (index >= 0) {
        likes.splice(index, 1);
        artefact.likes = likes;
        artefact.save();
        res.send(artefact);
        // delete previous artefact-liked notification
        triggers.deleteArtefactLikeNotif(artefactId, userId);
      } else {
        // user hasn't liked the artefact before
        res.status(404).send("User has not liked this artefact.");
      }
    } else {
      res.status(404).send("Artefact not found.");
    }
  });
};

// returns all users who like this artefact
var getLikedUsers = function(req, res) {
  var artefactId = req.params.id;
  Artefact.findById(artefactId, function(err, artefact) {
    if (!err) {
      likes = artefact.likes;

      User.find({ _id: { $in: likes } }, function(err, users) {
        if (!err) {
          res.send(users);
        } else {
          res.status(404).send("No users found.");
        }
      });
    } else {
      res.status(404).send("Artefact not found.");
    }
  });
};

// delete all unprotected artefacts
var deleteAll = function(req, res) {
  Artefact.find({ protected: { $ne: true } }, function(
    err,
    unprotectedArtefacts
  ) {
    if (!err) {
      unprotectedArtefacts.forEach(function(artefact) {
        var artefactId = artefact._id;
        Artefact.findByIdAndDelete(artefactId, function(err) {
          if (!err) {
            console.log(artefactId + " deleted.");
          } else {
            res.sendStatus(500);
          }
        });
      });
      res.send("completed!");
    } else {
      res.status(500);
    }
  });
};

// add an image to an artefact
var addImage = function(req, res) {
  var artefactId = req.params.id;

  var newImage = {
    URL: req.body.imageURL,
    dateAdded: new Date()
  };

  Artefact.findById(artefactId, function(err, artefact) {
    if (!err && artefact) {
      images = artefact.images;
      images.push(newImage);
      artefact.images = images;
      artefact.save();
      res.send(artefact);
    } else {
      res.sendStatus(404);
    }
  });
};

// remove an image to an artefact
var removeImage = function(req, res) {
  var artefactId = req.params.id;
  var imageIndex = req.body.imageIndex;

  Artefact.findById(artefactId, function(err, artefact) {
    if (!err && artefact) {
      images = artefact.images;
      images.splice(imageIndex, 1);
      artefact.images = images;
      artefact.save();
      res.send(artefact);
    } else {
      res.sendStatus(404);
    }
  });
};

// add new comment posted to database
var postComment = function(req, res) {
  var artefactId = req.params.id;
  var userId = req.params.userId;

  var comment = new Comment({
    posterId: userId,
    postedOnId: artefactId,
    datePosted: new Date(),
    content: req.body.content,
    protected: false
  });
  // send it to database
  comment.save(function(err, newComment) {
    if (!err) {
      res.send(newComment);
      // trigger notification
      triggers.triggerArtefactNotif(artefactId, userId, "comment");
    } else {
      res.status(400).send(err);
    }
  });
};

var getAllComments = function(req, res) {
  var artefactId = req.params.id;

  function addPoster(comment) {
    return new Promise((resolve, reject) => {
      userId = comment.posterId;
      User.findById(userId, function(err, user) {
        if (!err) {
          comment.posterPic = user.profilePic;
          comment.posterName = user.name;
          resolve(comment);
        } else {
          reject(err);
        }
      });
    });
  }

  async function addAllPosters(comments) {
    const promises = comments.map(addPoster);
    await Promise.all(promises);
  }

  Comment.find({ postedOnId: artefactId })
    .lean()
    .exec(function(err, comments) {
      if (!err && comments) {
        addAllPosters(comments)
          .then(function() {
            res.send(comments);
          })
          .catch(function() {
            res.status(500);
          });
      } else {
        res.status(404);
      }
    });
};

module.exports = {
  getAll,
  getById,
  deleteById,
  updateById,
  create,
  getByUser,
  like,
  unlike,
  getLikedUsers,
  deleteAll,
  addImage,
  removeImage,
  postComment,
  getAllComments
};
