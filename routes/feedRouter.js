const express = require('express');
const router =  express.Router();


const feedController = require('../controllers/feedController');
const auth = require('../middleware/auth');
const lazy = require('../middleware/lazy');
const upload = require('../middleware/upload');

// router.post('/',auth,feedController.load);
router.get('/lazyfeed/:page', [auth, lazy.lazyfeed], feedController.trialLoad);
router.get('/lazycomment/:uuid/:userUuid/:page',lazy.lazycomment,feedController.loadcomment);
router.post('/like', auth, feedController.addLike);
router.post('/unlike',auth,feedController.removeLike);
router.post('/newpost', [auth, upload], feedController.createPost);

module.exports = router;