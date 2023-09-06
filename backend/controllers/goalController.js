 const asyncHandler = require('express-async-handler')
 const Goal = require('../models/goalModel')
 const User = require('../models/userModel')
 
 // @desc Get goals
 // @route GET /api/goals
 // @access private

 const getGoals = asyncHandler(async (req, res) => {
   const goals = await Goal.find({user: req.user.id})
    res.status(200).json(goals)
 })

 // @desc Set goals
 // @route POST /api/goals
 // @access private
 
 const setGoals = asyncHandler(async (req, res) => {
    if(!req.body.text){
        res.status(400)
        throw new Error('Please add a text field')
    }
    const goal = await Goal.create({
      text: req.body.text,
      user: req.user.id
    })
    res.status(200).json({message: `Created goal: ${goal.text} for user ${req.user.name}`})
 })

 // @desc Update goals
 // @route PUT /api/goals/:id
 // @access private
 
 const updateGoal = asyncHandler(async (req, res) => {
   const goal = await Goal.findById(req.params.id) 
   if (!goal){
      res.status(400)
      throw new Error('Goal not found')
   }

   const user = await User.findById(req.user.id)
   //check for user
   if(!user){
      res.status(401)
      throw new Error('User not found')
   }

   //make sure the logged in user matches the correct user
   if(goal.user.toString() !== user.id){
   res.status(401)
   throw new Error('User not authorized')
   }

   const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true, })
    res.status(200).json({message: `Updated goal ${req.params.id} with text: ${req.body.text}`})
 })

 // @desc Delete goals
 // @route DELETE /api/goals/:id
 // @access private
 
 const deleteGoal = asyncHandler(async (req, res) => {
   const goal = await Goal.findById(req.params.id) 
   if (!goal){
      res.status(400)
      throw new Error('Goal not found')
   }
   const user = await User.findById(req.user.id)
   //check for user
   if(!user){
      res.status(401)
      throw new Error('User not found')
   }

   //make sure the logged in user matches the correct user
   if(goal.user.toString() !== user.id){
   res.status(401)
   throw new Error('User not authorized')
   }

   await Goal.findByIdAndDelete(req.params.id)
    res.status(200).json({message: `Deleted goal ${req.params.id}`})
 })

 module.exports = {
    getGoals,
    setGoals,
    updateGoal,
    deleteGoal
 }