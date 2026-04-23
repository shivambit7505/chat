const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // to accept JSON data

// Routes
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

const PORT = process.env.PORT || 5000;

// Serve frontend in production or if the build folder exists
const frontendDistPath = path.join(__dirname, '../frontend/dist');

if (process.env.NODE_ENV === 'production' || fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running successfully. Frontend build not found.');
  });
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connectchatpro')
  .then(() => {
  console.log('MongoDB Connected');
}).catch((error) => {
  console.error('MongoDB Connection Error: ', error.message);
});

// BUG FIX: Wrapped console.log in arrow function — previously it executed immediately
const server = app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*", // Allow all origins to prevent connection blocking on deployed environments
  },
});

io.on('connection', (socket) => {
  console.log('Connected to socket.io');

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User Joined Room: ' + room);
  });

  socket.on('new message', (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach(user => {
      if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  // BUG FIX: Changed socket.off to socket.on('disconnect') — 
  // socket.off removes a listener, it doesn't listen for disconnection.
  // Also, userData was out of scope here causing a ReferenceError.
  socket.on('disconnect', () => {
    console.log('USER DISCONNECTED');
  });
});
