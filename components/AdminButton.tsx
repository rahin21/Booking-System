'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminButton() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      try {
        setChecking(true);
        // Get current user from client-side auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;

        if (!user?.email) {
          setIsAdmin(false);
          return;
        }

        // Check admin table for this email
        const { data: adminRecord, error } = await supabase
          .from('admin')
          .select('a_email')
          .eq('a_email', user.email)
          .maybeSingle();

        if (!mounted) return;
        if (error) {
          setIsAdmin(false);
        } else {
          setIsAdmin(Boolean(adminRecord));
        }
      } catch (_err) {
        if (!mounted) return;
        setIsAdmin(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Re-check when auth state changes
      checkAdmin();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (checking) {
    // Subtle placeholder while checking admin status
    return (
      <span className="hidden md:flex items-center space-x-2 text-gray-400">
        <Settings className="h-4 w-4" />
        <span>Checking...</span>
      </span>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <Settings className="h-4 w-4" />
      <span>Admin</span>
    </Link>
  );
}