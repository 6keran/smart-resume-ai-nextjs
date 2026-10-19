import http from 'http';

const req = http.request('http://localhost:3000/_next/static/chunks/main-app.js', {
  headers: {
    'sec-ch-ua-platform': '"Windows"',
    'Referer': 'http://localhost:3000/register',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0',
    'sec-ch-ua': '"Microsoft Edge";v="155", "Chromium";v="155", "Not(A:Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'Accept-Encoding': 'gzip, deflate, br, zstd'
  }
}, res => {
  console.log('Status:', res.statusCode, res.headers['content-encoding'], res.headers['content-length']);
  let bytes = 0;
  res.on('data', chunk => { bytes += chunk.length; });
  res.on('end', () => console.log('Finished. Received bytes:', bytes));
});
req.on('error', console.error);
req.end();
