import fs from 'fs';

const t = fs.readFileSync('scripts/downloaded_layout.js', 'utf8');
const lines = t.split('\n');
const mockDataLine = lines[585]; // line 586 (0-indexed 585)

console.log('mockDataLine starts with:', mockDataLine.slice(0, 50));

// Extract the string argument passed to eval(...)
// It looks like: eval(__webpack_require__.ts("..."));
const match = mockDataLine.match(/eval\(__webpack_require__\.ts\((.*)\)\);$/);
if (!match) {
  console.log('Could not match eval pattern!');
  // Try finding eval(
  const start = mockDataLine.indexOf('eval(');
  console.log('Start of eval:', start);
} else {
  console.log('Matched eval argument! Length:', match[1].length);
  // parse the string argument
  let rawStr = '';
  try {
    rawStr = JSON.parse(match[1]);
  } catch {
    // If not valid JSON, use eval or Function to get the string
    rawStr = new Function(`return ${match[1]}`)();
  }
  console.log('Successfully extracted rawStr, length:', rawStr.length);
  fs.writeFileSync('scripts/extracted_mockData.js', rawStr);
  console.log('Wrote scripts/extracted_mockData.js');

  // Now test parsing rawStr with new Function
  try {
    new Function(rawStr);
    console.log('new Function(rawStr) SUCCEEDED!');
  } catch (err) {
    console.error('PARSE ERROR IN rawStr:');
    console.error(err.message);
    console.error(err.stack);
  }
}
