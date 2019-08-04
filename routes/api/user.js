const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

// load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// load User model
const User = require("../../models/User");

// get all users
router.get('/', function(req,res){
    User.find(function(err, users) {
      if (!err) {
        res.send(users);
      }
      else {
        res.sendStatus(404);
      }
    });
});

// get user by id
router.get('/id/:id', function(req,res) {
    var userId = req.params.id;
    User.findById(userId, function(err, user){
      if (!err) {
        res.send(user);
      }
      else {
        res.sendStatus(404);
      }
    });
});

// delete user by id
router.delete('/id/:id', function(req,res) {
    var userId = req.params.id;
    User.deletedById(userId, function(err, user) {
      if(!err) {
        res.send(userId + "is deleted");
      }
      else{
        res.sendStatus(404);
      }
    })
});

// update user by id
router.put('/id/:id', function(req, res) {
    var userId = req.params.id;
    User.findByIdAndUpdate(userId, req.body, function(err, user) {
      if(!err) {
        res.send(userId + "is updated");
      }
      else {
        res.sendStatus(404);
      }
    });
});

// get user by email
router.get('/email/:email', function(req, res) {
    var userEmail = req.params.email;
    User.find({email: userEmail}, function(err, user) {
      if(!err) {
        res.send(user);
      }
      else {
        res.sendStatus(404);
      }
    });
});

// @route POST api/user/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
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
    else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
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
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {

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
          keys.secretOrKey,
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
});

module.exports = router;