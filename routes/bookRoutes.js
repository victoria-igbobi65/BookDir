const express = require('express')
const bookRouter = express.Router()
const bookController = require('../controllers/bookcontoller')
const authController = require('../controllers/authController')
//const userController = require('../controllers/usercontroller')
bookRouter.route('/top-3-cheap')
    .get(bookController.alias, bookController.getAllBooks)


bookRouter.route('/')
    .get(authController.protect, bookController.getAllBooks) // ["admin", user]
    .post(bookController.createBook) // ["admin"]


bookRouter.route('/:id')
    .delete(authController.protect, authController.restrictTo('admin'),bookController.deleteBook) //[admin]
    .get(bookController.getBookById) //['reader', admin]
    .put(bookController.updateBook)


bookRouter.route('/loan/:id')
    .post(bookController.loanBook) // ["reader"]


bookRouter.route('/return/:id') 
    .post(bookController.returnBook) // ["reader"]

module.exports = bookRouter