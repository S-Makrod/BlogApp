const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1, id: 1, likes: 1 })
    response.json(users)
})

usersRouter.get('/:id', async (request, response) => {
    const user = await User.findById(request.params.id).populate('blogs', { title: 1, author: 1, id: 1, likes: 1 })
    if (user) {
        response.json(user)
    } else {
        response.status(404).end()
    }
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    const existingUser = await User.findOne({ username })
    if (existingUser) {
        return response.status(400).json({
            error: 'Username must be unique'
        })
    } 
    if (password.length < 6) {
        return response.status(400).json({
            error: 'Password must be at least 6 characters'
        })
    } 

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

module.exports = usersRouter