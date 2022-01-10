const express = require('express');
const router =  express.Router();

const userController = require('../controllers/userController');
const auth = require('../middleware/auth');



router.post('/login',userController.login);

router.post('/logout', auth, userController.logout);

router.post('/logoutAll', auth, userController.logoutAll);

router.get('/me', auth, userController.findAll);

router.get('/:id',userController.findOne);

router.patch('/:id',userController.update);

router.delete('/:id',userController.remove);

router.get('/mail/:uuid',userController.mail);

router.post('/tsa/:uuid',userController.twoStepVerification);

router.post('/', userController.register);


module.exports = router;