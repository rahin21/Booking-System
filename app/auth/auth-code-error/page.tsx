'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw, Mail, ExternalLink } from 'lucide-react';

export default function AuthCodeErrorPage() {
  const router = useRouter();

  const handleTryAgain = () => {
    router.push('/auth/signin');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Authentication Failed
          </CardTitle>
          <CardDescription className="text-gray-600">
            We encountered an issue while trying to sign you in with Google. This could be due to several reasons.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">What happened?</h3>
            <p className="text-sm text-red-700">
              The OAuth authentication process was interrupted or failed to complete successfully.
            </p>
          </div>

          {/* Troubleshooting Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Possible solutions:</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Check your internet connection and try again
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Make sure you're using a supported browser
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Clear your browser cache and cookies
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Disable browser extensions that might block authentication
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleTryAgain} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={handleGoHome} 
              variant="outline" 
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </div>

          {/* Alternative Options */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 text-center mb-3">
              Still having trouble? Try these alternatives:
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/auth/signin')} 
                variant="ghost" 
                size="sm" 
                className="w-full text-gray-600 hover:text-gray-800"
              >
                <Mail className="h-4 w-4 mr-2" />
                Sign in with Email & Password
              </Button>
            </div>
          </div>

          {/* Support Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-600">
              If the problem persists, please contact our support team with the error details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}