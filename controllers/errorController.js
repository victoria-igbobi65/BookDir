const AppError = require("../utils/appError")


// THIS FUNCTION HANDLES THE CASTERROR ERROR
//ERRORS

// 1
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}


//2

const handleDuplicateFieldsDb = (err) => {
    const value = err.keyValue.name
    const message = `Duplicate field value < ${value} >: Please use another value!`;
    return new AppError(message, 400)
};


const handleJWTError = (err) => new AppError('Invalid token please log in again!', 401)
const handleJWTExpiredError = (err) => new AppError('Your token has expired! Please log in again!', 401)

// ERROR HANDLER WHILE APP IS IN DEVELOPMENT
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })

}

// ERROR HANDLER WHILE APP IS IN PRODUCTION
const sendErrorProd = (err, res) => {

    // OPERATIONAL ERRORS THAT WE HAVE PREDEFINED IN THE CLASS

    if (err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    // ERRORS THAT ARE NOT PREDEFINED ARE HANDLED HERE
    else{
        //console.log(err)
        res.status(err.statusCode).json({
            status: err.status,
            message: 'Something went very wrong!'
        })
    }
    
}


// GLOBAL ERROR HANDLER 
// WHEN AN UNHANDLED ERROR OCCURS THIS IS THE ROUTE THAT IS HIT
module.exports = (err, req, res, next) => {
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';


    // dETERMINES IF WE ARE IN PRODUCTION OR DEVELOPMENT
    if (process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res)
    }
    else if (process.env.NODE_ENV === 'production'){

        // DEEP COPY THE err ARGUMENT
        let error = JSON.parse(JSON.stringify(err))
        console.log(error)

        //DETERMINES THE TYPE OF ERROR AND ATTACHES THE APPROPRIATE ERROR FUNCTION
        if (error.name === 'CastError')  error = handleCastErrorDB(error)
        if (error.code === 11000) error = handleDuplicateFieldsDb(error)
        if (error.name === 'JsonWebTokenError') error = handleJWTError(error)
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error)

        // CALLS THE ERRORPROD FUNCTION 
        sendErrorProd(error, res);
        
        
    }
}