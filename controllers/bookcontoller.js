const Book = require('../models/bookModels')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')



// A middleware that pre loads a req object with some specific paramaters that makes it possible for a user to get a different kind of result even if they didn't specify it 
// in their url
exports.alias = async(req, res, next) =>{
    req.query.limit = '3'
    req.query.sort = 'price'
    req.query.fields = 'name authors desc price'
    next()
} 

exports.getAllBooks = catchAsync(async (req, res, next) => {
    //FILTERING
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
        /\b(gte| lte| gt| lt)\b/g,
        (match) => `$${match}`
    );

    let query = Book.find(JSON.parse(queryStr));

    //SORTING DATABASE OBJECT
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //FIELD LIMITING
    //CHECKS IF THE FIELDS PARAMETER IS PASSED IN THE URL
    if (req.query.fields) {
        //SPILTS IT TO GET THE FIELDS THAT WAS PASSED JOINS THEM WITH A SPACE AND APPLIES IT TO THE QUERY THAT WAS FETCHED
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    } else {
        // EXCLUDE THE _V FIELD
        query.select('-__v');
    }

    // PAGINATION
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // EXECUTE RESULT
    //const features = new APIFeatures(Book.find(), req.query).filter()
    //console.log(features)
    const books = await query;
    res.status(200).json({
        status: 'success',
        results: books.length,
        data: {
            books,
        },
    });
});



exports.updateBook = catchAsync(async (req, res, next) => {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!book) {
        return next(new AppError('No tour found with ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            book,
        },
    });
});


exports.createBook = catchAsync(async (req, res, next) => {
    const newBook = await Book.create(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            book: newBook,
        },
    });
});



exports.deleteBook = catchAsync(async (req, res, next) => {
    const book = await Book.deleteOne({id: req.params.id});

    if (!book) {
        return next(new AppError('No book found with ID', 404));
    }

    // successful delete route header is usually set to 204 with a null data
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getBookById = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if (!book){
        return next(new AppError('No tour found with ID', 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
            book,
        },
    });
});

exports.loanBook = async(req, res) => {
    // const user = req.body.email;

    // const book = +req.params.id;
    // const bookToLoan = await queryController.findBook(books, book);
    // const loanBook = await queryController.findBook(loanedBooks, book);

    // // Handles the loaning function
    // if (Boolean(bookToLoan && !loanBook)) {
    //     const bookDueDate = queryController.dueDate();
    //     const loanedBook = { user: user, id: book, due: bookDueDate };
    //     loanedBooks.push(loanedBook);
    //     queryController.writeTofile(loanedBooksPath, loanedBooks);
    //     res.status(200).json({
    //         status: 'success',
    //         book: loanedBook,
    //     });
    // } else {
    //     res.status(400).json({
    //         status: 'fail',
    //         message: `Book with id ${book} isn't available at the moment!`,
    //     });
    // }
}


exports.returnBook = async(req, res) =>{
    // const book = +req.params.id;
    // const bookExists = await queryController.findBook(books, book);
    // const bookLoanedOut = await queryController.findBook(loanedBooks, book);
    // let user
    
    // if (bookLoanedOut){
    //      user = bookLoanedOut.user
    // }

    // if ((Boolean(bookExists && bookLoanedOut)) && (req.body.email === user)) {
    //     const filteredLoanedBook = await queryController.fillter(loanedBooks, book);
    //     queryController.writeTofile(loanedBooksPath, filteredLoanedBook);
    //     res.status(200).json({
    //         status: 'success',
    //         message: `Thanks for returning book with id ${book}!`,
    //     });
    // } else {
    //     if (bookExists && !bookLoanedOut) {
    //         res.status(400).json({
    //             status: 'fail',
    //             message: "couldn't process request!",
    //         });
    //     } else {
    //         res.status(404).json({
    //             status: 'fail',
    //             message: `Book with id ${book} doesn't exist!`,
    //         });
    //     }
    // }
} 

