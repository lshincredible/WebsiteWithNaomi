const peer = new Peer();
let localStream;
let activeCalls = [];

//set id locally
peer.on('open', (id) => {
   document.getElementById('my-id').innerText = id;
});

peer.on('connection', (conn) => {
   conn.on('data', (data) => {
      console.log("Received message: ", data);

      if(data === 'request-stream')
      {
          if(!localStream)
          {
              alert("Someone joined, but you haven't started screensharing")
              return;
          }
          console.log("Sending stream");
          const call = peer.call(conn.peer, localStream);
          activeCalls.push(call);
      }
   });
});

peer.on('disconnect', () => {
    document.getElementById("remote-video").style.display = "none";
    console.log("Disconnected");
});



//streamer
async function startStream() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("Screen sharing is not supported on this browser or connection (Requires HTTPS).");
        return;
    }
    try {
        const constraints = {
            video: true,
            audio: true
        };
        localStream = await navigator.mediaDevices.getDisplayMedia(constraints);
        const videoElement = document.getElementById('preview');
        videoElement.srcObject = localStream;
        videoElement.style.display = 'block';
        localStream.getVideoTracks()[0].onended = () => {
            console.log("Stream ended");



            activeCalls.forEach(call => {
               if(call.open) call.close();
            });

            document.getElementById("preview").style.display = "none";

        };

        console.log("starting stream");


    } catch(err)
    {
        console.log(err);
        const button = document.getElementById('share-button');
        button.textContent = err.message;
    }
}

//receiver
function connectToOther()
{
    const friendId = document.getElementById('remote-id').value.trim();

    if(!friendId)
    {
        alert("Please enter the streamer's ID first!");
        return;
    }
    const conn = peer.connect(friendId);

    conn.on('open', () => {
        console.log("Connection open, requesting stream");
        conn.send('request-stream');
    })
    activeCalls.push(conn);
}

peer.on('call', (incomingCall) => {
    console.log("Receiving stream");

    incomingCall.answer();

    incomingCall.on('stream', (remoteStream) => {
        console.log("received stream");
        const video = document.getElementById('remote-video');
        video.style.display = 'block';
        video.srcObject = remoteStream;
        document.getElementById("stop-watching").style.display = 'block';
    });

    incomingCall.on('close', () => {
       console.log("stream has been closed");
       const video = document.getElementById('remote-video');
       video.style.display = 'none';
       video.srcObject = null;
    });
});

function copyID() {
    const idText = document.getElementById('my-id').innerText;
    const btn = event.target; // Gets the button that was clicked

    navigator.clipboard.writeText(idText).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.backgroundColor = "#859dc6";

        // Change it back after 2 seconds
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = "";
        }, 2000);
    });
}

function stopWatchingStream()
{
    console.log("stopWatchingStream");
    activeCalls.forEach(call => {
        call.close();
        const video = document.getElementById('remote-video');
        video.style.display = 'none';
        video.srcObject = null;
        document.getElementById("stop-watching").style.display = 'none';
    });
}

window.onbeforeunload = () => {
    peer.destroy();
};