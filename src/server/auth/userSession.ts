import 'server-only';
import { cookies } from 'next/headers';
import { getUserBySessionToken, type UserProfile } from '@/server/db';

/**
 * Extracts the user profile from the request cookies (sra_user_session).
 * Returns null if user has not yet set up their profile or is unauthenticated.
 */
export function getUserFromRequest(req: Request): UserProfile | null {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/sra_user_session=([^;]+)/);
    if (!match || !match[1]) return null;

    const token = decodeURIComponent(match[1].trim());
    return getUserBySessionToken(token);
  } catch (err) {
    console.error('Error extracting user from request:', err);
    return null;
  }
}

/**
 * Server Component / Server Action helper to fetch currently authenticated user.
 */
export async function getAuthenticatedUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sra_user_session')?.value;
    if (!token) return null;
    return getUserBySessionToken(token);
  } catch (err) {
    console.error('Error fetching authenticated user from cookies:', err);
    return null;
  }
}
