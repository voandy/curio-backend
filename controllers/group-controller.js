const mongoose = require('mongoose');

// load Group model
const Group = mongoose.model("Group");
// load User model
const User = mongoose.model("User");
// load Artefact model
const Artefact = mongoose.model("Artefact");
// load comment model
const Comment = mongoose.model("Comment");

// get all groups
var getAll = function(req,res){
  Group.find(function(err, groups) {
    if (!err) {
      res.send(groups);
    } else {
      res.sendStatus(404);
    }
  });
};

// get group by id
var getById = function(req,res){
  var groupId = req.params.id;
  Group.findById(groupId, function(err, group){
    if (!err && group) {
      res.send(group);
    } else {
      res.sendStatus(404);
    }
  });
};

// delete the all references to this group from it's members
function removeFromMembers(groupId) {
  return new Promise(resolve => {

    Group.findById(groupId, function(err, group){
      if (!err && group) {
        memberDetails = group.members;
        var memberIds = memberDetails.map(x => x.memberId);
        
        User.find({_id:{$in:memberIds}}, function (err, members) {
          if (!err) {
            members.forEach(function(member){
              groups = member.groups;

              for(var i = 0; i < groups.length; i++){ 
                if (groups[i].groupId == groupId) {
                  groups.splice(i, 1);
                  member.save();
                  break;
                }
              }

            });
            resolve();
          } else {
            // reject("No members found.");
            resolve();
          }
        });
      } else {
        reject("Group not found.");
      }
    });
  });
}

// delete group by id
var deleteById = function (req,res) {
  var groupId = req.params.id;

  // delete references to the group in users then delete the group
  removeFromMembers(groupId).then(function () {
    Group.findByIdAndDelete(groupId, function(err) {
      if(!err) {
        res.send(groupId + " deleted.");
      } else {
        res.status(500).send(err);
      }
    });
  }, function(error){
    res.send(error);
  });
};

// update group by id
var updateById = function(req,res){
  var groupId = req.params.id;
  Group.findByIdAndUpdate(groupId, req.body, function(err, group) {
    if(!err) {
      res.send(group);
    } else {
      res.sendStatus(404);
    }
  });
};

// create group
var create = function (req,res) {
  // create the group
  var group = new Group({
    adminId: req.body.adminId,

    title: req.body.title,
    description: req.body.description,

    dateCreated: new Date(),

    artefacts:[],
    members:[],

    likes: [],

    protected: false
  });

  if (req.body.coverPhoto) {
    group.coverPhoto = req.body.coverPhoto;
  }

  // privacy setting for artefact, default = public
  if (req.body.privacy) {
    group.privacy = req.body.privacy;
  } else {
    group.privacy = 0;
  }

  // send it to database
  group.save(function (err, newGroup) {
    if(!err){
      res.send(newGroup);
    }else{
      res.status(400).send(err);
    }
  });
}

// given an artefactId and groupId adds the artefact to the group
var addArtefact = function (req,res) {
  var groupId = req.params.id;
  var artefactId = req.params.artefactId;

  var newArtefact = {
    artefactId: artefactId,
    dateAdded: new Date()
  }

  Group.findById(groupId, function(err, group){
    if (!err && group) {
      // push new artefact to group.artefacts array
      var artefacts = group.artefacts;

      var index = artefacts.findIndex(x => x.artefactId == artefactId);

      if (index < 0) {
        artefacts.push(newArtefact);
        group.artefacts = artefacts;
        group.save();
        res.send(group);
      } else {
        res.status(500).send("Artefact is already listed in this group.")
      }
    } else {
      res.sendStatus(404);
    }
  });
}

// given an artefactId and groupId removes the artefact from the group
var removeArtefact = function (req,res) {
  var groupId = req.params.id;
  var artefactId = req.params.artefactId;

  Group.findById(groupId, function(err, group){
    if (!err && group) {
      var artefacts = group.artefacts;
      var index = artefacts.findIndex(x => x.artefactId == artefactId);

      if (index >= 0) {
        artefacts.splice(index, 1);
        group.artefacts = artefacts;
        group.save();
        res.send(group);
      } else {
        res.status(404).send("Artefact not found in group.artefacts array.")
      }

    } else {
      res.status(404).send("Group not found.")
    }
  });
}


// given a userId adds that user as a member of the group
var addMember = function (req,res) {
  var groupId = req.params.id;
  var memberId = req.params.userId;

  var status = "";
  var updatedGroup;

  function addToGroup() {
    return new Promise(resolve => {
      var newMember = {
        memberId: memberId,
        dateAdded: new Date()
      }
    
      Group.findById(groupId, function(err, group){
        if (!err && group) {
          // add new member to group.members array
          var members = group.members;
          members.push(newMember);
          group.members = members;
          group.save();
          updatedGroup = group;
          resolve();
        } else {
          status = "Group not found.";
          resolve();
        }
      });
    });
  }

  function addToUser() {
    return new Promise(resolve => {
      var newGroup = {
        groupId: groupId,
        dateJoined: new Date(),
        pinned: false
      }

      User.findById(memberId, function(err, member){
        if (!err && member) {
          // add groupId to member's groups
          var groups = member.groups;
          groups.push(newGroup);
          member.groups = groups;
          member.save();
          resolve();
        } else {
          status = "User not found.";
          resolve();
        }
      });
    });
  }

  async function addToBoth() {
    await Promise.all([addToGroup(), addToUser()]);
  
    if (status) {
      res.status(404).send(status);
    } else {
      res.send(updatedGroup);
    }
  }

  // check if user is already a member of the group before adding.
  Group.findById(groupId, function(err, group){
    if (!err && group) {
      var members = group.members;
      var index = members.findIndex(x => x.memberId == memberId);

      if (index < 0) {
        addToBoth();
      } else {
        res.status(500).send("User aleady a member of this group.");
      }
    } else {
      status = "Group not found.";
      resolve();
    }
  });
  
}

// given a userId removes that user from the group
var removeMember = function (req,res) {
  var groupId = req.params.id;
  var memberId = req.params.userId;

  var status = "";
  var updatedGroup;

  function removeFromGroup() {
    return new Promise(resolve => {
      Group.findById(groupId, function(err, group){
        if (!err && group) {
          // remove member from group.members
          var members = group.members;
          var index = members.findIndex(x => x.memberId == memberId);
    
          if (index >= 0) {
            members.splice(index, 1);
            group.members = members;
            group.save();
            updatedGroup = group;
            resolve();
          } else {
            status = "Member not found in group.members array.";
            resolve();
          } 
    
        } else {
          status = "Group not found.";
          resolve();
        }
      });
    });
  }

  function removeFromUser() {
    return new Promise(resolve => {
      User.findById(memberId, function(err, member){
        if (!err && member) {
          // add groupId to member's groups
          var groups = member.groups;
          var index = groups.findIndex(x => x.groupId == groupId);
          
          if (index >= 0) {
            groups.splice(index, 1);
            member.groups = groups;
            member.save();
            resolve();
          } else {
            status = "Group not found in user.groups array.";
            resolve();
          }
    
        } else {
          status = "User not found.";
          resolve();
        }
      });
    });
  }

  async function removeFromBoth() {
    await Promise.all([removeFromGroup(), removeFromUser()]);
  
    if (status) {
      res.status(404).send(status);
    } else {
      res.send(updatedGroup);
    }
  }

  removeFromBoth();
}

// give a groupId returns an object containing all the artefacts in that group
var getAllArtefacts = function (req,res) {
  var groupId = req.params.id;
  Group.findById(groupId).lean().exec(function(err, group){
    if (!err && group) {
      artefactDetails = group.artefacts;
      var artefactIds = artefactDetails.map(x => x.artefactId);
      
      Artefact.find({_id:{$in:artefactIds}}, function (err, artefacts) {
        if (!err) {
          artefactDetails.forEach(function(artefactDetail) {
            artefacts.forEach(function(artefact) {
              if(artefactDetail.artefactId == artefact._id) {
                artefactDetail.details = artefact;
              }
            });
          });
          res.send(artefactDetails);
        } else {
          res.status(404).send("No artefacts found.");
        }
      });

    } else {
      res.status(404).send("Group not found.")
    }
  });
}

// get all the members in a group
var getAllMembers = function (req,res) {
  var groupId = req.params.id;
  Group.findById(groupId).lean().exec(function(err, group){
    if (!err && group) {
      memberDetails = group.members;
      var memberIds = memberDetails.map(x => x.memberId);
      
      User.find({_id:{$in:memberIds}}, function (err, members) {
        if (!err) {
          memberDetails.forEach(function(memberDetail) {
            members.forEach(function(member) {
              if (memberDetail.memberId == member._id) {
                memberDetail.details = member;
              }
            });
          });
          res.send(memberDetails);
        } else {
          res.status(404).send("No members found.");
        }
      });

    } else {
      res.status(404).send("Group not found.")
    }
  });
}

// delete all unprotected groups
var deleteAll = function(req, res) {
  var removeFromAllMembers = async (unprotectedGroups) => {
    for (var group of unprotectedGroups) {
     await removeFromMembers(group._id);
    }
  }
  
  Group.find({ protected: { $ne: true } }, function(err, unprotectedGroups){
    if(!err) {
      removeFromAllMembers(unprotectedGroups).then(function () {
        unprotectedGroups.forEach(function(group) {
          groupId = group._id;

          Group.findByIdAndDelete(groupId, function(err) {
            if(err) {
              res.status(500).send("Unable to delete all groups.");
            }
          });
        });
        res.send("Completed!");
      }, function (error) {
        res.send(error);
      });
    } else {
      res.status(500);
    }
  });
}

var postComment = function(req,res) {
  var groupId = req.params.id;
  var userId = req.params.userId;

  var comment = new Comment({
    posterId: userId,
    postedOnId: groupId,
    datePosted: new Date(),
    content: req.body.content,
    protected: false
  });

  // send it to database
  comment.save(function (err, newComment) {
    if(!err){
      res.send(newComment);
    }else{
      res.status(400).send(err);
    }
  });
}

var getAllComments = function(req,res) {
  var groupId = req.params.id;

  function addPictures(comment) {
    return new Promise((resolve, reject) => {
      userId = comment.posterId;
      User.findById(userId, function(err, user) {
        if (!err) {
          comment.posterPic = user.profilePic;
          resolve(comment);
        } else {
          reject(err);
        }
      });
    });
  }

  async function addAllPictures(comments){
    const promises = comments.map(addPictures);
    await Promise.all(promises);
  }

  Comment.find({postedOnId:groupId}, function(err, comments){
    if(!err) {
      addAllPictures(comments).then(function(){
        res.send(comments);
      });
    } else{
      res.status(404);
    }
  });
}

// like the group
var like = function(req,res) {
  var groupId = req.params.id;
  var userId = req.params.userId;
  Group.findById(groupId, function(err, group){
    if (!err) {
      likes = group.likes;
      var index = likes.indexOf(userId);

      if (index < 0) {
        likes.push(userId);
        group.likes = likes;
        group.save();
        res.send(group);
      } else {
        res.status(400).send("User already liked this group");
      }
    } else {
      res.status(404).send("Group not found.");
    }
  });
}

// unlike the group
var unlike = function(req,res) {
  var groupId = req.params.id;
  var userId = req.params.userId;
  Group.findById(groupId, function(err, group){
    if (!err) {
      likes = group.likes;

      var index = likes.indexOf(userId);
      if (index >= 0) {
        likes.splice(index, 1);
      } else {
        res.status(404).send("User not found.");
      }

      group.likes = likes;
      group.save();
      res.send(group);
    } else {
      res.status(404).send("Group not found.");
    }
  });
}

// returns all users who like this artefact
var getLikedUsers = function(req,res) {
  var groupId = req.params.id;
  Group.findById(groupId, function(err, group){
    if (!err) {
      likes = group.likes;
      
      User.find({_id:{$in:likes}}, function (err, users) {
        if (!err) {
          res.send(users);
        } else {
          res.status(404).send("No users found.");
        }
      });

    } else {
      res.status(404).send("Artefact not found.")
    }
  });
}

module.exports = {
  getAll,
  getById,
  deleteById,
  updateById,
  create,
  addArtefact,
  removeArtefact,
  addMember,
  removeMember,
  getAllArtefacts,
  getAllMembers,
  deleteAll,
  postComment,
  getAllComments,
  like,
  unlike,
  getLikedUsers
}
