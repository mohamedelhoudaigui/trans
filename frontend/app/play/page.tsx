'use client';

import PlayComponent from '../components/Play'; // Adjusted the import name to avoid conflict
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PlayPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // --- Security Guard ---
  // This ensures that unauthenticated users can't even access this page.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Don't render anything until we are sure the user is authenticated
  if (isLoading || !isAuthenticated) {
    return <div className="page-container text-center"><p className="text-white">Loading...</p></div>;
  }

  // Once authenticated, render the actual game component
  return <PlayComponent />;
}
