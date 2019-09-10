const mongoose = require('mongoose');

// load Group model
const Group = mongoose.model("Group");

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
    if (!err) {
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
    comments:[]
  });

  if (req.body.coverPhoto) {
    group.coverPhoto = req.body.coverPhoto;
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

  var newArtefact = {
    artefactId: req.params.artefactId,
    dateAdded: new Date()
  }

  Group.findById(groupId, function(err, group){
    if (!err) {
      // push new artefact to group artefacts array
      var artefacts = group.artefacts;
      artefacts.push(newArtefact);
      group.artefacts = artefacts;
      group.save();
      res.send(group);
    } else {
      res.sendStatus(404);
    }
  });
}


// given a userId adds that user as a member of the group
var addMember = function (req,res) {
  var groupId = req.params.id;

  var newMember = {
    memberId: req.params.userId,
    dateAdded: new Date()
  }

  Group.findById(groupId, function(err, group){
    if (!err) {
      // push new artefact to group artefacts array
      var members = group.members;
      members.push(newMember);
      group.members = members;
      group.save();
      res.send(group);
    } else {
      res.sendStatus(404);
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
  addMember
}
