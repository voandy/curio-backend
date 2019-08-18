const mongoose = require('mongoose');

// load User model
const Collection = mongoose.model("Collection");

// get all collections
var getAll = function(req,res){
  Collection.find(function(err, collections) {
    if (!err) {
      res.send(collections);
    } else {
      res.sendStatus(404);
    }
  });
};

// get collection by id
var getById = function(req,res){
  var collectionId = req.params.id;
  Collection.findById(collectionId, function(err, collection){
    if (!err) {
      res.send(collection);
    } else {
      res.sendStatus(404);
    }
  });
};

// delete collection by id
var deleteById = function (req,res) {
  var collectionId = req.params.id;
  Collection.findByIdAndDelete(collectionId, function(err, collection) {
    if(!err) {
      res.send(collectionId + "is deleted");
    } else {
      res.sendStatus(404);
    }
  })
};

// update collection by id
var updateById = function(req,res){
  var collectionId = req.params.id;
  Collection.findByIdAndUpdate(collectionId, req.body, function(err, collection) {
    if(!err) {
      res.send(collection);
    } else {
      res.sendStatus(404);
    }
  });
};

// create collection
var create = function (req,res) {
  var adminId = req.params.adminId;
  // create the collection
  var collection = new Collection({
    adminId: adminId,

    title: req.body.title,
    description: req.body.description,

    dateCreated: new Date(),

    artefacts:[],
    comments:[]
  });

  // send it to database
  collection.save(function (err, newCollection) {
    if(!err){
      res.send(newCollection);
    }else{
      res.status(400).send(err);
    }
  });
}

// given an artefactId and collectionId adds the artefact to the collection
var addArtefact = function (req,res) {
  var collectionId = req.params.id;

  var newArtefact = {
    artefactId: req.params.artefactId,
    dateAdded: new Date()
  }

  Collection.findById(collectionId, function(err, collection){
    if (!err) {
      // push new artefact to collection artefacts array
      var artefacts = collection.artefacts;
      artefacts.push(newArtefact);
      collection.artefacts = artefacts;
      collection.save();
      res.send(collection);
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
  addArtefact
}
