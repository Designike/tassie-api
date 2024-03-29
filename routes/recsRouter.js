const express = require('express');
const router =  express.Router();


const recsController = require('../controllers/recsController');
const auth = require('../middleware/auth');
const lazy = require('../middleware/lazy');
const upload = require('../middleware/upload');

// // router.post('/',auth,feedController.load);
router.get('/getIng', auth, recsController.getIng);
router.get('/lazyrecs/:page', [auth, lazy.lazyrec], recsController.loadRecs);
router.get('/createRecipe', auth, recsController.createRecipe);
router.post('/deleteRecipe', auth, recsController.deleteRecipe);
router.post('/updateRecipe', [auth, upload], recsController.updateRecipe);
router.post('/resetImage', auth, recsController.resetImage);
router.post('/renameImages', auth, recsController.renameImages);
router.post('/bookmark', auth, recsController.addBookmark);
router.post('/removeBookmark',auth,recsController.removeBookmark);
router.post('/addHashtag',auth,recsController.addHashtag);
router.post('/getHashtag',auth,recsController.getHashtag);
router.post('/getRecipe',auth,recsController.getRecipe);
router.get('/lazyreccomment/:uuid/:userUuid/:page',lazy.lazyreccomment,recsController.loadcomment);
router.get('/lazyrating/:uuid/:userUuid/:page',lazy.lazyrating,recsController.loadrating);
router.post('/addComment',auth,recsController.addComment);
router.post('/removeComment',auth,recsController.removeComment);
router.post('/like',auth, recsController.addLike);
router.post('/unlike',auth,recsController.removeLike);
router.post('/addRating',auth, recsController.addRating);
router.post('/resetRating',auth,recsController.resetRating);

// router.get('/lazycomment/:uuid/:userUuid/:page',lazy.lazycomment,feedController.loadcomment);
// router.post('/post', auth, feedController.createPost);

module.exports = router;