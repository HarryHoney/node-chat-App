const users  =[]

//addUser,removeUser,getUser,getusersInRoom

const addUser  = ({id,username,room})=>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username||!room){
        return{error:'Username and room are required'}
    }

const exitingUser = users.find((user)=>{
return user.room===room && user.username===username
})
if(exitingUser){
    return {
        error:'Username is in use!'
    }
}
const user = {id,username,room}
users.push(user)
return {user}
}//add user end here

const removeUser=(id)=>{
    const index = users.findIndex((user)=>{
        return user.id===id
    })
    if(index!==-1){
        return users.splice(index,1)[0]
    }
}//remove user end here

const getUser = (id)=>{
    return users.find((user)=>user.id===id)
}

const getusersInRoom = (room)=>{
    return users.filter((user)=>user.room===room)
}

module.exports = {
    getUser,
    getusersInRoom,
    addUser,
    removeUser
}