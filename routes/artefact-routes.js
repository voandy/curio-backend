const express = require('express');
const router = express.Router();

const artefactCont = require('../controllers/artefact-controller.js');

/* USER ROUTS */

// get all users
router.get('/artefact', artefactCont.getAll);
// get user by id
router.get('/artefact/id/:id', artefactCont.getById);
// delete user by id
router.delete('/artefact/id/:id', artefactCont.deleteById);
// update user by id
router.put('/artefact/id/:id', artefactCont.updateById);
// create new artefact
router.post('/artefact', artefactCont.create);
// get artefacts by user id
router.get('/artefact/userId/:userId', artefactCont.getByUser);
// like an artefact
router.post('/artefact/id/:id/userId/:userId', artefactCont.like);
// unlike an artefact
router.post('/artefact/id/:id/userId/:userId', artefactCont.unlike);
// delete all unprotected artefacts
router.delete('/artefact/deleteAll', artefactCont.deleteAll);

module.exports = router;
