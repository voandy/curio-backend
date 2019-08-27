const mongoose = require('mongoose');

// load comment model
const Comment = mongoose.model("Comment");

// get all comments
var getAll = function(req,res){
  Comment.find(function(err, comments) {
    if (!err) {
      res.send(comments);
    } else {
      res.sendStatus(404);
    }
  });
};

// get comment by id
var getById = function(req,res){
  var commentId = req.params.id;
  Comment.findById(commentId, function(err, comment){
    if (!err) {
      res.send(comment);
    } else {
      res.sendStatus(404);
    }
  });
};

// delete comment by id
var deleteById = function (req,res) {
  var commentId = req.params.id;
  Comment.findByIdAndDelete(commentId, function(err, comment) {
    if(!err) {
      res.send(commentId + "is deleted");
    } else{
      res.sendStatus(404);
    }
  })
};

// update comment by id
var updateById = function(req,res){
  var commentId = req.params.id;
  Comment.findByIdAndUpdate(commentId, req.body, function(err, comment) {
    if(!err) {
      res.send(commentId + "is updated");
    } else {
      res.sendStatus(404);
    }
  });
};

// create comment
var create = function (req,res) {
  // create the artefact
  var comment = new Artefact({
    posterId: req.body.posterId,
    datePosted: new Date(),
    content: req.body.content
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

module.exports = {
  getAll,
  getById,
  deleteById,
  updateById,
  create
}
