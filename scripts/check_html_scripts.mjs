const res = await fetch('http://localhost:3000/register');
const html = await res.text();
const scriptSrcs = [...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*>/g)].map(m => m[0]);
console.log(`Found ${scriptSrcs.length} script tags with src:`);
scriptSrcs.forEach(s => console.log(s));

const inlineScripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
console.log(`\nFound ${inlineScripts.length} inline script tags.`);
inlineScripts.forEach((s, idx) => {
  console.log(`--- Inline script #${idx + 1} (length: ${s.length}) ---`);
  console.log(s.slice(0, 200));
});
