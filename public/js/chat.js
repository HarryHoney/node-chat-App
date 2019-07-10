//Client Side
const socket = io()
//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendlocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix : true})

//Below code is to show just the welcome Message when the user gets in
socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        //createdAt:moment(message.createdAt).format()
    })//in above function I have to use message variable name due to shorthand syntax
    $messages.insertAdjacentHTML('beforeend',html)
})

//This function helps in scrolling
const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild
    
    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop+visibleHeight

    if(containerHeight - newMessageHeight<=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

//This code helps in chatting
socket.on('send_to_all',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//This one is for Location
socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        message:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    //disable
    const message = e.target.elements.message.value

    socket.emit('Data_sent',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''//this clear the input
        $messageFormInput.focus()//this is setting the cursor
        //enable
        if(error){
            console.log(error)
        }else{
        console.log('The message was delivered')
    }
    })
})
$sendlocation.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('Geoloation is not supported')
    }
    $sendlocation.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        const data = {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }
        socket.emit('sendLocation',data,(message)=>{
            $sendlocation.removeAttribute('disabled')
            console.log(message)
        })
    })
})
socket.on('roomData',({room,users})=>{
    room='Room Name\n'+room
    const html = Mustache.render($sidebarTemplate,{
        room,users
    })
    document.querySelector('#sidebar').innerHTML = html
})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})