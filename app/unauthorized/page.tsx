'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, ShieldAlert } from 'lucide-react';
import BackButton from '@/components/BackButton';
import AnimateIn from '@/components/AnimateIn';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-gray-50 to-white">
      <section className="container mx-auto px-4 py-24">
        <AnimateIn>
        <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-tr from-red-200 to-orange-200 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-tr from-yellow-200 to-pink-200 blur-3xl" />
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 text-red-700 px-3 py-1 text-xs font-medium">
                <ShieldAlert className="h-3.5 w-3.5" />
                Unauthorized Access
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Access Restricted to Business Owners
              </h1>
              <p className="text-gray-600 leading-relaxed">
                You do not have permission to view this page. Only verified business owners (admins) can access the admin dashboard.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild>
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </Link>
                </Button>
                <BackButton />
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-700 font-medium">Sign in as owner</p>
                  <p className="text-xs text-gray-500">Use the business owner account to access admin.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-700 font-medium">Request access</p>
                  <p className="text-xs text-gray-500">Contact support to verify your admin status.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-700 font-medium">Return home</p>
                  <p className="text-xs text-gray-500">Browse the site with general access.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-red-100 blur-xl" />
                <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-yellow-100 blur-xl" />
                <div className="overflow-hidden rounded-xl border bg-white">
                  <Image
                    src="/window.svg"
                    alt="Unauthorized"
                    width={320}
                    height={320}
                    className="p-8 opacity-90"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        </AnimateIn>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Error 401 — Unauthorized Access</p>
        </div>
      </section>
    </div>
  );
}