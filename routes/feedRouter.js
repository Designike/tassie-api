const express = require('express');
const router =  express.Router();

const feedController = require('../controllers/feedController');
const auth = require('../middleware/auth');

router.post('/',auth,feedController.load);

module.exports = router;