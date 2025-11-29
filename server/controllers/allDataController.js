const User = require('../models/model')
const Messages  =require('../models/chatModel')

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
  if(contacts === "USUAL"){
    const user = await User.findOne({email:clientName})
    return res.status(201).json({msg:user.contacts})
  }
 
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

const addMessage = async(req, res)=>{
  const {senderId, receiverId, messageText, messageType} = req.body;

  const date = new Date().toISOString();
  const newMessage = await Messages.insertOne({senderId, receiverId, messageText, timestamp:`${date}`, messageType})

  res.json({msg: newMessage})
}

const createRoom = async(req, res)=>{
  const {admin, coAdmin, participants, roomname} = req.body;

  const allParticipants = [admin, ...coAdmin, ...participants]

  allParticipants.map(async(val)=>{
    const newUser = await User.findOneAndUpdate(
      {username: val},
      {$push:{rooms:{
                      roomname,
                      admin,
                      coAdmin,
                      participants
      }}}

    )
    console.log(newUser.username,"YEP THIS IS THE USER")
  })

  res.json({msg:allParticipants})
}

// const GetMessage = async(req,res)=>{
//   try {
//     const {name} = req.body;
//     const messages = await Messages.find({
//     $or: [
//       { senderId: name },
//       { receiverId: name }
//     ]}).sort({ timestamp: 1 });
//     res.status(201).json({messages})
//   } catch (error) {
//     res.status(500).json({msg:"Something is wrong here"})
//   }
// }

module.exports = {GetUsers, UpdateContacts, addMessage, createRoom}