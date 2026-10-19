import { NormalizedJob, JobSearchParams } from './types';

/**
 * Applies client-side and server-side unified filters to NormalizedJob arrays.
 */
export function filterJobs(jobs: NormalizedJob[], params: JobSearchParams): NormalizedJob[] {
  let filtered = [...jobs];

  // 1. Workplace filter (Remote, Hybrid, On-site)
  if (params.workplaceType && params.workplaceType !== 'all') {
    filtered = filtered.filter(
      (job) => job.workplaceType.toLowerCase() === params.workplaceType!.toLowerCase()
    );
  }

  // 2. Employment type filter (Full-time, Part-time, Contract, Internship)
  if (params.employmentType && params.employmentType !== 'all') {
    filtered = filtered.filter(
      (job) => job.employmentType.toLowerCase() === params.employmentType!.toLowerCase()
    );
  }

  // 3. Experience level filter (Entry, Mid, Senior, Lead)
  if (params.experienceLevel && params.experienceLevel !== 'all') {
    filtered = filtered.filter(
      (job) => job.experienceLevel.toLowerCase() === params.experienceLevel!.toLowerCase()
    );
  }

  // 4. Salary minimum filter
  if (params.salaryMin && params.salaryMin > 0) {
    filtered = filtered.filter((job) => {
      if (job.salaryMin) return job.salaryMin >= params.salaryMin!;
      if (job.salaryMax) return job.salaryMax >= params.salaryMin!;
      return true; // Don't aggressively drop unlisted salaries unless strict
    });
  }

  // 5. Posted date filter (within days)
  if (params.postedWithinDays && params.postedWithinDays > 0) {
    const cutoffTime = Date.now() - params.postedWithinDays * 24 * 60 * 60 * 1000;
    filtered = filtered.filter((job) => {
      const postedTime = new Date(job.postedAt).getTime();
      return !isNaN(postedTime) && postedTime >= cutoffTime;
    });
  }

  return filtered;
}
