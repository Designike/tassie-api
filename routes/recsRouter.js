const express = require('express');
const router =  express.Router();


const recsController = require('../controllers/recsController');
const auth = require('../middleware/auth');
const lazy = require('../middleware/lazy');

// // router.post('/',auth,feedController.load);
router.get('/lazyrecs/:page', [auth, lazy.lazyrec], recsController.loadRecs);
// router.get('/lazycomment/:uuid/:userUuid/:page',lazy.lazycomment,feedController.loadcomment);
// router.post('/post', auth, feedController.createPost);

module.exports = router;