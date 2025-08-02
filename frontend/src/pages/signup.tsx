import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      await signUp(email, password);
      router.push('/');
    } catch (error) {
      setError('Failed to create an account');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="bg-primary-light p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-neutral-light">Rhythm</span>
            <span className="text-secondary">Fusion</span>
          </h1>
          <p className="text-neutral mt-2">Create your account</p>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-neutral-light text-sm font-medium mb-2" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-primary border border-neutral-dark rounded focus:outline-none focus:border-secondary text-neutral-light"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary-light text-primary font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-neutral">
            Already have an account?{' '}
            <Link href="/login" className="text-secondary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
