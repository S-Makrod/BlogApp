const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
        minlength: 1
    },
    pubdate: {
        type: Date,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }
})

commentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Comment', commentSchema)