import fs from 'fs';
import ts from 'typescript';

const code = fs.readFileSync('scripts/downloaded_layout.js', 'utf8');

console.log('Code size:', code.length);

// Let's create a source file and get syntactic diagnostics
const sourceFile = ts.createSourceFile('layout.js', code, ts.ScriptTarget.ESNext, true);
const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram(['scripts/downloaded_layout.js'], {}));

console.log('Syntactic Diagnostics count:', diagnostics.length);
console.log('Diagnostic 0:', {
  messageText: diagnostics[0].messageText,
  start: diagnostics[0].start,
  length: diagnostics[0].length,
  category: diagnostics[0].category,
  code: diagnostics[0].code
});
