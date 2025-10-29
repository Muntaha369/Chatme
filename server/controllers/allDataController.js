const User = require('../models/model')

const GetUsers = async (req,res)=>{
  const users = await User.find({})
  const result = users.map((val)=>{
  return val.username
  })
  res.status(201).json({msg:result})
}

module.exports = {GetUsers}