const User = require('../models/model')

const GetUsers = async (req,res)=>{
  const users = await User.find({})
  const result = users.map((val)=>{
  return val.username
  })
  res.status(201).json({msg:result})
}

const UpdateContacts = async(req,res)=>{
try {
    const { clientName, contacts } = req.body;
    const updatedContacts = await User.findOneAndUpdate(
      { email: clientName },  
      { $push: { contacts } },
      { new: true }
    );
  
    res.status(201).json({updatedContacts})
} catch (error) {
  res.status(500).json({msg:"Something is wrong here"})
}
}

module.exports = {GetUsers, UpdateContacts}