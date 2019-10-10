const express = require("express");
const router = express.Router();

const userCont = require("../controllers/user-controller.js");

/* USER ROUTS */

// get all users
router.get("/user", userCont.getAll);
// get user by id
router.get("/user/id/:id", userCont.getById);
// delete user by id
router.delete("/user/id/:id", userCont.deleteById);
// update user by id
router.put("/user/id/:id", userCont.updateById);
// get user by email
router.get("/user/email/:email", userCont.getByEmail);
// get user by username
router.get("/user/username/:username", userCont.getByUsername);
// register new user
router.post("/register", userCont.register);
// login/authenticate a user
router.post("/login", userCont.login);
// delete all unprotected users
router.delete("/user/deleteAll", userCont.deleteAll);
// get all the groups this user in a member of
router.get("/user/id/:id/groups", userCont.getAllGroups);
// get user by email or username
router.get("/user/idOrEmail/:idOrEmail", userCont.getByUniqueId);
// post a comment about the user
//prettier-ignore
router.post("/user/posterId/:posterId/postedOnId/:postedOnId", userCont.postComment);
// get all comments about this user
router.get("/user/id/:id/comments", userCont.getAllComments);
// search for users by search terms
router.put("/user/search", userCont.userSearch);
// user pins a group
router.post("/user/id/:id/pin/groupId/:groupId", userCont.pinGroup);
// user unpins a group
router.post("/user/id/:id/unpin/groupId/:groupId", userCont.unpinGroup);

module.exports = router;
