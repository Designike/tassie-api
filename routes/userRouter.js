const express = require('express');
const router =  express.Router();

const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/login',userController.login);

router.post('/updateProfileImage', [auth, upload], userController.setProfilePicture);

router.get('/logout', auth, userController.logout);

router.post('/logoutAll', auth, userController.logoutAll);

router.post('/googleSignin', userController.googleSignIn);

router.post('/googleRegister', userController.googleRegister);

router.get('/me', auth, userController.findAll);

router.get('/:id',userController.findOne);

router.patch('/:id',userController.update);

router.delete('/:id',userController.remove);

router.get('/mail/:uuid',userController.sendmail);

router.post('/tsa/:uuid',userController.twoStepVerification);

router.post('/updatePassword',auth,userController.updatePassword);

router.post('/email',auth,userController.updateEmail);

router.post('/verifyEmail', auth, userController.verifyEmail);

router.get('/username/:user',userController.checkUser);

router.get('/checkEmail/:user',userController.checkEmail);

router.get('/getProfilePic',auth,userController.getProfilePicture);

router.post('/', userController.register);


module.exports = router;