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
router.post('/editpost', auth, feedController.editPost);
router.get('/deletePost/:uuid', auth, feedController.deletePost);
router.post('/addComment',auth,feedController.addComment);
router.post('/removeComment',auth,feedController.removeComment);
router.post('/bookmark', auth, feedController.addBookmark);
router.post('/removeBookmark',auth,feedController.removeBookmark);
// router.post('/addHashtag',auth,feedController.addHashtag);
router.post('/getHashtag',auth,feedController.getHashtag);

module.exports = router;