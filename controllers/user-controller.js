const mongoose = require('mongoose');

// load User model
const User = mongoose.model("User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secretOrKey = process.env.secretOrKey;

// load input validation
const validateRegisterInput = require("../services/validation/register");
const validateLoginInput = require("../services/validation/login");

// get all users
var getAll = function(req,res){
  User.find(function(err, users) {
    if (!err) {
      res.send(users);
    } else {
      res.sendStatus(404);
    }
  });
};

// get user by id
var getById = function(req,res){
  var userId = req.params.id;
  User.findById(userId, function(err, user){
    if (!err) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  });
};

// delete user by id
var deleteById = function (req,res) {
  var userId = req.params.id;
  User.findByIdAndDelete(userId, function(err, user) {
    if(!err) {
      res.send(userId + "is deleted");
    } else{
      res.sendStatus(404);
    }
  })
};

// update user by id
var updateById = function(req,res){
  var userId = req.params.id;
  User.findByIdAndUpdate(userId, req.body, function(err, user) {
    if(!err) {
      res.send(userId + "is updated");
    } else {
      res.sendStatus(404);
    }
  });
};

// get user by email
var getByEmail = function(req,res){
  var userEmail = req.params.email;
  User.find({email: userEmail}, function(err, user) {
    if(!err) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  });
};

// @route POST api/user/register
// @desc Register user
// @access Public
var register = function(req,res){
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,

        dateJoined: new Date(),
        comments: [],
        subCollections: []
      });

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
    }
  });
};

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
var login = function(req,res){

  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {

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
  });
};

module.exports = {
  getAll,
  getById,
  deleteById,
  updateById,
  getByEmail,
  register,
  login
}
