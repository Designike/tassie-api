const express = require('express');
const router =  express.Router();


const feedController = require('../controllers/feedController');
const auth = require('../middleware/auth');
const lazy = require('../middleware/lazy');

// router.post('/',auth,feedController.load);
router.get('/lazyfeed/:page', [auth, lazy.lazyfeed], feedController.trialLoad);
router.post('/post', auth, feedController.createPost);

module.exports = router;