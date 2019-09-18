const mongoose = require('mongoose');

// load Group model
const Group = mongoose.model("Group");
// load User model
const User = mongoose.model("User");
// load Artefact model
const Artefact = mongoose.model("Artefact");

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

// delete group by id
var deleteById = function (req,res) {
  var groupId = req.params.id;
  Group.findByIdAndDelete(groupId, function(err, group) {
    if(!err) {
      res.send(groupId + "is deleted");
    } else {
      res.sendStatus(404);
    }
  })
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
  var adminId = req.params.adminId;
  // create the group
  var group = new Group({
    adminId: adminId,

    title: req.body.title,
    description: req.body.description,

    dateCreated: new Date(),

    artefacts:[],
    members:[],

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

  function getArtefact(groupArtefact){
    var id = mongoose.Types.ObjectId(groupArtefact.artefactId);
    return new Promise(resolve => {
      Artefact.find(id, function (err, artefact) {
        if (!err) {
          groupArtefact.artefact = artefact;
          resolve();
        } else {
          resolve("Artefact not found.");
        }
      });
    });
  }

  async function getAll(groupArtefacts){
    const promises = groupArtefacts.map(getArtefact);
    await Promise.all(promises);
  }

  Group.findById(groupId).lean().exec(function(err, group) {
    if (!err && group) {
      var groupArtefacts = group.artefacts;
      getAll(groupArtefacts).then(function() {
        res.send(groupArtefacts);
      });
    } else {
      res.status(404).send("Group not found.")
    }
  });
}

var getAllMembers = function (req,res) {
  var groupId = req.params.id;

  function getMember(groupMember){
    var id = mongoose.Types.ObjectId(groupMember.memberId);
    return new Promise(resolve => {
      User.find(id, function (err, member) {
        if (!err) {
          groupMember.member = member;
          resolve();
        } else {
          resolve("Member not found.");
        }
      });
    });
  }

  async function getAll(groupMembers){
    const promises = groupMembers.map(getMember);
    await Promise.all(promises);
  }

  Group.findById(groupId).lean().exec(function(err, group){
    if (!err && group) {
      var groupMembers = group.members;
      getAll(groupMembers).then(function() {
        res.send(groupMembers);
      });
    } else {
      res.status(404).send("Group not found.")
    }
  });
}

// delete all unprotected groups
var deleteAll = function(req, res) {
  Group.find({ protected: { $ne: true } }, function(err, unprotectedGroups){
    if(!err) {
      unprotectedGroups.forEach(function(group){
        var groupId = group._id;
        Group.findByIdAndDelete(groupId, function(err) {
          if(!err) {
            console.log(groupId + " deleted.")
          } else{
            res.sendStatus(404);
          }
        })
      });
      res.send("completed!")
    } else{
      res.status(500);
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
  deleteAll
}
