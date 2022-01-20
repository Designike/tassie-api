const express = require('express');
const router =  express.Router();


const recsController = require('../controllers/recsController');
const auth = require('../middleware/auth');
const lazy = require('../middleware/lazy');
const upload = require('../middleware/upload');

// // router.post('/',auth,feedController.load);
router.get('/lazyrecs/:page', [auth, lazy.lazyrec], recsController.loadRecs);
router.get('/createRecipe', auth, recsController.createRecipe);
router.post('/deleteRecipe', auth, recsController.deleteRecipe);
router.post('/updateRecipe', [auth, upload], recsController.updateRecipe);

// router.get('/lazycomment/:uuid/:userUuid/:page',lazy.lazycomment,feedController.loadcomment);
// router.post('/post', auth, feedController.createPost);

module.exports = router;