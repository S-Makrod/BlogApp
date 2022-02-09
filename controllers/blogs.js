const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 }).populate('comments', {comment: 1, user: 1, id: 1, pubdate: 1}).populate({path: 'comments', populate: { path: 'user', select: 'id'}}).populate({path: 'comments', populate: { path: 'user', select: 'name'}})
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1, id: 1 }).populate('comments', {comment: 1, user: 1, id: 1, pubdate: 1}).populate({path: 'comments', populate: { path: 'user', select: 'id'}}).populate({path: 'comments', populate: { path: 'user', select: 'name'}})
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    const updatedBlog = {
        title: blog.title,
        author: blog.author,
        url: blog.url,
        likes: blog.likes + 1,
        user: blog.user
    }

    const newBlog = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true, runValidators: true })
    response.json(newBlog)
})
  
blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
    const body = request.body
    const user = request.user
    if(user) {
        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user._id
        })
    
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        const populatedSavedBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1, id: 1 }).populate('comments', {comment: 1, user: 1, id: 1, pubdate: 1})
        response.status(201).json(populatedSavedBlog)
    } else {
        return response.status(403).json({ error: 'You are not authorized to create a blog' })
    }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    
    if (blog.user.toString() === request.user._id.toString()) {
        for(i = blog.comments.length - 1; i >= 0; i--) {
            const comment = await Comment.findById(blog.comments[i])
            const commentUser = await User.findById(comment.user)
            commentUser.comments = commentUser.comments.filter(c => JSON.stringify(c) !== JSON.stringify(comment.id))
            await commentUser.save()
            await Comment.findByIdAndRemove(comment.id)
        }
        const user = await User.findById(blog.user)
        user.blogs = user.blogs.filter(b => JSON.stringify(b) !== JSON.stringify(request.params.id))
        await user.save()
        await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } else {
        return response.status(403).json({ error: 'You are not authorized to delete this blog' })
    }
})

module.exports = blogsRouter