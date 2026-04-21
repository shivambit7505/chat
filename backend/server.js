const express = require('express');
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

app.get('/', (req, res) => {
  res.send('API is running successfully');
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connectchatpro')
  .then(() => {
  console.log('MongoDB Connected');
}).catch((error) => {
  console.error('MongoDB Connection Error: ', error.message);
});

const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`));

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173", // Vite default port
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

  socket.off('setup', () => {
    console.log('USER DISCONNECTED');
    socket.leave(userData._id);
  });
});
