const express = require('express');
const router =  express.Router();


const searchController = require('../controllers/searchController');
const auth = require('../middleware/auth');
const lazy = require('../middleware/lazy');

// // router.post('/',auth,feedController.load);
router.post('/guess',auth,searchController.guess);
router.get('/lazyGuess/:page/:id', [auth, lazy.lazyguess], searchController.showResults);
router.get('/lazyExplore/:page/:previousLength',[auth,lazy.lazyexplore],searchController.explore);
router.get('/lazySearch/:page/:word',[auth,lazy.lazyall],searchController.searchAll);
// router.get('/searchRecipe/:word',searchController.searchRecipe);
// router.get('/searchUser/:word',searchController.searchUser);
// router.get('/searchTag/:word',searchController.searchTag);
// router.post('/post', auth, feedController.createPost);

module.exports = router;