const peer = new Peer();
let localStream;

//set id locally
peer.on('open', (id) => {
   document.getElementById('my-id').innerText = id;
});

//sender (answer)
peer.on('call', (call) => {

    if(!localStream) {
        alert("Someone's trying to watch, but you haven't begun your stream!1")
        return;
    }
    call.answer(localStream);

    console.log("answered call");

    call.on('stream', (remoteStream) => {

    })
})

//streamer
async function startStream() {
    try {
        localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        alert("Screen capture started! Send ID to other person.");
        const videoElement = document.getElementById('preview');
        videoElement.srcObject = localStream;
        videoElement.style.display = 'block';

        console.log("starting stream");
    } catch(err)
    {
        console.log(err);
    }
}

//receiver
function connectToOther()
{
    const friendId = document.getElementById('remote-id').value;

    if(!friendId)
    {
        alert("Please enter a friend's ID first!");
        return;
    }

    const call = peer.call(friendId, null)

    if(!call)
    {
        alert("Failed to initialize the call, check the friend's ID.");
        return;
    }

    console.log("successful call, attempting to watch stream");

    call.on('stream', (remoteStream) => {
        const video = document.getElementById('remote-video');
        video.style.display = 'block';
        video.srcObject = remoteStream;
    })
}


/*

async function startCapture() {
    try {
        const captureStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });
        const videoElement = document.getElementById("preview");
        videoElement.srcObject = captureStream;
    } catch(err)
    {
        console.error("Error: " + err);
    }

}

*/