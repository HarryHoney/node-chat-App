//Server Side
const path=require('path')
const express = require('express')
const app = express()
const http = require('http')//core module
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage}=require('./utils/messages')
const {generateLocationMessage}=require('./utils/messages')
const server = http.createServer(app)//rather then using express server here I am 
//using only me custon made server
const io = socketio(server)
const {addUser,removeUser,getUser,getusersInRoom} = require('./utils/users')
const port=process.env.PORT||5000;

const publicdir=path.join(__dirname,'../public')
app.use(express.static(publicdir))


io.on('connection',(socket)=>{
    console.log('New WebSocket Server')

    socket.on('Data_sent',(message,callback)=>{
       const user = getUser(socket.id)
       const filter = new Filter()
       if(filter.isProfane(message)){
           return callback('This language is not allowed!')
       }
       
        io.to(user.room).emit('send_to_all',generateMessage(user.username,message) );
        callback()
    })

    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id:socket.id,username,room})
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage('Admin(Harpreet)','Welcome!'))
        socket.broadcast.to(user.room).emit('send_to_all',generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getusersInRoom(user.room)
        })

        callback()
    })

    socket.on('disconnect',()=>{
       
        const user = removeUser(socket.id)

        if(user){
        io.to(user.room).emit('send_to_all',generateMessage('Admin',`${user.username} has left`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getusersInRoom(user.room)
        })
    }
    })

    socket.on('sendLocation',(position,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        
        callback('Location Shared!')
    })

})


server.listen(port,()=>{
    console.log(`Server is up at port ${port}`)
})