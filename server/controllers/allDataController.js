const User = require('../models/model')

const GetUsers = async (req,res)=>{
  const users = await User.find({})
  res.status(201).json({msg:users})
}

module.exports = {GetUsers}