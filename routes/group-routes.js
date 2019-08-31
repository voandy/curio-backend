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
router.post('/group/adminId/:adminId', groupCont.create);
// add artefact to group
router.put('/group/id/:id/artefactId/:artefactId', groupCont.addArtefact);

module.exports = router;
