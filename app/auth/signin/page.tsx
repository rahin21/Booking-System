'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [ownerMode, setOwnerMode] = useState(false);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    setRedirectUrl(`${baseUrl}/auth/callback`);
    try {
      const params = new URLSearchParams(window.location.search);
      setOwnerMode(params.get('owner') === '1');
      const msg = params.get('message');
      if (msg) setMessage(msg);
    } catch {}
  }, []);

  const handleOAuth = async () => {
    if (!redirectUrl) return; // Wait for client-side initialization
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (ownerMode) {
          // Verify admin role before redirecting to /admin
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            const { data: adminRecord, error: adminErr } = await supabase
              .from('admin')
              .select('a_email')
              .eq('a_email', user.email)
              .maybeSingle();
            if (adminErr || !adminRecord) {
              setError('Access restricted to business owners. Your account is not registered as an owner.');
              return;
            }
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else {
          router.push('/');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Sign-up successful. Check your email for a confirmation link.');
        // Switch to signin mode after successful signup
        setTimeout(() => {
          setMode('signin');
          setMessage('Please sign in with your new account.');
          setEmail('');
          setPassword('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mode === 'signin' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            {mode === 'signin' ? (ownerMode ? 'Business Owner Sign in' : 'Sign in') : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin'
              ? ownerMode
                ? 'Sign in as a business owner. Only owner accounts can access the admin dashboard.'
                : 'Use your email and password to sign in, or continue with Google.'
              : 'Create an account with your email and password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {message && (
              <div className="text-sm text-green-600">{message}</div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {mode === 'signin' ? (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" /> Sign in
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4" /> Sign up
                  </span>
                )}
              </Button>
              <Button type="button" variant="outline" disabled={loading} onClick={handleOAuth} className="flex-1">
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" /> Google
                </span>
              </Button>
            </div>

            <div className="mt-2 text-sm text-center">
              {mode === 'signin' ? (
                <button type="button" className="text-blue-600 hover:underline" onClick={() => setMode('signup')}>
                  Don't have an account? Sign up
                </button>
              ) : (
                <button type="button" className="text-blue-600 hover:underline" onClick={() => setMode('signin')}>
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}