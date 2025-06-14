'use client';

import { useState } from 'react';
// We no longer need the Next.js router on this page
// import { useRouter } from 'next/navigation'; 
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  // const router = useRouter(); // No longer needed
  const { login } = useAuth(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:13333/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.result || 'Login failed.');
      }

      login(data.result.access_token, data.result.refresh_token);

      // Force a full page reload to the homepage. This guarantees
      // that the AuthContext will re-initialize with the new tokens.
      window.location.href = '/dashboard'; // Redirect to the dashboard or home page

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // The JSX for the form remains exactly the same
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleLogin}>
          {/* Email input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          {/* Password input */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          {/* Error message */}
          {error && <div className="bg-red-900 text-red-200 p-3 rounded-md mb-4 text-center">{error}</div>}
          {/* Submit button */}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
