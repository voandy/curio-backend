const mongoose = require('mongoose');

// load User model
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
  Artefact.findByIdAndRemove(artefactId, function(err, artefact) {
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

module.exports = {
  getAll,
  getById,
  deleteById,
  updateById
}
