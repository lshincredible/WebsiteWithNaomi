const peer = new Peer();
let localStream;

//set id locally
peer.on('open', (id) => {
   document.getElementById('my-id').innerText = id;
});

//sender (answer)
peer.on('call', (call) => {
    call.answer(localStream);

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
    } catch(err)
    {
        console.log(err);
    }
}

//receiver
function connectToOther()
{
    const friendId = document.getElementById('remote-id').value;
    const call = peer.call(friendId, null)

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