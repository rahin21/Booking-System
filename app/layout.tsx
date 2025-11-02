import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { Home, Settings, Calendar, Users } from "lucide-react";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resort Booking System",
  description: "Online reservation and booking system for resorts, hotels, and services",
  icons: {
    icon: "/BS2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center space-x-2">
                  <Image src="/BS2.png" alt="ResortBook Logo" width={32} height={32} />
                  <span className="text-xl font-bold text-gray-900">Booking System</span>
                </Link>
                
                <div className="hidden md:flex items-center space-x-6">
                  <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/bookings">
                    <Calendar className="h-4 w-4 mr-2" />
                    My Bookings
                  </Link>
                </Button>
                <AuthButton />
              </div>
            </div>
          </div>
        </nav>

        <main>
          {children}
        </main>

        {/* Global Toaster for notifications */}
        <Toaster richColors position="top-right" />

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">ResortBook</h3>
                <p className="text-gray-400">
                  Your trusted partner for finding and booking the perfect accommodations worldwide.
                </p>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Resorts</li>
                  <li>Hotels</li>
                  <li>Villas</li>
                  <li>Conference Halls</li>
                  <li>Vehicles</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Help Center</li>
                  <li>24/7 Support</li>
                  <li>Booking Guide</li>
                  <li>Terms of Service</li>
                  <li>Privacy Policy</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 ResortBook. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
