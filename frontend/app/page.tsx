'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';
import Link from 'next/link'; // Use Next.js Link for optimized navigation

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // --- Redirect Logic ---
  // This effect checks the authentication status.
  useEffect(() => {
    // Once we're sure about the auth state...
    if (!isLoading && isAuthenticated) {
      // ...if the user is logged in, immediately redirect them to their dashboard.
      // They should not see the landing page.
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // This prevents a "flash" of the landing page before the redirect happens.
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        {/* You can add a spinner component here for a better UX */}
      </div>
    );
  }

  // --- The Public Landing Page UI ---
  // This content is only ever seen by guests (unauthenticated users).
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
