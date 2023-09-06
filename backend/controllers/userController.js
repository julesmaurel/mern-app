const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')


// @desc Register new user
// @route POST api/users
// @access Public
const registerUser = asyncHandler(async(req, res) => {
    const { name, email, password } = req.body

    if ( !name || !email || !password){
        res.status(400)
        throw new Error('Please add all fields')
    }

    //Check if user exists
    const userExists = await User.findOne({email})
    if(userExists){
        res.status(400)
        throw new Error('User already exists')
    }

    //Hash password with bcrypt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //Create user
    const user = await User.create({
      name,
      email,
      password : hashedPassword
    })
    
    if(user){
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
        }
})

// @desc Authenticate user
// @route POST api/login
// @access Public

const loginUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body
    if(!email || !password){
        res.status(400)
        throw new Error('Please send email and password')
    }

    const user = await User.findOne({email})
    if(user && (await bcrypt.compare(password, user.password))){
        res.status(200)
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Incorrect credentials')
    }
})

// @desc Get user data
// @route GET api/user/me
// @access Private

const getMe = asyncHandler(async(req, res) => {
res.json({userName: req.user.name, userId: req.user.id, userEmail: req.user.email})
})

//Generate JWT

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: '30d'})
}

module.exports = {
    registerUser,
    loginUser,
    getMe
}