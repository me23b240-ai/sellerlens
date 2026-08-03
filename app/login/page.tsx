'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { EASE_OUT } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = mode === 'sign_in'
      ? await db.auth.signInWithPassword({ email, password })
      : await db.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-8 flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-600 to-amber-500" />
          <span className="font-display text-lg font-bold text-stone-900">SellerLens</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-stone-700">Email address</span>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-stone-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Please wait…' : mode === 'sign_in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => { setMode(m => m === 'sign_in' ? 'sign_up' : 'sign_in'); setError(''); }}
          className="mt-5 w-full text-center text-sm text-stone-500 hover:text-stone-700"
        >
          {mode === 'sign_in' ? "Don't have an account? " : 'Already have an account? '}
          <span className="font-medium text-indigo-600">{mode === 'sign_in' ? 'Sign up' : 'Sign in'}</span>
        </button>
      </motion.div>
    </div>
  );
}