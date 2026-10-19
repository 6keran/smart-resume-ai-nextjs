import fs from 'fs';

const t = fs.readFileSync('scripts/downloaded_layout.js', 'utf8');
const lines = t.split('\n');
const line586 = lines[585]; // 0-indexed 585 is 1-indexed 586

console.log('Line 586 length:', line586.length);
console.log('Prefix up to col 35:', JSON.stringify(line586.slice(0, 35)));

// Let's test evaluating this exact line with V8 / vm!
import vm from 'vm';

try {
  // Let's create a fake __webpack_require__ with .ts
  const sandbox = {
    __webpack_require__: {
      ts: (str) => {
        console.log('ts() called with string of length:', str.length);
      }
    }
  };
  vm.runInNewContext(line586, sandbox);
  console.log('vm.runInNewContext(line586) succeeded in Node!');
} catch (err) {
  console.error('vm.runInNewContext(line586) FAILED:');
  console.error(err.message);
  console.error(err.stack);
}
