const express = require("express");
const router = express.Router();

const artefactCont = require("../controllers/artefact-controller.js");

/* USER ROUTS */

// get all artefacts
router.get("/artefact", artefactCont.getAll);
// get artefact by id
router.get("/artefact/id/:id", artefactCont.getById);
// delete artefact by id
router.delete("/artefact/id/:id", artefactCont.deleteById);
// update artefact by id
router.put("/artefact/id/:id", artefactCont.updateById);
// create new artefact
router.post("/artefact", artefactCont.create);
// get artefacts by user id
router.get("/artefact/userId/:userId", artefactCont.getByUser);
// like an artefact
router.post("/artefact/id/:id/userId/:userId/like", artefactCont.like);
// unlike an artefact
router.post("/artefact/id/:id/userId/:userId/unlike", artefactCont.unlike);
// delete all unprotected artefacts
router.delete("/artefact/deleteAll", artefactCont.deleteAll);
// add an image to the artefact
router.post("/artefact/id/:id/image", artefactCont.addImage);
// remove and image from the artefact
router.delete("/artefact/id/:id/image", artefactCont.removeImage);
// post a comment on artefact
//prettier-ignore
router.post('/artefact/id/:id/userId/:userId/comment', artefactCont.postComment);
// get all comments on artefact
router.get("/artefact/id/:id/getAllComments", artefactCont.getAllComments);

module.exports = router;
