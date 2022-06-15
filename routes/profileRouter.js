const express = require('express');
const router =  express.Router();


const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const lazy = require('../middleware/lazy');

router.get('/lazyProfile/:page',[auth,lazy.lazyprofile],profileController.loadProfile);
router.get('/lazysubscribers/:userUuid/:page',[auth,lazy.lazysubscribers],profileController.loadProfile);
router.get('/lazysubscribers/:userUuid/:page',[auth,lazy.lazysubscribeds],profileController.loadProfile);
router.get('/lazyProfilePost/:uuid/:page',[auth,lazy.lazyprofilepost],profileController.loadProfile);
router.get('/lazyProfileRecs/:uuid/:page',[auth,lazy.lazyprofilerecs],profileController.loadProfile);
router.get('/lazyBookmark/:page',[auth,lazy.lazybookmark],profileController.loadBookmark);
router.get('/getPost/:uuid',auth,profileController.getPost);
router.post('/currentProfile',auth,profileController.currentProfile);
router.post('/updateProfile',auth,profileController.updateProfile);
router.post('/updateUsername',auth,profileController.updateUsername);
router.get('/getProfile/:uuid',auth,profileController.getProfile);
router.post('/subscribe',auth,profileController.subscribe);
router.post('/unsubscribe',auth,profileController.unsubscribe);
router.post('/postStats',auth,profileController.postStats);



module.exports = router;