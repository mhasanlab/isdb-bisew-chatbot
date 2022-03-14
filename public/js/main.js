const chatForm = document.getElementById('chat-form')

const chatMessages = document.querySelector('.chat-messages');

const roomName = document.getElementById('room-name');

const userList = document.getElementById('users');

//Get User name and room from URL

const{username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true
})

// console.log(username, room);

const socket = io();

// Join Chat Room

socket.emit('joinRoom', {username, room});

// Get Room and users

socket.on('roomUsers', ({room, users}) =>{
    outputRoomName(room);
    outputUsers(users)
})

// Message From Server
socket.on('message', message =>{
    console.log(message);
    outputMessage(message);

    //Scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight;

});

//Message Submit

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get Message Text
    const msg =e.target.elements.msg.value;

    // Emit message to server

    socket.emit( 'chatMessage', msg);

    //Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output Message to DOM

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div);
}

// Add Room Name to DOM

function outputRoomName(room){
    roomName.innerText = room;
}

// Add Users To DOM

function outputUsers(Users){
    userList.innerHTML = `
    ${Users.map(user =>`<li>${user.username}</li>`).join('')}
    `;
}