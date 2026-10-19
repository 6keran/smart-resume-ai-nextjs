import { JobProvider } from '../types';
import { LinkedInProvider } from './linkedin';
import { NaukriProvider } from './naukri';
import { AdzunaProvider } from './adzuna';
import { JoobleProvider } from './jooble';

export { LinkedInProvider } from './linkedin';
export { NaukriProvider } from './naukri';
export { AdzunaProvider } from './adzuna';
export { JoobleProvider } from './jooble';

/**
 * Returns all registered job data providers in precedence order.
 * LinkedIn and Naukri are primary discovery engines.
 * Adzuna and Jooble supplement when credentials are configured.
 */
export function getAllProviders(): JobProvider[] {
  return [
    new LinkedInProvider(),
    new NaukriProvider(),
    new AdzunaProvider(),
    new JoobleProvider(),
  ];
}

/**
 * Returns providers that are active and configured.
 */
export function getConfiguredProviders(): JobProvider[] {
  return getAllProviders().filter((provider) => provider.isConfigured());
}
