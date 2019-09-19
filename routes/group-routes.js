const express = require('express');
const router = express.Router();

const groupCont = require('../controllers/group-controller.js');

/* GROUP ROUTS */

// get all groups
router.get('/group', groupCont.getAll);
// get group by id
router.get('/group/id/:id', groupCont.getById);
// delete group by id
router.delete('/group/id/:id', groupCont.deleteById);
// update group by id
router.put('/group/id/:id', groupCont.updateById);
// create new group
router.post('/group', groupCont.create);
// add an artefact to a group
router.put('/group/id/:id/add/artefactId/:artefactId', groupCont.addArtefact);
// remove an artefact from a group
router.put('/group/id/:id/remove/artefactId/:artefactId', groupCont.removeArtefact);
// add a user to a group
router.put('/group/id/:id/add/userId/:userId', groupCont.addMember);
// remove a user from a group
router.put('/group/id/:id/remove/userId/:userId', groupCont.removeMember);
// get all the artefacts in a group
router.get('/group/id/:id/artefacts', groupCont.getAllArtefacts);
// get all the members of a group
router.get('/group/id/:id/members', groupCont.getAllMembers);
// delete all unprotected groups
router.delete('/group/deleteAll', groupCont.deleteAll);
// post a comment on group
router.post('/group/id/:id/userId/:userId/comment', groupCont.postComment);
// get all comments on group
router.get('/group/id/:id/getAllComments', groupCont.getAllComments);

module.exports = router;
