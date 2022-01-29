const express = require('express');
const router =  express.Router();

const userController = require('../controllers/userController');
const auth = require('../middleware/auth');



router.post('/login',userController.login);

router.get('/logout', auth, userController.logout);

router.post('/logoutAll', auth, userController.logoutAll);

router.get('/me', auth, userController.findAll);

router.get('/:id',userController.findOne);

router.patch('/:id',userController.update);

router.delete('/:id',userController.remove);

router.get('/mail/:uuid',userController.sendmail);

router.post('/tsa/:uuid',userController.twoStepVerification);

router.patch('/pass',userController.updatePassword);

router.post('/email',userController.updateEmail);

router.patch('/verifyEmail',userController.verifyEmail);

router.get('/username/:user',userController.checkUser);

router.get('/checkEmail/:user',userController.checkEmail);

router.post('/', userController.register);


module.exports = router;