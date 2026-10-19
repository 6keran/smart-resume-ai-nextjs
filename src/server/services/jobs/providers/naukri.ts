import { JobProvider, JobSearchParams, NormalizedJob } from '../types';

export class NaukriProvider implements JobProvider {
  readonly name = 'Naukri';

  isConfigured(): boolean {
    return true;
  }

  /**
   * Formats keywords and location for Naukri URLs
   */
  public static buildNaukriSearchUrl(keywords?: string, location?: string): string {
    const cleanKw = (keywords || 'jobs')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const cleanLoc = (location || 'india')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `https://www.naukri.com/${cleanKw}-jobs-in-${cleanLoc}`;
  }

  /**
   * Attempts discovery from Naukri's official public API.
   * If blocked by reCAPTCHA / anti-bot protection (HTTP 406/403),
   * handles it cleanly without attempting unauthorized bypass.
   */
  async searchJobs(params: JobSearchParams): Promise<NormalizedJob[]> {
    const kw = (params.keywords || '').trim();
    const loc = (params.location || '').trim();

    const queryParams = new URLSearchParams();
    queryParams.set('noOfResults', '20');
    queryParams.set('urlType', 'search_by_keyword');
    queryParams.set('searchType', 'adv');
    if (kw) queryParams.set('keyword', kw);
    if (loc) queryParams.set('location', loc);

    const apiUrl = `https://www.naukri.com/jobapi/v3/search?${queryParams.toString()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json',
          appid: '109',
          systemid: '109',
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 406 || response.status === 403) {
        // Naukri requires reCAPTCHA verification for automated traffic
        console.warn(
          '[NaukriProvider] Automated search received 406 reCAPTCHA challenge. Handled gracefully without bypassing bot protection.'
        );
        throw new Error('Naukri search is temporarily protected by CAPTCHA verification.');
      }

      if (!response.ok) {
        throw new Error(`Naukri returned status ${response.status}`);
      }

      const data = await response.json();
      const jobDetails = data?.jobDetails || [];

      if (!Array.isArray(jobDetails) || jobDetails.length === 0) {
        return [];
      }

      return jobDetails.map((item: {
        jobId?: string;
        title?: string;
        companyName?: string;
        placeholders?: Array<{ type: string; label: string }>;
        jobDescription?: string;
        staticUrl?: string;
        createdDate?: string;
      }) => {
        const jobId = item.jobId || Math.random().toString(36).substring(2, 9);
        const title = item.title || 'Software Opportunity';
        const company = item.companyName || 'Confidential';
        const locationText =
          item.placeholders?.find((p) => p.type === 'location')?.label || loc || 'India';
        const salaryText = item.placeholders?.find((p) => p.type === 'salary')?.label;
        const expText = item.placeholders?.find((p) => p.type === 'experience')?.label;
        const applyUrl = item.staticUrl
          ? `https://www.naukri.com${item.staticUrl}`
          : NaukriProvider.buildNaukriSearchUrl(kw, loc);

        return {
          id: `nk_${jobId}`,
          source: 'Naukri' as const,
          sourceJobId: jobId,
          title,
          company,
          location: locationText,
          description: item.jobDescription || `${title} at ${company} in ${locationText}`,
          snippet: (item.jobDescription || '').slice(0, 240),
          salary: salaryText,
          experience: expText,
          employmentType: 'Full-time' as const,
          experienceLevel: 'Mid' as const,
          workplaceType: 'On-site' as const,
          postedAt: item.createdDate ? new Date(item.createdDate).toISOString() : new Date().toISOString(),
          applyUrl,
          sourceUrl: applyUrl,
          skills: [],
          remote: false,
          hybrid: false,
          onsite: true,
        };
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg);
    }
  }
}
