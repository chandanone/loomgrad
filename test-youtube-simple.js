const https = require('https');

const apiKey = 'AIzaSyC93dsDqYMqwyFsRjmZ2hbqhFBAZBOlmiI';
const playlistId = 'PLu0W_VlzhcfzwS1I8RpqBfOqK2M5bQvS4';
const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', data);
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
