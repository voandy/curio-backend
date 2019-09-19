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
    if (!err && comment) {
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

// delete all unprotected comments
var deleteAll = function(req,res) {
  Comment.find({ protected: { $ne: true } }, function(err, unprotectedComments){
    if(!err) {
      unprotectedComments.forEach(function(comment){
        var commentId = comment._id;
        Comment.findByIdAndDelete(commentId, function(err) {
          if(!err) {
            console.log(commentId + " deleted.")
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
  deleteAll
}
