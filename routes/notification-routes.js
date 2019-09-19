const express = require('express');
const router = express.Router();

const notifCont = require('../controllers/notification-controller.js');

/* NOTIFICATION ROUTS */

// get all notifications
router.get('/notification', artefactCont.getAll);
// get notification by id
router.get('/notification/id/:id', artefactCont.getById);
// delete notification by id
router.delete('/notification/id/:id', artefactCont.deleteById);
// update notification by id
router.put('/notification/id/:id', artefactCont.updateById);
// create new notification
router.post('/notification/userId/:userId', artefactCont.create);
// set a notification as seen
router.put('/notification/id/:id/seen', artefactCont.setSeen);



module.exports = router;
