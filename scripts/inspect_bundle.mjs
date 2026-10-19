const r = await fetch('http://localhost:3000/_next/static/chunks/main-app.js');
const t = await r.text();
const modules = [...t.matchAll(/\/\*\*\*\/ "([^"]+)":/g)].map(m => m[1]);
console.log('Total modules in main-app.js:', modules.length);
console.log('Sample modules:', modules.slice(0, 30));

const rLayout = await fetch('http://localhost:3000/_next/static/chunks/app/layout.js');
const tLayout = await rLayout.text();
const layoutModules = [...tLayout.matchAll(/\/\*\*\*\/ "([^"]+)":/g)].map(m => m[1]);
console.log('\nTotal modules in app/layout.js:', layoutModules.length);
console.log('Sample layout modules:', layoutModules.slice(0, 30));
