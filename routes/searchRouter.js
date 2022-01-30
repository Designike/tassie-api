const express = require('express');
const router =  express.Router();


const searchController = require('../controllers/searchController');
const auth = require('../middleware/auth');
const lazy = require('../middleware/lazy');

// // router.post('/',auth,feedController.load);
router.post('/guess',auth,searchController.guess);
router.get('/lazyGuess/:page/:id', [auth, lazy.lazyguess], searchController.showResults);
// router.get('/lazycomment/:uuid/:userUuid/:page',lazy.lazycomment,feedController.loadcomment);
// router.post('/post', auth, feedController.createPost);

module.exports = router;