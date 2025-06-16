'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';

/**
 * LandingPage: The primary entry point for all users.
 * - It leverages the useAuth hook to determine authentication status.
 * - If the user is authenticated, it performs a client-side redirect
 *   to the '/dashboard', ensuring logged-in users bypass the landing page.
 * - This prevents a flash of public content for authenticated users.
 * - If the user is not authenticated, it displays the public-facing
 *   hero section with login/register calls to action.
 */

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // As soon as we confirm the user is authenticated, redirect them.
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // While loading or if authenticated, render a blank loading state
  // to prevent the landing page from flashing before the redirect.
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        {/* You can replace this with a dedicated spinner component */}
      </div>
    );
  }

  // This UI is only ever seen by unauthenticated visitors.
  return (
    <div className="page-container">
      <div className="home-content">
        <div className="hero-section">
          <div className="hero-gradient">
            <div className="hero-container solid-effect">
              <h1 className="hero-title">Welcome to Pong Transcendence</h1>
              <p className="hero-subtitle">
                The ultimate online multiplayer Pong experience.
                Compete, climb the leaderboards, and prove your skill.
              </p>
              <div className="hero-actions">
                <div className="button-gradient">
                  <Link href="/login" className="btn btn-primary">
                    Login to Play
                  </Link>
                </div>
                <div className="button-gradient">
                  <Link href="/register" className="btn btn-secondary">
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
