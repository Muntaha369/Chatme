const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { socketInit } = require('./sockets/index');
const ConnectDb = require('./db/db');
const User = require('./models/model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const JWT_SECRET_KEY = 'MY_SECRET_KEY'; 

app.use(express.json()); 
app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
}));

const server = http.createServer(app);

app.post('/api/auth/register', async (req, res) => {
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
});

socketInit(server);

ConnectDb().then(() => {
    server.listen(3002, () => console.log("Server is running on port 3002"));
}).catch((error) => {
    console.error("Failed to start server due to DB connection error:", error);
    process.exit(1);
});
