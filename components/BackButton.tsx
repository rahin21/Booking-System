'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  return (
    <Button
      variant="outline"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back()
        } else {
          router.push('/bookings')
        }
      }}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Go Back
    </Button>
  )
}