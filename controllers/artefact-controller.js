const mongoose = require('mongoose');

// load Artefact model
const Artefact = mongoose.model("Artefact");

// get all artefacts
var getAll = function(req,res){
  Artefact.find(function(err, artefacts) {
    if (!err) {
      res.send(artefacts);
    } else {
      res.sendStatus(404);
    }
  });
};

// get artefact by id
var getById = function(req,res){
  var artefactId = req.params.id;
  Artefact.findById(artefactId, function(err, artefact){
    if (!err) {
      res.send(artefact);
    } else {
      res.sendStatus(404);
    }
  });
};

// delete artefact by id
var deleteById = function (req,res) {
  var artefactId = req.params.id;
  Artefact.findByIdAndDelete(artefactId, function(err, artefact) {
    if(!err) {
      res.send(artefactId + "is deleted");
    } else {
      res.sendStatus(404);
    }
  })
};

// update artefact by id
var updateById = function(req,res){
  var artefactId = req.params.id;
  Artefact.findByIdAndUpdate(artefactId, req.body, function(err, artefact) {
    if(!err) {
      res.send(artefact);
    } else {
      res.sendStatus(404);
    }
  });
};

// create artefact
var create = function (req,res) {
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

    imageURLs: [],
    likes: [],
    comments: []
  });

  // send it to database
  artefact.save(function (err, newArtefact) {
    if(!err){
      res.send(newArtefact);
    }else{
      res.status(400).send(err);
    }
  });
}

module.exports = {
  getAll,
  getById,
  deleteById,
  updateById,
  create
}
