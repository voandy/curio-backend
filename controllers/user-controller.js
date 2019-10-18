const mongoose = require("mongoose");

// load User model
const User = mongoose.model("User");
// load Group model
const Group = mongoose.model("Group");
// load comment model
const Comment = mongoose.model("Comment");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secretOrKey = process.env.secretOrKey;

// load input validation
const validateRegisterInput = require("../services/validation/register");
const validateLoginInput = require("../services/validation/login");

// get all users
var getAll = function(req, res) {
  User.find(function(err, users) {
    if (!err) {
      res.send(users);
    } else {
      res.sendStatus(404);
    }
  });
};

// get user by id
var getById = function(req, res) {
  var userId = req.params.id;
  User.findById(userId, function(err, user) {
    if (!err && user) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  });
};

// delete user by id
var deleteById = function(req, res) {
  var userId = req.params.id;
  User.findByIdAndDelete(userId, function(err, user) {
    if (!err) {
      res.send(userId + "is deleted");
    } else {
      res.sendStatus(404);
    }
  });
};

// update user by id
var updateById = function(req, res) {
  var userId = req.params.id;
  User.findByIdAndUpdate(userId, req.body, function(err, user) {
    if (!err) {
      res.send(userId + "is updated");
    } else {
      res.sendStatus(404);
    }
  });
};

// get user by email
var getByEmail = function(req, res) {
  var userEmail = req.params.email;
  User.find({ email: userEmail }, function(err, user) {
    if (!err) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  });
};

// get user by username
var getByUsername = function(req, res) {
  var username = req.params.username;
  User.find({ username: username }, function(err, user) {
    if (!err) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  });
};

// @route POST api/user/register
// @desc Register user
// @access Public
var register = function(req, res) {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    }
  });

  User.findOne({ username: req.body.username }).then(user => {
    if (user) {
      return res.status(400).json({ username: "Username is taken." });
    }
  });

  const newUser = new User({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,

    dateJoined: new Date(),
    groups: [],

    protected: false
  });

  if (req.body.profilePic) {
    newUser.profilePic = req.body.profilePic;
  }

  // Hash password before saving in database
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser
        .save()
        .then(user => res.json(user))
        .catch(err => console.log(err));
    });
  });
};

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
var login = function(req, res) {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const idOrEmail = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ $or: [{ email: idOrEmail }, { username: idOrEmail }] }).then(
    user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: "Email not found" });
      }

      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name
          };
          // Sign token
          jwt.sign(
            payload,
            secretOrKey,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
    }
  );
};

// delete all unprotected users
var deleteAll = function(req, res) {
  User.find({ protected: { $ne: true } }, function(err, unprotectedUsers) {
    if (!err) {
      unprotectedUsers.forEach(function(user) {
        var userId = user._id;
        User.findByIdAndDelete(userId, function(err) {
          if (!err) {
            console.log(userId + " deleted.");
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

var getAllGroups = function(req, res) {
  var userId = req.params.id;

  function addAdmin(groupDetail) {
    return new Promise((resolve, reject) => {
      userId = groupDetail.details.adminId;
      User.findById(userId, function(err, user) {
        if (!err) {
          groupDetail.admin = {
            profilePic: user.profilePic,
            name: user.name
          };
          resolve(groupDetail);
        } else {
          reject(err);
        }
      });
    });
  }

  async function addAllAdmins(groupDetails) {
    const promises = groupDetails.map(addAdmin);
    await Promise.all(promises);
  }

  User.findById(userId)
    .lean()
    .exec(function(err, user) {
      if (!err) {
        var groupDetails = user.groups;
        var groupIds = groupDetails.map(x => x.groupId);

        Group.find({ _id: { $in: groupIds } })
          .lean()
          .exec(function(err, groups) {
            if (!err) {
              // ensures groupDetails are retured in the same order as 
              // they were in the user.groups array
              groupDetails.forEach(function(groupDetail) {
                groups.forEach(function(group) {
                  if (groupDetail.groupId == group._id) {
                    groupDetail.details = group;
                  }
                });
              });
              // attach admin name and profilepic
              addAllAdmins(groupDetails)
                .then(() => {
                  res.send(groupDetails);
                })
                .catch(() => {
                  res.status(500);
                });
            } else {
              res.status(404).send("No groups found.");
            }
          });
      } else {
        res.status(404).send("User not found.");
      }
    });
};

// post a comment about a user
var postComment = function(req, res) {
  var posterId = req.params.posterId;
  var postedOnId = req.params.postedOnId;

  var comment = new Comment({
    posterId: posterId,
    postedOnId: postedOnId,
    datePosted: new Date(),
    content: req.body.content,
    protected: false
  });

  // send it to database
  comment.save(function(err, newComment) {
    if (!err) {
      res.send(newComment);
    } else {
      res.status(400).send(err);
    }
  });
};

// get all comments about this user
var getAllComments = function(req, res) {
  var userId = req.params.id;

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

  Comment.find({ postedOnId: userId }, function(err, comments) {
    if (!err) {
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

// get a user by email/username
var getByUniqueId = function(req, res) {
  const idOrEmail = req.body.idOrEmail;

  User.findOne(
    { $or: [{ email: idOrEmail }, { username: idOrEmail }] },
    function(err, user) {
      if (!err && user) {
        res.send(user);
      } else {
        res.status(404).send("User not found.");
      }
    }
  );
};

var userSearch = function(req, res) {
  var searchTerms = req.body.searchTerms;

  User.find({ $text: { $search: searchTerms } }, function(err, results) {
    if (!err && results) {
      res.send(results);
    } else {
      res.status(404).send("No users found.");
    }
  });
};

// set pinned value to true for target group in user's groups
var pinGroup = function(req, res) {
  var userId = req.params.id;
  var groupId = req.params.groupId;
  // use helper to update user's group
  var err = pinOrUnpinGroupHelper(userId, groupId, true);
  // response
  !err ? res.send("okay.") : res.status(404).send(err);
};

// set pinned value to false for target group in user's groups
var unpinGroup = function(req, res) {
  var userId = req.params.id;
  var groupId = req.params.groupId;
  // use helper to update user's group
  var err = pinOrUnpinGroupHelper(userId, groupId, false);
  // response
  !err ? res.send("okay.") : res.status(404).send(err);
};

// helper function to help update user's group value
var pinOrUnpinGroupHelper = function(userId, groupId, toPin) {
  // find user by id
  User.findById(userId, function(err, user) {
    if (!err) {
      // extract user's groups
      var userGroups = user.groups;
      // modify the target group's pinned value
      for (group of userGroups) {
        if (group.groupId == groupId) {
          group.pinned = toPin;
          break;
        }
      }
      // update user's group
      // prettier-ignore
      User.updateOne({ _id: userId }, { groups: userGroups }, function(err, user) {
        return (!err) ? false : "User update error.";
      });
    } else {
      return "No users found.";
    }
  });
};

module.exports = {
  getAll,
  getById,
  getByUsername,
  deleteById,
  updateById,
  getByEmail,
  register,
  login,
  deleteAll,
  getAllGroups,
  postComment,
  getAllComments,
  getByUniqueId,
  userSearch,
  pinGroup,
  unpinGroup
};
