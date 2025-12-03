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
    return res.status(201).json({msg:user.contacts, rooms:user.rooms})
  }

    const ContactExist = await User.findOne({email:clientName});

    const sameContact = ContactExist.contacts.find((c)=>c === contacts)

    if(sameContact){
      res.json({msg:"Contact already exist"})
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

  if(!roomname){
    return res.json({msg:"Its invalid"})
  }
  const roomExists = await User.findOne({ "rooms.roomname": roomname });
  console.log("This is the existing room",roomExists)


  if(roomExists){
    return res.json({msg:"room with this name already exist please choose the unique one"})
  }

  const allParticipants = [admin, ...coAdmin, ...participants]

  const updatedRooms = allParticipants.map(async(val)=>{
    const newUser = await User.findOneAndUpdate(
      {username: val},
      {$push:{rooms:{
                      roomname,
                      admin,
                      coAdmin,
                      participants
      }}}

    )
    console.log(newUser,"YEP THIS IS THE USER")
  })

  res.json({msg:allParticipants})
}

const reMoveUser = async(req,res)=>{
  const { roomName, user } = req.body;

const removeUser = await User.findOneAndUpdate(
  { username: user },
  { 
    $pull: { 
      rooms: { roomname: roomName } 
    } 
  },
  { new: true } 
);

const upDateForAll = await User.updateMany(
  { "rooms.roomname": roomName }, 
  { 
    $pull: { 
      "rooms.$.participants": user, // Try to pull from participants
      "rooms.$.coAdmin": user       // AND try to pull from coAdmin
    } 
  }
);

}

module.exports = {GetUsers, UpdateContacts, addMessage, createRoom}