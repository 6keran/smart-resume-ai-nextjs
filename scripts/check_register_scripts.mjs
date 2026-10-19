async function run() {
  const res = await fetch('http://localhost:3000/register');
  const html = await res.text();
  console.log('HTML size:', html.length);
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
  console.log('Script tags count:', scripts.length);
  console.log('Scripts:');
  for (const s of scripts) {
    console.log('  ' + s);
  }
}
run().catch(console.error);
