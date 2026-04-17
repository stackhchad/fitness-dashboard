'use client';

import { AuthView } from '@neondatabase/neon-js/auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Fitness Dashboard</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        <AuthView onSignIn={() => router.push('/')} />
      </div>
    </div>
  );
}
