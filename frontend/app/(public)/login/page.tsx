'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

/**
 * LoginPage: A Page component responsible for user authentication.
 * It is the default export, making it a valid Next.js Page.
 * - Provides a form for email and password.
 * - Invokes the login function from AuthContext.
 * - Handles UI state for errors and submission.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Pass credentials to the context's login function
      await login(email, password);
      router.push('/dashboard'); // Redirect on success
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="page-container flex items-center justify-center">
        <div className="hero-gradient" style={{maxWidth: '450px'}}>
            <div className="hero-container solid-effect">
                <h1 className="hero-title text-2xl mb-4">Login</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="form-group">
                        <label className="form-label text-left">Email</label>
                        <div className="input-gradient">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label text-left">Password</label>
                        <div className="input-gradient">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="button-gradient mt-4">
                        <button type="submit" className="btn btn-primary w-full">
                            Login
                        </button>
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-2">
                        Don't have an account? <Link href="/register" className="text-green-400 hover:underline">Register here</Link>
                    </p>
                </form>
            </div>
        </div>
    </div>
  );
}
