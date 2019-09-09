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

module.exports = router;
