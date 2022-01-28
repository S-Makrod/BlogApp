var _ = require('lodash')

const totalLikes = (blogs) => {
    return blogs.length === 0? 0 : blogs.map(blog => blog.likes).reduce((prev, curr) => prev + curr)
}

const favouriteBlog = (blogs) => {
    return blogs.length === 0? {} : blogs.reduce((prev, curr) => prev.likes > curr.likes? prev : curr)
}

const mostBlogs = (blogs) => {
    return blogs.length < 2? blogs.length === 0? '' : blogs[0].author : Object.entries(_.groupBy(blogs, blog => blog.author)).reduce((prev, curr) => prev[1].length > curr[1].length? prev[0] : curr[0])
}

const mostLikes = (blogs) => {
    return blogs.length === 0? '' : favouriteBlog(Object.entries(_.groupBy(blogs, blog => blog.author)).map(entry => {return {author: entry[0], likes: totalLikes(entry[1])}})).author
}

module.exports = {
    totalLikes, favouriteBlog, mostBlogs, mostLikes
}