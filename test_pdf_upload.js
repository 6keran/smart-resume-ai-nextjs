const http = require('http');

function buildValidPdf(text) {
  const header = '%PDF-1.4\n';
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n';
  const streamContent = 'BT /F1 12 Tf 72 712 Td (' + text + ') Tj ET';
  const streamLen = Buffer.byteLength(streamContent);
  const obj4 = '4 0 obj\n<< /Length ' + streamLen + ' >>\nstream\n' + streamContent + '\nendstream\nendobj\n';

  const off1 = Buffer.byteLength(header);
  const off2 = off1 + Buffer.byteLength(obj1);
  const off3 = off2 + Buffer.byteLength(obj2);
  const off4 = off3 + Buffer.byteLength(obj3);
  const xrefOffset = off4 + Buffer.byteLength(obj4);

  function pad(n) {
    return ('0000000000' + n).slice(-10);
  }

  // Each line in the cross-reference table must be exactly 20 bytes (including EOL \r\n)
  const xref =
    'xref\n0 5\n0000000000 65535 f \r\n' +
    pad(off1) + ' 00000 n \r\n' +
    pad(off2) + ' 00000 n \r\n' +
    pad(off3) + ' 00000 n \r\n' +
    pad(off4) + ' 00000 n \r\n';

  const trailer =
    'trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF\n';

  return Buffer.from(header + obj1 + obj2 + obj3 + obj4 + xref + trailer);
}

async function testPdfUpload() {
  console.log('Testing PDF file upload to /api/resume/analyze...');
  const resumeText = 'David Miller - Cloud Architect - Experience with AWS, Kubernetes, Docker, Python, SQL, REST API, System Design. Led migration of microservices improving latency by 35%.';
  const pdfBuffer = buildValidPdf(resumeText);
  const boundary = '----WebKitFormBoundaryPdfTest' + Math.random().toString(36).substring(2);

  const postData = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="david_miller_resume.pdf"\r\nContent-Type: application/pdf\r\n\r\n`),
    pdfBuffer,
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
        console.log('PDF Upload Response Status:', res.statusCode);
        if (res.statusCode === 200) {
          const data = JSON.parse(body);
          console.log('✓ PDF extraction and analysis passed cleanly!');
          console.log('✓ Overall ATS Score:', data.overallAtsScore);
          console.log('✓ Detected Keywords:', data.detectedKeywords.join(', '));
          console.log('✓ Strengths count:', data.strengths.length);
          console.log('✓ Weaknesses count:', data.weaknesses.length);
          console.log('✓ Recommendations count:', data.recommendations.length);
          process.exit(0);
        } else {
          console.log('✗ PDF upload returned non-200:', body);
          process.exit(1);
        }
      });
    }
  );

  req.on('error', (e) => {
    console.error('Request error:', e);
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

testPdfUpload();
