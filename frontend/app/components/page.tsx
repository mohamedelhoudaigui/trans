'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Home() {
  const { user: loggedInUser, accessToken, isAuthenticated } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:13333/api/users');
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        const data = await response.json();
        if (data.success) {
          setUsers(data.result);
        } else {
          throw new Error(data.result || 'An unknown error occurred');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddFriend = async (friendId: number) => {
    if (!isAuthenticated || !loggedInUser || !accessToken) {
      alert('You must be logged in to add friends.');
      return;
    }

    setIsAdding(friendId); // Set loading state for this specific button

    try {
      const response = await fetch('http://localhost:13333/api/friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // The all-important auth header
        },
        body: JSON.stringify({
          // --- TIP: Security ---
          // The `user_id` comes from the secure context, not from a random variable.
          // The `friend_id` is the ID of the user we are adding.
          user_id: loggedInUser.id,
          friend_id: friendId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // The backend will return a 500 error on a unique constraint violation
        // (i.e., trying to add someone who is already a friend). We can make the message friendlier.
        if (data.result.includes('SQLITE_CONSTRAINT_UNIQUE')) {
            throw new Error('You are already friends with this user.');
        }
        throw new Error(data.result || 'Failed to add friend.');
      }

      alert(`Successfully added friend!`);
      // Optionally, you could update the UI here to show they are now friends.
      
    } catch (err: any) {
      alert(`Error: ${err.message}`); // Show specific error messages
    } finally {
      setIsAdding(null); // Clear the loading state
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-6 text-white">Find Users</h1>
      
      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500 font-bold">Error: {error}</p>}
      
      {!loading && !error && (
        <div className="w-full max-w-4xl">
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between shadow">
                <div>
                  <p className="font-bold text-white">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                
                {/* --- NEW: Conditional Button --- */}
                {/* --- TIP: Conditional UI ---
                    We only show the button if:
                    1. The user is logged in (isAuthenticated).
                    2. The user in the list is NOT the logged-in user themselves.
                */}
                {isAuthenticated && loggedInUser && loggedInUser.id !== user.id && (
                  <button
                    onClick={() => handleAddFriend(user.id)}
                    disabled={isAdding === user.id} // Disable only the button being clicked
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {isAdding === user.id ? 'Adding...' : 'Add Friend'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
