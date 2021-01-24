const socket = io();

socket.on("message", (welcomeMsg) => {
    console.log(welcomeMsg);
});

// it's a convention to prefix the variable name with $ to denote it's an HTML element
const $messageForm = document.querySelector("#message-form");
const $messageFormButton = $messageForm.querySelector("button");
const $messageFormInput = $messageForm.querySelector("input");
const $sendLocationButton = $messageForm.querySelector("#send-location");
const $messages = document.querySelector("#messages");

const messageTemplate = document.querySelector("#message-template").innerHTML;

socket.on("message", (message) => {
    console.log("message : ", message);
    const html = Mustache.render(messageTemplate, {
        message
    });
    $messages.insertAdjacentHTML('beforeend', html);
})

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault(); //prevent default behaviour where browser refreshes
    const msg = e.target.elements.message.value;

    //disable the send buttons when one message is being sent
    $messageFormButton.setAttribute("disabled", "disabled");

    // got acknowledgement msg - deliveredMsg
    socket.emit("sendMessage", msg, (err) => {
        if (err) {
            console.log("Error: ", err);
        }
        // enable the button once the message has been sent
        $messageFormButton.removeAttribute("disabled");

        $messageFormInput.value = "";
        $messageFormInput.focus();
        console.log("Got confirmation from server after message delivery");
    });
    //document.querySelector('input').value = "";
})

document.querySelector("#send-location").addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geo location is not supported by your browser");
    }

    $sendLocationButton.setAttribute("disabled", "disabled");
    
    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position);
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, () => {
            $sendLocationButton.removeAttribute("disabled");
            console.log("Client: Location shared");
        })
    })
})

// socket.on("countUpdated", (count) => {
//     console.log("Count has been updated", count);
// })


// document.querySelector("#increment").addEventListener("click", () => {
//     console.log("Clicked");
//     socket.emit("incrementCount");
// })