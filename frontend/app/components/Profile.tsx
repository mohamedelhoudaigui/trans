'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext'; // Import our auth hook

// Define the shape of the user profile data we expect from the backend
interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string;
  wins: number;
  loses: number;
  created_at: string;
}

// The Profile component is now responsible for its own data fetching
export default function Profile() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading } = useAuth();

  // State for storing the fetched profile data and any errors
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // Effect for protecting the route
  useEffect(() => {
    // If the AuthContext is done loading and the user is not authenticated...
    if (!isLoading && !isAuthenticated) {
      // ...redirect them to the login page.
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Effect for fetching the profile data
  useEffect(() => {
    // Only fetch if we have an access token
    if (accessToken) {
      const fetchProfile = async () => {
        setIsFetching(true);
        setError(null);
        try {
          const response = await fetch('http://localhost:13333/api/users/me', {
            headers: {
              // This is the crucial step for authentication
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.result || 'Failed to fetch profile data.');
          }

          setProfileData(data.result);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsFetching(false);
        }
      };

      fetchProfile();
    }
  }, [accessToken]); // This effect re-runs whenever the accessToken changes

  // --- Render logic ---
  // Show a loading state while the AuthContext is initializing
  if (isLoading) {
    return <div className="page-container"><p>Loading...</p></div>;
  }
  
  // After loading, if the user is not authenticated, they will be redirected,
  // so we can render null or a spinner to avoid a flash of content.
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="page-container">
      <div className="profile-content">
        <div className="profile-info-section">
          <h1 className="hero-title">Your Profile</h1>
          {isFetching && <p>Fetching profile...</p>}
          {error && <p className="text-red-500 font-bold">Error: {error}</p>}
          
          {profileData && (
            <div className="hero-gradient mt-4">
              <div className="profile-details solid-effect p-8">
                <img 
                  src={profileData.avatar || '/avatars/default.png'} 
                  alt="User Avatar" 
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-600"
                />
                <h3>{profileData.name}</h3>
                <p>Email: {profileData.email}</p>
                <p>Member since: {new Date(profileData.created_at).toLocaleDateString()}</p>
                <div className="profile-stats mt-8">
                  <div className="stat-card">
                    <h4>Wins</h4>
                    <p className="stat-number text-green-400">{profileData.wins}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Losses</h4>
                    <p className="stat-number text-red-400">{profileData.loses}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
