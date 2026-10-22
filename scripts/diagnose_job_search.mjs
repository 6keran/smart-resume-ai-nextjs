import Module from 'node:module';

// Intercept server-only for standalone script execution
const origLoad = Module._load;
Module._load = function (id, ...args) {
  if (id === 'server-only') {
    return {};
  }
  return origLoad.apply(this, [id, ...args]);
};

async function runDiagnosis() {
  const startTime = Date.now();
  console.log('--- STARTING JOB SEARCH DIAGNOSTIC (STRICT 15-SECOND TIMEOUT) ---');

  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error('TIMEOUT_EXCEEDED: Job search did not complete within 15 seconds.'));
    }, 15000);
  });

  try {
    const { executeJobSearch } = await import('../src/server/services/jobs/search.ts');
    const { getAllProviders, getConfiguredProviders } = await import('../src/server/services/jobs/providers/index.ts');

    const allProviders = getAllProviders().map(p => ({ name: p.name, configured: p.isConfigured() }));
    const configuredProviders = getConfiguredProviders().map(p => p.name);

    console.log('All Registered Providers:', allProviders);
    console.log('Configured Providers:', configuredProviders);

    const searchPromise = executeJobSearch({
      keywords: 'Software Engineer',
      location: 'India',
      limit: 5,
      bypassCache: true,
    });

    const res = await Promise.race([searchPromise, timeoutPromise]);
    clearTimeout(timeoutHandle);
    const elapsed = Date.now() - startTime;

    console.log('\n--- EXECUTION RESULT (Completed in ' + elapsed + 'ms) ---');
    console.log('Job count:', res.jobs.length);
    console.log('Provider configuration status:');
    console.log('  isConfigured:', res.isConfigured);
    console.log('  configuredProviders:', res.configuredProviders);
    console.log('Active job sources:', res.activeSources);
    console.log('Unavailable sources:', res.unavailableSources || []);
    console.log('Error message: None');

    if (res.jobs.length > 0) {
      console.log('\nSample Job Received:');
      console.log('  Title:', res.jobs[0].title);
      console.log('  Company:', res.jobs[0].company);
      console.log('  Source:', res.jobs[0].source);
      console.log('  Apply URL:', res.jobs[0].applyUrl);
    } else {
      console.log('\nDiagnosis: No matching jobs returned from active sources.');
    }
  } catch (err) {
    clearTimeout(timeoutHandle);
    const elapsed = Date.now() - startTime;
    console.log('\n--- EXECUTION RESULT (Failed after ' + elapsed + 'ms) ---');
    console.log('Job count: 0');
    console.log('Error message:', err.message);

    if (err.message.includes('TIMEOUT_EXCEEDED')) {
      console.log('Diagnosis: TIMEOUT - External network request to job provider endpoint hung or took longer than 15s.');
    } else {
      console.log('Diagnosis: PROVIDER_FAILURE / RUNTIME_ERROR -', err.message);
    }
  }
}

runDiagnosis();
