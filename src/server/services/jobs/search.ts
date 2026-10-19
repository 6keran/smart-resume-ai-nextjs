import 'server-only';
import { JobSearchParams, JobSearchResponse, NormalizedJob } from './types';
import { getConfiguredProviders } from './providers';
import { deduplicateJobs } from './dedupe';
import { rankJobsWithResume } from './ranking';
import { filterJobs } from './filters';
import { jobSearchCache } from './cache';

/**
 * Orchestrates multi-provider job search with deduplication, ranking, filtering, and caching.
 */
export async function executeJobSearch(params: JobSearchParams): Promise<JobSearchResponse> {
  const configuredProviders = getConfiguredProviders();
  const page = Math.max(params.page || 1, 1);
  const limit = Math.min(Math.max(params.limit || 15, 5), 50);

  // If no live providers configured, return graceful unconfigured state
  if (configuredProviders.length === 0) {
    console.info(
      '[Smart Resume AI] Live job search is not configured yet. Configure ADZUNA_APP_ID/ADZUNA_APP_KEY or JOOBLE_API_KEY in .env.local to enable live job data.'
    );

    return {
      jobs: [],
      totalJobs: 0,
      page: 1,
      totalPages: 0,
      configuredProviders: [],
      activeSources: [],
      isConfigured: false,
      searchLocation: params.location,
      searchKeywords: params.keywords,
    };
  }

  const activeSources: string[] = [];
  const unavailableSources: string[] = [];
  const rawJobs: NormalizedJob[] = [];

  // Query each configured provider in parallel
  const queryPromises = configuredProviders.map(async (provider) => {
    // Check in-memory cache first if bypassCache is not requested
    if (!params.bypassCache) {
      const cached = jobSearchCache.get(
        provider.name,
        params.keywords,
        params.location,
        params.radiusKm,
        page
      );

      if (cached && cached.length > 0) {
        activeSources.push(provider.name);
        return cached;
      }
    }

    try {
      const results = await provider.searchJobs(params);
      if (results && results.length > 0) {
        jobSearchCache.set(
          provider.name,
          results,
          params.keywords,
          params.location,
          params.radiusKm,
          page
        );
        activeSources.push(provider.name);
        return results;
      }
      return [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Job Search] Provider ${provider.name} failed:`, msg);
      unavailableSources.push(provider.name);
      return [];
    }
  });

  const resultsByProvider = await Promise.allSettled(queryPromises);

  for (const res of resultsByProvider) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      rawJobs.push(...res.value);
    }
  }

  // 1. Deduplicate listings across providers
  const deduplicated = deduplicateJobs(rawJobs);

  // 2. Apply filters (workplace, employment type, salary, date posted)
  const filtered = filterJobs(deduplicated, params);

  // 3. Rank with candidate resume if resume context is present
  const ranked = rankJobsWithResume(filtered, params);

  // 4. Calculate pagination
  const totalJobs = ranked.length;
  const totalPages = Math.ceil(totalJobs / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedJobs = ranked.slice(startIndex, startIndex + limit);

  return {
    jobs: paginatedJobs,
    totalJobs,
    page,
    totalPages,
    configuredProviders: configuredProviders.map((p) => p.name),
    activeSources: Array.from(new Set(activeSources)),
    unavailableSources: unavailableSources.length > 0 ? unavailableSources : undefined,
    isConfigured: true,
    searchLocation: params.location,
    searchKeywords: params.keywords,
    lastUpdated: new Date().toISOString(),
  };
}
