const mongoose = require('mongoose')
const dotenv = require('dotenv');
const app = require('./app');

//HANDLING UNCAUGHT EXCEPTIONS
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! ...Shutting down....');
    console.log(err.name, err.message);
    process.exit(1);
});


dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)


// connecting to the db
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('DB connection Successful!')
)


const PORT = process.env.PORT ||5000;
const server = app.listen(PORT, () => {
    console.log('Server is on!');
});


//HANDLING UNHANDLED REJECTIONS
process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection! ...Shutting down....')
    server.close(() => {
        process.exit(1);
    }); 
})


