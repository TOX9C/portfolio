const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

// Hardcoded tracks — cycles every ~30s to simulate "now playing"
const TRACKS = [
  { id: '52NGJPcLUzQq5w7uv4e5gf', title: 'Private Landing (feat. Justin Bieber & Future)', artist: 'Don Toliver', duration: 283, albumArt: 'https://cdn-images.dzcdn.net/images/cover/faef1bc1eccb096f308f3ed15e571eb1/500x500-000000-80-0-0.jpg' },
  { id: '7y6RcmZyMDZ49yVupz7JdO', title: 'STOP TRYING TO BE GOD', artist: 'Travis Scott', duration: 197, albumArt: 'https://cdn-images.dzcdn.net/images/cover/7df7ac6028591a5622f24cf32a555510/500x500-000000-80-0-0.jpg' },
  { id: '7lAK3oHbfEnvUQWosrMMpR', title: 'Timeless', artist: 'The Weeknd', duration: 280, albumArt: 'https://cdn-images.dzcdn.net/images/cover/e4b16c1afe136140bba34368357e8f05/500x500-000000-80-0-0.jpg' },
  { id: '1Es7AUAhQvapIcoh3qMKDL', title: 'YOSEMITE', artist: 'Travis Scott', duration: 183, albumArt: 'https://cdn-images.dzcdn.net/images/cover/7df7ac6028591a5622f24cf32a555510/500x500-000000-80-0-0.jpg' },
  { id: '1xYpVRspgaLxdJLOTQkTjg', title: 'DUMBO', artist: 'Travis Scott', duration: 169, albumArt: 'https://cdn-images.dzcdn.net/images/cover/2a622e01fb9b1c4717c63ae3caca9826/500x500-000000-80-0-0.jpg' },
  { id: '6eT7xZZlB2mwyzJ2sUKG6w', title: 'Motley Crew', artist: 'Post Malone', duration: 199, albumArt: 'https://cdn-images.dzcdn.net/images/cover/a953ed6a6051697af19506edcd847585/500x500-000000-80-0-0.jpg' },
  { id: '6wsqVwoiVH2kde4k4KKAFU', title: 'White Iverson', artist: 'Post Malone', duration: 215, albumArt: 'https://cdn-images.dzcdn.net/images/cover/efd66ec02dc81074e5b3e7825db4c380/500x500-000000-80-0-0.jpg' },
  { id: '40uMIn2zJLAQhNXghRjBed', title: 'I KNOW ?', artist: 'Travis Scott', duration: 182, albumArt: 'https://cdn-images.dzcdn.net/images/cover/6c91e64b7157f1332a4f6b0de9e4c714/500x500-000000-80-0-0.jpg' },
  { id: '6wyhUr4Xw8z5uSy0AhoZfU', title: 'I\'M ON ONE', artist: 'Future', duration: 266, albumArt: 'https://cdn-images.dzcdn.net/images/cover/d1bd3da6698dd5eafc5b4514317039c4/500x500-000000-80-0-0.jpg' },
  { id: '6ZoZ4KGIDD23DohdVk0Ybw', title: 'Whisper My Name', artist: 'Drake', duration: 267, albumArt: 'https://cdn-images.dzcdn.net/images/cover/cccf5e9af10b6aae96f5cdd5a27c2aff/500x500-000000-80-0-0.jpg' },
  { id: '7EiZI6JVHllARrX9PUvAdX', title: 'Low Life', artist: 'Future', duration: 221, albumArt: 'https://cdn-images.dzcdn.net/images/cover/d67a9d21359a1704127c45dde2c8c57c/500x500-000000-80-0-0.jpg' },
  { id: '7KGHenqXZofXNm5MKDbT3J', title: 'Plot Twist', artist: 'Drake', duration: 295, albumArt: 'https://cdn-images.dzcdn.net/images/cover/cccf5e9af10b6aae96f5cdd5a27c2aff/500x500-000000-80-0-0.jpg' },
  { id: '3cLCA9LSb6UiOeNvTZoaav', title: 'Wants and Needs', artist: 'Drake', duration: 274, albumArt: 'https://cdn-images.dzcdn.net/images/cover/14fddd3675b7aeeab18d58b1d46acf92/500x500-000000-80-0-0.jpg' },
];

// Pre-calculate total duration of all tracks
const TOTAL_DURATION = TRACKS.reduce((sum, t) => sum + t.duration, 0);

function getCurrentTrack() {
  const now = Date.now();
  const totalElapsed = Math.floor(now / 1000) % TOTAL_DURATION;

  // Find which track is currently "playing" based on cumulative duration
  let cumulative = 0;
  let currentTrack = TRACKS[0];
  let trackStart = 0;

  for (const track of TRACKS) {
    if (totalElapsed < cumulative + track.duration) {
      currentTrack = track;
      trackStart = cumulative;
      break;
    }
    cumulative += track.duration;
  }

  const elapsed = totalElapsed - trackStart;

  return {
    ...currentTrack,
    isPlaying: true,
    elapsed,
    spotifyUrl: `https://open.spotify.com/embed/track/${currentTrack.id}?theme=0`,
  };
}

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, `http://localhost:${PORT}`).pathname;

  if (urlPath === '/api/spotify') {
    const track = getCurrentTrack();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    res.end(JSON.stringify(track));
    return;
  }

  let filePath = urlPath === '/' ? '/index.html' : urlPath;
  filePath = path.join(ROOT, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});
