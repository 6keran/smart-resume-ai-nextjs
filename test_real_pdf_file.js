const http = require('http');
const fs = require('fs');
const path = require('path');

function uploadFile(filePath, filename, mimeType) {
  return new Promise((resolve, reject) => {
    const fileBuffer = fs.readFileSync(filePath);
    const boundary = '----WebKitFormBoundaryTest' + Math.random().toString(36).substring(2);

    const postData = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
      ),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/resume/analyze',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': postData.length,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          resolve({ status: res.statusCode, body });
        });
      }
    );

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Testing PDF 1: 04-valid.pdf');
  const res1 = await uploadFile(
    path.join(__dirname, 'node_modules/pdf-parse/test/data/04-valid.pdf'),
    '04-valid.pdf',
    'application/pdf'
  );
  console.log('04-valid.pdf status:', res1.status);
  const data1 = JSON.parse(res1.body);
  console.log('  Score:', data1.overallAtsScore, '| Word count:', data1.wordCount, '| Strengths:', data1.strengths.length);

  console.log('\nTesting PDF 2: 05-versions-space.pdf');
  const res2 = await uploadFile(
    path.join(__dirname, 'node_modules/pdf-parse/test/data/05-versions-space.pdf'),
    '05-versions-space.pdf',
    'application/pdf'
  );
  console.log('05-versions-space.pdf status:', res2.status);
  const data2 = JSON.parse(res2.body);
  console.log('  Score:', data2.overallAtsScore, '| Word count:', data2.wordCount, '| Strengths:', data2.strengths.length);

  if (res1.status === 200 && res2.status === 200) {
    console.log('\n✓ BOTH real PDF tests passed with 200 OK and extracted text!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run();
