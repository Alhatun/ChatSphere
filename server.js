// const path = require("path");
// const http = require("http");
// const express = require("express");
// const socketio = require("socket.io");
// const formatMessage = require("./utils/messages");
// const createAdapter = require("@socket.io/redis-adapter").createAdapter;
// const redis = require("redis");
// require("dotenv").config();
// const { createClient } = redis;
// const {
//   userJoin,
//   getCurrentUser,
//   userLeave,
//   getRoomUsers,
// } = require("./utils/users");

// const app = express();
// const server = http.createServer(app);
// const io = socketio(server);

// // Set static folder
// app.use(express.static(path.join(__dirname, "public")));

// const botName = "ChatCord Bot";



// // Run when client connects
// io.on("connection", (socket) => {
    
//   console.log(io.of("/").adapter);
//   socket.on("joinRoom", ({ username, room }) => {
//     const user = userJoin(socket.id, username, room);

//     socket.join(user.room);

//     // Welcome current user
//     socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

//     // Broadcast when a user connects
//     socket.broadcast
//       .to(user.room)
//       .emit(
//         "message",
//         formatMessage(botName, `${user.username} has joined the chat`)
//       );

//     // Send users and room info
//     io.to(user.room).emit("roomUsers", {
//       room: user.room,
//       users: getRoomUsers(user.room),
//     });
//   });

// // Listen for chatMessage
// socket.on('chatMessage', ({ msg, file }) => {
//   const user = getCurrentUser(socket.id);

//   // Check if a file is included
//   if (file) {
//     // Emit the file to all users in the room
//     io.to(user.room).emit('fileMessage', {
//       username: user.username,
//       file: {
//         filename: file.name,
//         data: file.data,
//       },
//     });
//   }

//   // Emit the chat message to all users in the room
//   io.to(user.room).emit('message', formatMessage(user.username, msg));
// });

//   // Runs when client disconnects
//   socket.on("disconnect", () => {
//     const user = userLeave(socket.id);

//     if (user) {
//       io.to(user.room).emit(
//         "message",
//         formatMessage(botName, `${user.username} has left the chat`)
//       );

//       // Send users and room info
//       io.to(user.room).emit("roomUsers", {
//         room: user.room,
//         users: getRoomUsers(user.room),
//       });
//     }
//   });
// });

// const PORT = 3000 || process.env.PORT ;

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


//--------------------------------------------------------------------

const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const multer = require("multer");
const moment = require("moment");
const formatMessage = require("./utils/messages");
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");

require("dotenv").config();
const { createClient } = redis;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public", "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Multer file filter configuration
const fileFilter = function (req, file, cb) {
  if (file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Initialize multer upload
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Run when client connects
io.on("connection", (socket) => {
  console.log(io.of("/").adapter);
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

// Listen for chatMessage
socket.on('chatMessage', ({ msg }) => {
  const user = getCurrentUser(socket.id);

  const message = formatMessage(user.username, msg);

  io.to(user.room).emit('message', message);
});


  // Listen for image upload
  socket.on("imageUpload", upload.single("image"), (req, res) => {
    const user = getCurrentUser(socket.id);

    if (req.file) {
      // Get the image file path
      const imagePath = path.join("uploads", req.file.filename);

      // Create a formatted message object for the image
      const imageMessage = formatMessage(
        user.username,
        `<img src="/${imagePath}" alt="Image" class="chat-image">`
      );

      // Emit the image message to all clients in the room
      io.to(user.room).emit("message", imageMessage);
    }
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// ------------------------------------------------------------------------------------


