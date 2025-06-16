'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

// ======================================================================================
// I. DATA CONTRACTS & INTERFACES
// ======================================================================================

// The public-facing user profile data. Note the absence of sensitive info like email.
interface UserProfile {
  id: number;
  name: string;
  avatar: string;
  wins: number;
  loses: number;
  // We can add more stats here later, e.g., rank, title, etc.
}

// Props passed by Next.js to the page component for dynamic routes.
interface ProfilePageProps {
  params: {
    id: string; // The user ID from the URL, will be a string.
  };
}

// ======================================================================================
// II. PROFILE PAGE COMPONENT
// ======================================================================================

/**
 * ProfilePage: A dynamic page that displays the profile for a given user ID.
 * - It extracts the user ID from the URL using the `params` prop.
 * - It fetches the specific user's public profile data from the backend.
 * - It displays the user's stats and provides contextual actions, such as
 *   navigating to settings if the profile belongs to the logged-in user.
 */
export default function ProfilePage({ params }: ProfilePageProps) {
  const { user: loggedInUser, accessToken } = useAuth(); // Get the currently authenticated user
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // State for the profile being viewed, loading status, and errors.
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id; // The ID of the profile we are viewing.

  // Effect to fetch profile data when the component mounts or the user ID changes.
  useEffect(() => {
    // Do not fetch if the user ID is not available.
    if (!userId || !accessToken) return;

    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.result || 'User not found.');
        }

        setProfile(data.result);
      } catch (err: any) {
        console.error("Failed to fetch user profile:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, accessToken, API_BASE_URL]);

  // Determine if the logged-in user is viewing their own profile.
  const isOwnProfile = loggedInUser?.id === parseInt(userId, 10);

  // --- Render States ---
  if (isLoading) {
    return <div className="text-center text-white p-10">Loading Profile...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="text-center text-gray-400 p-10">Profile not found.</div>;
  }

  // --- Main Component Render ---
  return (
    <div className="page-container">
      <div className="profile-content">
        <div className="chat-area-gradient w-full max-w-4xl">
          <div className="chat-area solid-effect">
            {/* Profile Header */}
            <div className="settings-header">
                <div className="flex items-center gap-6">
                    <img 
                        src={profile.avatar || '/avatars/default.png'} 
                        alt={`${profile.name}'s avatar`}
                        className="w-24 h-24 rounded-full border-4 border-gray-600 object-cover"
                    />
                    <div>
                        <h2 className="settings-title">{profile.name}</h2>
                        <p className="text-gray-400">Transcendence Player</p>
                    </div>
                </div>
                {/* Contextual Actions */}
                <div className="settings-actions">
                    {isOwnProfile ? (
                        <Link href="/settings" className="btn btn-secondary">Edit Profile</Link>
                    ) : (
                        <>
                            <button className="btn btn-primary">Add Friend</button>
                            <button className="btn btn-secondary">Challenge to Game</button>
                        </>
                    )}
                </div>
            </div>

            {/* Profile Body with Stats & Match History */}
            <div className="settings-content">
              {/* Stats Grid */}
              <h3 className="section-title">Player Statistics</h3>
              <div className="profile-stats">
                  <StatCard title="Wins" value={profile.wins} />
                  <StatCard title="Losses" value={profile.loses} />
                  <StatCard title="Win/Loss Ratio" value={(profile.loses > 0 ? (profile.wins / profile.loses) : profile.wins).toFixed(2)} />
                  <StatCard title="Total Games" value={profile.wins + profile.loses} />
              </div>

              {/* Match History Section */}
              <div className="mt-12">
                <h3 className="section-title">Match History</h3>
                <div className="bg-[#1a1a1c] p-4 rounded-lg">
                  {/* TODO: Fetch and map over actual match history data */}
                  <p className="text-gray-400 text-center p-8">Match history is not yet implemented.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// A simple, reusable component for displaying a stat card.
const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="stat-card">
    <h4 className="stat-title">{title}</h4>
    <p className="stat-number">{value}</p>
  </div>
);
