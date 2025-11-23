const User = require('../models/model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = require('../keys/keys')
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
       contacts:UserExist.contacts,
       UserId: UserExist._id.toString(),
     });
 } catch (error) {
  res.status(500).json({ msg: "Internal server error" });
 }
}

const verify = (req, res) => {

    const { token } = req.body;


    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required in the request body.' });
    }

    try {

        const decodedPayload = jwt.verify(token, JWT_SECRET_KEY);


        console.log("Token Verified Successfully:", decodedPayload);
        return res.status(200).json({
            success: true,
            message: decodedPayload.email,

        });

    } catch (error) {

        console.error("Token Verification Failed:", error.message);

        if (error instanceof jwt.TokenExpiredError) {

            return res.status(401).json({ success: false, message: "Token has expired. Please log in again." });
        } else if (error instanceof jwt.JsonWebTokenError) {

            return res.status(403).json({ success: false, message: "Token is invalid." });
        } else {

            return res.status(500).json({ success: false, message: "Internal server error during token verification." });
        }
    }
};


module.exports = { register, login, verify }