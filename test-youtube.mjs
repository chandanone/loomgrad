import dotenv from 'dotenv';
dotenv.config();

async function testYouTubeAPI() {
    const apiKey = process.env.YOUTUBE_API_KEY;
    console.log('Testing with API Key:', apiKey ? 'Key found (starts with ' + apiKey.substring(0, 5) + '...)' : 'Key NOT found');

    if (!apiKey) return;

    const playlistId = 'PLu0W_VlzhcfzwS1I8RpqBfOqK2M5bQvS4'; // Just a random public playlist (Dave Gray's)
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log('Success! API is working.');
            console.log('Playlist Title:', data.items?.[0]?.snippet?.title);
        } else {
            console.error('API Error:', data.error);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testYouTubeAPI();
