// frontend/app/(protected)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

// Define data structures for our dynamic content
interface Friend {
  id: number;
  name: string;
  avatar: string;
}

interface Match {
  id: number; // Or a unique key
  opponent: {
    id: number;
    name: string;
  };
  result: 'Win' | 'Loss';
  score: string;
  date: string;
}

interface Stats {
  totalMatches: number;
  winRate: string;
  wins: number;
  losses: number;
}

/**
 * DashboardPage: The user's main hub after logging in.
 * - It is a client component to leverage hooks for data fetching and state management.
 * - It uses the `useAuth` hook to get the current user and their auth token.
 * - It fetches dynamic data (stats, friends, match history) once the user is authenticated.
 * - It displays loading and error states for a robust user experience.
 */
export default function DashboardPage() {
  const { user, accessToken, isLoading: isAuthLoading } = useAuth();

  // State to hold the dynamic data fetched from the backend
  const [stats, setStats] = useState<Stats | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);

  // This effect runs when the component mounts and whenever the user/token changes.
  useEffect(() => {
    // Do not run fetch operations until authentication is resolved and we have a user/token.
    if (isAuthLoading || !user || !accessToken) {
      return;
    }

    // === 1. Calculate User Stats ===
    // This data is derived directly from the user object. No extra fetch needed. Lean and clean.
    const totalMatches = user.wins + user.loses;
    const winRate = totalMatches > 0 ? `${Math.round((user.wins / totalMatches) * 100)}%` : 'N/A';
    setStats({
      totalMatches,
      winRate,
      wins: user.wins,
      losses: user.loses,
    });


    // === 2. Fetch User's Friends ===
    const fetchFriends = async () => {
      try {
        // TODO: This backend endpoint needs to be implemented.
        // It should fetch all friends for the given user ID.
        const response = await fetch(`http://localhost:3000/api/friend/${user.id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const data = await response.json();
        if (!data.success) throw new Error('Failed to fetch friends.');
        setFriends(data.result);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Could not load friends list.");
      }
    };


    // === 3. Fetch User's Match History ===
    const fetchMatches = async () => {
        // TODO: Implement the backend endpoint to get a user's match history.
        // For now, we use placeholder data.
        console.warn("Match history fetching is not implemented. Using placeholder data.");
        setMatches([
            { id: 1, opponent: { id: 2, name: 'PlayerX' }, result: 'Win', score: '11-5', date: '2024-03-20' },
            { id: 2, opponent: { id: 3, name: 'PlayerY' }, result: 'Loss', score: '9-11', date: '2024-03-19' },
        ]);
    };

    fetchFriends();
    fetchMatches();

  }, [user, accessToken, isAuthLoading]); // Dependencies for the effect

  // Display a loading state while auth is being checked.
  if (isAuthLoading) {
    return <div className="text-center text-white">Loading Dashboard...</div>;
  }

  // Display an error message if data fetching fails.
  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }
  
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-white mb-6">Welcome, {user?.name}</h1>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Wins" value={stats?.wins ?? 0} icon="🏆" />
        <StatCard title="Losses" value={stats?.losses ?? 0} icon="💀" />
        <StatCard title="Total Matches" value={stats?.totalMatches ?? 0} icon="🎮" />
        <StatCard title="Win Rate" value={stats?.winRate ?? 'N/A'} icon="📈" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match History Section */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Matches</h2>
            <div className="bg-[#1a1a1c] p-4 rounded-lg space-y-3">
                {matches.length > 0 ? matches.map(match => (
                    <div key={match.id} className="flex justify-between items-center bg-[#29282b] p-3 rounded">
                        <p>vs {match.opponent.name}</p>
                        <p className={match.result === 'Win' ? 'text-green-400' : 'text-red-400'}>{match.result}</p>
                        <p>{match.score}</p>
                    </div>
                )) : <p className="text-gray-400">No recent matches.</p>}
            </div>
        </div>

        {/* Friends List Section */}
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">Friends</h2>
            <div className="bg-[#1a1a1c] p-4 rounded-lg space-y-3">
                {friends.length > 0 ? friends.map(friend => (
                    <div key={friend.id} className="flex items-center gap-3">
                        <img src={friend.avatar || '/avatars/default.png'} alt={friend.name} className="w-10 h-10 rounded-full"/>
                        <p>{friend.name}</p>
                    </div>
                )) : <p className="text-gray-400">You haven't added any friends yet.</p>}
            </div>
        </div>
      </div>
       {/* Quick Actions */}
       <div className="flex gap-4 mt-8">
            <Link href="/play" className="btn btn-primary">Play a Game</Link>
            <Link href="/tournaments" className="btn btn-secondary">Find a Tournament</Link>
        </div>
    </div>
  );
}

// A simple, reusable component for displaying a stat card.
const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: string }) => (
  <div className="bg-[#1a1a1c] p-6 rounded-lg flex items-center gap-4">
    <div className="text-4xl">{icon}</div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);
