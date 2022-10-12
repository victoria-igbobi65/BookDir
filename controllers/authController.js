const {promisify} = require('util')
const User = require('../models/userModels')
const jwt = require('jsonwebtoken')

const AppError = require('../utils/appError')
const sendEmail = require('../utils/email');

const catchAsync = require('../utils/catchAsync')


const signToken = id => {
return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
})
}

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create(req.body)
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfirm: req.body.passwordConfirm
    
    const token = signToken(newUser._id)
    //LOG A USER IN IMMEDIATELY HE IS SIGNED UP

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })

})


exports.login = catchAsync(async(req, res, next) => {
    const {email, password} = req.body

    //CHECK IF USER PASSED EMAIL AND PASSWORD
    if(!email || !password){
        return next(new AppError('please provide email and password!', 400))
    }
    const user = await User.findOne({email}).select('+password')

    //COMPARING PASSWORD USING THE CORRECTPASSWORD INSTANCE ON THE USER OBJECT IN THE USER MODEL
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password!', 401));
    }
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})



exports.protect = catchAsync(async(req, res, next) => {
    //Get token and check if its there
    let token
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1]
    }
    if (!token){
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
            )
    }

    //verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)


    //check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser){
        return next(
            new AppError('The user belonging that has this token no longer exist!')
            )

    }

    //check if user changed password after JWT was issued
    if (currentUser.changePasswordAfter(decoded.iat)){
        return next(
            new AppError('User recently changed password! please log in again!', 401)
        )
    }
    req.user = currentUser
    next()
}) 


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)){
            next(new AppError('You do not have permission to perform this action!', 403))
        }

        next()
    }
}


exports.forgotPassword = catchAsync(async(req, res, next) => {
    // GET USER BASED ON POSTED EMAIL

    const user = await User.findOne({email: req.body.email})

    if (!user){
        return next(new AppError('There is no user with that email address!', 404))
    }

    // GENERATE RESET TOKEN
    const resetToken = user.createResetPasswordToken()

    // Turns off all the required field before saving the document
    await user.save({validateBeforeSave: false})


    // SEND RESET TOKEN TO USER THROUGH MAIL
    const resetURl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`


    const message = `Forgot password? Submit a PATCH request with your new password and passwordConfirm to:
    ${resetURl}.\nIf you didn't forget your password, please ignore this email!.`


    try{

        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });

        
    }
    catch(err){

        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email, Try again later!', 500))

    }
    })


exports.resetPassword = async(req, res, next) =>{

}