import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// Lazy — evaluated at runtime, not at build time
let _jwks: JWTVerifyGetKey | null = null;
function getJWKS(): JWTVerifyGetKey {
  if (!_jwks) {
    _jwks = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL!));
  }
  return _jwks;
}

/**
 * Verifies the Neon Auth JWT from cookies and returns the user ID.
 * Redirects to /sign-in if not authenticated.
 * JIT-provisions the user in our DB on first request.
 */
export async function getUserId(): Promise<string> {
  const cookieStore = cookies();

  // Neon Auth stores the JWT in this cookie
  const token =
    cookieStore.get('neon-auth-session-token')?.value ??
    cookieStore.get('neon_auth_token')?.value;

  if (!token) redirect('/sign-in');

  try {
    const { payload } = await jwtVerify(token, getJWKS());
    const userId = payload.sub!;
    const email  = (payload.email ?? payload['https://neon.tech/email'] ?? `${userId}@unknown`) as string;

    // Ensure user row exists in our DB
    await prisma.user.upsert({
      where:  { id: userId },
      update: {},
      create: { id: userId, email },
    });

    return userId;
  } catch {
    redirect('/sign-in');
  }
}
