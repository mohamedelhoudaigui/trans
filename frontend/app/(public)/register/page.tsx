// frontend/app/(public)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// All API calls must use the single source of truth for the backend URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Ensure the API URL is defined before attempting to fetch.
    if (!API_BASE_URL) {
      setError("Application is misconfigured. API endpoint is not set.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }), // The avatar is handled by the backend model.
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.result || 'Registration failed.');
      }

      // On successful registration, guide the user to the login page.
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
                    {/* Form inputs remain the same */}
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
