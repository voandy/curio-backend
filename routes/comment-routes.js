const express = require('express');
const router = express.Router();

const commentCont = require('../controllers/comment-controller.js');

/* COMMENT ROUTS */

// get all comments
router.get('/comment', commentCont.getAll);
// get comment by id
router.get('/comment/id/:id', commentCont.getById);
// delete comment by id
router.delete('/comment/id/:id', commentCont.deleteById);
// update comment by id
router.put('/comment/id/:id', commentCont.updateById);
// create new comment
router.post("/comment", commentCont.create);

module.exports = router;
