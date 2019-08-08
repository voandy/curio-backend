const express = require('express');
const router = express.Router();

const userCont = require('../controllers/user-controller.js');

/* USER ROUTS */

// get all users
router.get('/user', userCont.getAll);
// get user by id
router.get('/user/id/:id', userCont.getById);
// delete user by id
router.delete('/user/id/:id', userCont.deleteById);
// update user by id
router.put('/user/id/:id', userCont.updateById);
// get user by email
router.get('/user/email/:email', userCont.getByEmail);
// register new user
router.post("/register", userCont.register);
// login/authenticate a user
router.post("/login", userCont.login);

module.exports = router;