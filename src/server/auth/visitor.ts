import 'server-only';
import { trackVisitor } from '@/server/db';
import crypto from 'node:crypto';

/**
 * Extracts the anonymous visitor ID from the request headers/cookies.
 * If none exists, generates a fresh anonymous ID and returns it.
 */
export function getOrCreateVisitorId(req: Request): string {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/sra_visitor_id=([^;]+)/);
    const userAgent = req.headers.get('user-agent') || '';

    if (match && match[1]) {
      const existingId = decodeURIComponent(match[1].trim());
      trackVisitor(existingId, userAgent);
      return existingId;
    }

    const newId = `anon_${crypto.randomBytes(8).toString('hex')}`;
    trackVisitor(newId, userAgent);
    return newId;
  } catch (err: any) {
    console.log('[Visitor Tracking Error]:', err?.message);
    return `anon_${Date.now()}`;
  }
}
