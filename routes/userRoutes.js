const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/usercontroller');
const authController = require('../controllers/authController')


userRouter.post('/signup', authController.signup)
userRouter.post('/login', authController.login)

userRouter.post('/forgotPassword', authController.forgotPassword)
userRouter.patch('/resetPassword/:token', authController.resetPassword)
userRouter.route('/changePassword').patch(authController.protect, authController.updatePassword);



userRouter.route('/')
    .get(userController.getAllUser)
    .post(userController.createUser)

userRouter.route('/:id')
    .get(userController.getUserById)

userRouter.route('/auth')
    .post(userController.Auth)
module.exports = userRouter