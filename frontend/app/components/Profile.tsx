'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

// Define the shape of the main user profile
interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string;
  wins: number;
  loses: number;
  created_at: string;
}

// --- TIP ---
// Define a specific interface for each type of data you expect from the API.
// This keeps your code clean, predictable, and helps catch errors.
interface Friend {
  id: number;
  name: string;
  email: string;
}

export default function Profile() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, isLoading } = useAuth();

  // State for the main profile data
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  // --- TIP ---
  // Use separate state for separate pieces of data. This is good practice.
  // The loading/error state for the profile is independent of the friends list.
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [isFetchingFriends, setIsFetchingFriends] = useState(true);


  // Effect for protecting the route (no changes here)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Effect for fetching the main profile data (no changes here)
  useEffect(() => {
    if (accessToken) {
      const fetchProfile = async () => {
        setIsFetchingProfile(true);
        setProfileError(null);
        try {
          const response = await fetch('http://localhost:13333/api/users/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          const data = await response.json();
          if (!response.ok || !data.success) throw new Error(data.result);
          setProfileData(data.result);
        } catch (err: any) {
          setProfileError(err.message);
        } finally {
          setIsFetchingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [accessToken]);
  
  // --- NEW ---
  // A separate useEffect to fetch the friends list.
  useEffect(() => {
    // --- TIP ---
    // We check for `user` here because we need `user.id` for the API call.
    // This effect will run as soon as the user and token are available from the AuthContext.
    if (user && accessToken) {
      const fetchFriends = async () => {
        setIsFetchingFriends(true);
        setFriendsError(null);
        try {
          // We use the logged-in user's ID from the context to build the URL.
          const response = await fetch(`http://localhost:13333/api/friend/${user.id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          const data = await response.json();
          if (!response.ok || !data.success) throw new Error(data.result);
          setFriends(data.result);
        } catch (err: any) {
          // The backend sends a 404 with "friendship not found" if there are no friends,
          // which is not a real error, so we can ignore it.
          if (err.message.includes('friendship not found')) {
            setFriends([]); // Ensure friends list is empty
          } else {
            setFriendsError(err.message);
          }
        } finally {
          setIsFetchingFriends(false);
        }
      };
      fetchFriends();
    }
  }, [user, accessToken]); // This hook depends on `user` and `accessToken`

  
  // Render logic remains similar, but we add the friends list at the end.
  if (isLoading || isFetchingProfile) {
    return <div className="page-container"><p>Loading Profile...</p></div>;
  }
  
  if (!isAuthenticated) return null;

  return (
    <div className="page-container">
      <div className="profile-content">
        <div className="profile-info-section">
          <h1 className="hero-title">Your Profile</h1>
          {profileError && <p className="text-red-500 font-bold">Error: {profileError}</p>}
          
          {profileData && (
            <div className="hero-gradient mt-4">
              <div className="profile-details solid-effect p-8">
                <img src={profileData.avatar || '/avatars/default.png'} alt="User Avatar" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-600"/>
                <h3>{profileData.name}</h3>
                <p>Email: {profileData.email}</p>
                <p>Member since: {new Date(profileData.created_at).toLocaleDateString()}</p>
                <div className="profile-stats mt-8">
                  <div className="stat-card"><h4>Wins</h4><p className="stat-number text-green-400">{profileData.wins}</p></div>
                  <div className="stat-card"><h4>Losses</h4><p className="stat-number text-red-400">{profileData.loses}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* --- NEW: Friends List Section --- */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Friends</h2>
            {isFetchingFriends ? (
              <p className="text-gray-400">Loading friends...</p>
            ) : friendsError ? (
              <p className="text-red-500">{friendsError}</p>
            ) : friends.length > 0 ? (
              <ul className="space-y-3">
                {friends.map((friend) => (
                  <li key={friend.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                    <span className="text-white font-medium">{friend.name}</span>
                    <span className="text-gray-400 text-sm">{friend.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">You haven't added any friends yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
