const express = require('express')
const bodyParser = require('body-parser')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')


const bookRoutes = require('./routes/bookRoutes')
const userRoutes = require('./routes/userRoutes')


const app = express()

app.use(bodyParser.json())
app.use('/api/v1/books/', bookRoutes)
app.use('/api/v1/users/', userRoutes)


// HANDLING UNHANDLED ROUTES
app.use('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})
app.use(globalErrorHandler)


module.exports = app