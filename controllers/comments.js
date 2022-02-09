const commentsRouter = require('express').Router()
const Comment = require('../models/comment')
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')
const User = require('../models/user')

commentsRouter.get('/', async (request, response) => {
    const comments = await Comment.find({}).populate('user', { username: 1, name: 1, id: 1 }).populate('blog', { title: 1, id: 1})
    response.json(comments)
})
  
commentsRouter.post('/', middleware.userExtractor, async (request, response) => {
    const body = request.body
    const user = request.user
    if(user) {
        const comment = new Comment({
            comment: body.comment,
            pubdate: new Date(),
            user: user._id,
            blog: body.blogID
        })
    
        const savedComment = await comment.save()
        user.comments = user.comments.concat(savedComment._id)
        await user.save()

        const blog = await Blog.findById(savedComment.blog)
        blog.comments = blog.comments.concat(savedComment._id)
        await blog.save()

        const populatedSavedComment = await Comment.findById(savedComment._id).populate('user', { username: 1, name: 1, id: 1 }).populate('blog', { title: 1, id: 1})
        response.status(201).json(populatedSavedComment)
    } else {
        return response.status(403).json({ error: 'You are not authorized to create a comment' })
    }
})

commentsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const comment = await Comment.findById(request.params.id)
    const user = await User.findById(comment.user)

    if (comment.user.toString() === user._id.toString()) {
        user.comments = user.comments.filter(comment => JSON.stringify(comment) !== JSON.stringify(request.params.id))
        await user.save()
        const blog = await Blog.findById(comment.blog)
        blog.comments = blog.comments.filter(comment => JSON.stringify(comment) !== JSON.stringify(request.params.id))
        await blog.save()
        await Comment.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } else {
        return response.status(403).json({ error: 'You are not authorized to delete this comment' })
    }
})

module.exports = commentsRouter