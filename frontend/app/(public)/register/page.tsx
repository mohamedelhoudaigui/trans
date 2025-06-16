'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * RegisterPage: Handles new user registration.
 * - Provides a form for user details.
 * - On successful registration, it redirects to the login page.
 * - NOTE: This is a placeholder for the actual registration API call.
 */
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:13333/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, avatar: '/avatars/default.png' }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.result || 'Registration failed.');
      }

      // Redirect to login page on success
      router.push('/login');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container flex items-center justify-center">
        <div className="hero-gradient" style={{maxWidth: '450px'}}>
            <div className="hero-container solid-effect">
                <h1 className="hero-title text-2xl mb-4">Create Account</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="form-group">
                        <label className="form-label text-left">Name</label>
                        <div className="input-gradient">
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label text-left">Email</label>
                        <div className="input-gradient">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label text-left">Password</label>
                        <div className="input-gradient">
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="button-gradient mt-4">
                        <button type="submit" className="btn btn-primary w-full">Register</button>
                    </div>
                     <p className="text-center text-sm text-gray-400 mt-2">
                        Already have an account? <Link href="/login" className="text-green-400 hover:underline">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    </div>
  );
}
