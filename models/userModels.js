const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a username']
        //maxlength: [100, 'username must not be more than 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!']
    },
    photo:{
        type: String
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        minlength: [8, 'password must not be less than 8 characters!'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        validate: {
            // FUNCTION USED TO ENFORCE CONFIRMPASSWORD
            // THIS ONLY WORKD ON CREATE AND SAVE
            validator: function(el){
                return el === this.password
            }, 
            message: 'password are not the same!'
        }
    },
    passwordChangedAt: Date
});



userSchema.pre('save', async function(next){

    // run thiis function if password wasmodified
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined

    next()
})


userSchema.methods.changePasswordAfter = (JWTTimestamp) => {
    if (this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < changedTimestamp
    }

    return false

}


// AN INSTANCE THAT COMPARES PASSWORD
userSchema.methods.correctPassword = async(candidatePassword, userPassword
) =>{
    return await bcrypt.compare(candidatePassword, userPassword)
} 
// USER MODEL
const User = mongoose.model('User', userSchema)


module.exports = User;