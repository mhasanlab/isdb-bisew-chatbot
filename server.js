const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { Socket } = require('dgram');
const formatMessage = require('./utls/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utls/users');

const app = express();
const server = http.createServer(app)
const io = socketio(server);

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'IsDB-BISEW'

// run when user or client connects

io.on('connection', socket => {
    socket.on('joinRoom', ({username, room})=>{
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

    // Wellcome Current User

    socket.emit('message', formatMessage(botName, 'Wellcome to IsDB-BISEW Open ChatBot'));

    //Broadcast When a user connects

    socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat`));

    // Send Users and room info

    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
    });

    });
    
    // console.log('New WS Connection...');

    //Listen for chatMessage
    socket.on('chatMessage', (msg) =>{
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg))
    });

    // Run When A user disconnects
    socket.on('disconnect', () =>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`));

            // Send Users and room info

            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

        
    });
});


const PORT = process.env.PORT;

server.listen(PORT, () => console.log(`Server is Running on port ${PORT}`))

