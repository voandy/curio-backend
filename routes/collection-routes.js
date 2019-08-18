const express = require('express');
const router = express.Router();

const collectionCont = require('../controllers/collection-controller.js');

/* USER ROUTS */

// get all collections
router.get('/collection', collectionCont.getAll);
// get collection by id
router.get('/collection/id/:id', collectionCont.getById);
// delete collection by id
router.delete('/collection/id/:id', collectionCont.deleteById);
// update collection by id
router.put('/collection/id/:id', collectionCont.updateById);
// create new collection
router.post('/collection/adminId/:adminId', collectionCont.create);
// add artefact to collection
router.put('/collection/id/:id/artefactId/:artefactId', collectionCont.addArtefact);

module.exports = router;
