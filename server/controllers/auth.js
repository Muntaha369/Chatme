const User = require('../models/model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = 'MY_SECRET_KEY'; 

const register = async (req, res) => {
    try {
        const { username, email, password, contacts, rooms } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required." });
        }

        const UserExist = await User.findOne({ email: email });

        if (UserExist) {
            return res.status(409).json({ msg: "User already exists. Please login." }); 
        }
        
        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);
        
        const UserCreated = await User.create({ 
            username, 
            email, 
            password: hashedPassword ,
            contacts,
            rooms
        });
        
        const token = jwt.sign(
            { 
                userId: UserCreated._id.toString(), 
                email: UserCreated.email 
            },
            JWT_SECRET_KEY,
            { expiresIn: '30d' }
        ); 

        res.status(201).json({
            msg: "Registration successful!",
            token: token,
            UserId: UserCreated._id.toString(),
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ 
            msg: "Internal server error during registration.",
            error: error.message
        });
    }
}

const login = async(req,res)=>{

 try {
   const { email, password} = req.body;
 
   const UserExist = await User.findOne({email: email})
 
   if(!UserExist){
     return res.status(400).json({msg: "Please Sign up first"})
   }

  const isPasswordValid = await bcrypt.compare(password, UserExist.password);;
 
     if (!isPasswordValid) {
       return res.status(401).json({ msg: "Invalid credentials" });
     }

     const token = jwt.sign(
            { 
                userId: UserExist._id.toString(), 
                email: UserExist.email 
            },
            JWT_SECRET_KEY,
            { expiresIn: '30d' }
        );
 
     res.status(200).json({
       msg: "Login successful",
       token: token,
       UserId: UserExist._id.toString(),
     });
 } catch (error) {
  res.status(500).json({ msg: "Internal server error" });
 }
}

module.exports = { register, login }