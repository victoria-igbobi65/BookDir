const mongoose = require('mongoose');
const slugify = require('slugify')

// creating a schema
const bookSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Book must have a name!'],
            unique: true,
            trim: true,
            maxlength: [100, 'Book names must not have more than 100 characters'],
            minlength: [1, 'Book names must have at least 1 character']
        },
        isbn:{
            type: Number,
            required: [true, 'ISBN required!'],
            unique: true,
            minlength: [13, 'ISBN length must not be above 13']
        },
        authors:{
            type: String,
            require: [true, 'A book must have an author!']
        },
        desc:{
            type: String
        },
        price: {
            type: Number,
            required: [true, 'A book must have price!']
        },
        genre: {
            type: [String],
        },
        pagesNumber:{
            type: Number,
        },
        Nationality: {
            type: String,
        }, 
        rating: {
            type: Number
        },
        slug: String,
        imageCover:{
            type: String,
            required: [true, 'Image cover for book is required!']
        },
        image: {
            type: [String]
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            // we use this line from preventing a field from showing up
            select: false
        },
        secretBook: {
            type: Boolean,
            default: false
        }
    },
    
);

//Implementing a document middleware
//works only before .save() and .create()
bookSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true})
    next();
}); 


// query middleware
// 
bookSchema.pre(/^find/, function(next){
    this.find({secretBook: { $ne: true}})
    next()
})

// a db model
const Book = mongoose.model('Book', bookSchema);

     
                                                                                                                                 
module.exports=Book 