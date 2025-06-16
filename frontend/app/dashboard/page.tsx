'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

// import { useNavigation } from './layout';
// import ChatComponent from './components/Chat';
// import ProfileSettingsComponent from './components/ProfileSettings';
// import Profile from './components/Profile';
// import Play from './components/Play';
// import Tournament from './components/Tournament';
// import Dashboard from './components/Dashboard';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // This useEffect is our security guard for this page.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // While loading auth state, show a simple loading message.
  if (isLoading || !isAuthenticated) {
    return <div className="page-container text-center"><p className="text-white">Loading Dashboard...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="home-content">
        <div className="hero-section">
          <div className="hero-gradient">
            <div className="hero-container solid-effect">
                <h1 className="hero-title">Welcome back, {user?.name}!</h1>
                <p className="hero-subtitle">The court is ready. Challenge an opponent and rise through the ranks.</p>
                <div className="hero-actions">
                    <div className="button-gradient">
                        {/* This button will eventually link to the Play page */}
                        <Link href="/play" className="btn btn-primary">Play Game</Link>
                    </div>
                    <div className="button-gradient">
                        <Link href="/tournaments" className="btn btn-secondary">View Tournaments</Link>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
