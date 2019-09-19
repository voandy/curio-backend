const express = require('express');
const router = express.Router();

const notifCont = require('../controllers/notification-controller.js');

/* NOTIFICATION ROUTS */

// get all notifications
router.get('/notification', notifCont.getAll);
// get notification by id
router.get('/notification/id/:id', notifCont.getById);
// delete notification by id
router.delete('/notification/id/:id', notifCont.deleteById);
// update notification by id
router.put('/notification/id/:id', notifCont.updateById);
// create new notification
router.post('/notification/userId/:userId', notifCont.create);
// set a notification as seen
router.put('/notification/id/:id/seen', notifCont.setSeen);
// get all notifications about a user
router.get('/notification/userId/:userId', notifCont.getByUser);

module.exports = router;
