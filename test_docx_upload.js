const http = require('http');
const JSZip = require('jszip');

async function createDocxBuffer(text) {
  const zip = new JSZip();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${text}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`
  );

  return await zip.generateAsync({ type: 'nodebuffer' });
}

async function testDocxUpload() {
  console.log('Testing DOCX upload to /api/resume/analyze...');
  const resumeText =
    'Emily Watson - Senior Machine Learning Engineer - Skills: Python, TensorFlow, PyTorch, SQL, Docker, AWS, Kubernetes, Git. Led computer vision team increasing model accuracy to 96% and reducing inference latency by 40%.';

  const docxBuffer = await createDocxBuffer(resumeText);
  const boundary = '----WebKitFormBoundaryDocxTest' + Math.random().toString(36).substring(2);

  const postData = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="emily_watson_resume.docx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`
    ),
    docxBuffer,
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
        console.log('DOCX Upload Status:', res.statusCode);
        if (res.statusCode === 200) {
          const data = JSON.parse(body);
          console.log('✓ DOCX upload & extraction succeeded!');
          console.log('✓ Overall ATS Score:', data.overallAtsScore);
          console.log('✓ Detected Keywords:', data.detectedKeywords.join(', '));
          console.log('✓ Strengths count:', data.strengths.length);
          console.log('✓ Weaknesses count:', data.weaknesses.length);
          console.log('✓ Recommendations count:', data.recommendations.length);
          process.exit(0);
        } else {
          console.error('✗ DOCX upload failed:', body);
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

testDocxUpload();
