const { Server } = require('socket.io');
const handleOperation = require('./operation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads'); 
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  // optional: limits, fileFilter etc.
  // limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const socketInit = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ ok: false, msg: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
    };

    io.emit('file:uploaded', fileInfo);

    return res.json({ ok: true, file: fileInfo });
  });

  app.use('/uploads', require('express').static(uploadDir));

  io.on("connection", async (socket) => {
    handleOperation(socket, io);
  });
};

module.exports = { socketInit };


