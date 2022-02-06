const express = require('express');
const router =  express.Router();


const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const lazy = require('../middleware/lazy');

router.get('/lazyProfile/:page',[auth,lazy.lazyprofile],profileController.loadProfile);
router.get('/lazyBookmark/:page',[auth,lazy.lazybookmark],profileController.loadBookmark);

module.exports = router;