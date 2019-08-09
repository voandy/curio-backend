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

module.exports = router;
