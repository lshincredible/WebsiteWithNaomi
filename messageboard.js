
const supabaseUrl = "https://iynvjtxslzuvvzhjrvxo.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bnZqdHhzbHp1dnZ6aGpydnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTE4ODAsImV4cCI6MjA4OTcyNzg4MH0.vQAVMMJkjyXXBrkAKK_7mT139wDGFbIUClG7AVFyM78"
const sb = supabase.createClient(supabaseUrl, supabaseKey);


async function fetchMessages() {
    const {data, error} = await sb
        .from('messages')
        .select('*')
        .order('created_at', {ascending: false})

        if(error) console.error(error);
        else renderMessages(data);
}

async function sendMessage()
{
    const name = document.getElementById("message-board-name-input").value;
    const content = document.getElementById("message-board-message-input").value;

    console.log(name, ' ', content);


    const {data, error} = await sb
    .from('messages')
        .insert([
            {name: name, content: content}
        ]);
    if (error) console.error("Error inserting: ", error);

    document.getElementById("message-board-message-input").value = '';
}

const messageListener = sb
    .channel('public:messages')
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
            console.log('New message received!', payload.new);
            fetchMessages();
        }
    )
    .subscribe();


function renderMessages(data) {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';

    data.forEach((message) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';

        const dateObj = new Date(message.created_at);

        // Formats to: "Mar 22, 2026"
        const formattedDate = dateObj.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Formats to: "02:18 AM"
        const formattedTime = dateObj.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        msgDiv.innerHTML = `
            <strong>
                ${message.name} 
                <span class="message-timestamp">${formattedDate}, ${formattedTime}</span>
            </strong>
            ${message.content}
        `;
        container.appendChild(msgDiv);
    });

    container.scrollTop = container.scrollHeight;
}

fetchMessages()