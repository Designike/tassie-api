const express = require('express');
const router =  express.Router();


const driveController = require('../controllers/driveController');
const auth = require('../middleware/auth');
// const lazy = require('../middleware/lazy');
// const upload = require('../middleware/upload.js');
// const temp2 = require('../temp2.js');

// // router.post('/',auth,feedController.load);
// router.post('/upload', [auth, upload], driveController.drivePostUpload);
router.post('/file',  driveController.getFileStream);
// router.get('/lazycomment/:uuid/:userUuid/:page',lazy.lazycomment,feedController.loadcomment);
// router.post('/post', auth, feedController.createPost);

module.exports = router;