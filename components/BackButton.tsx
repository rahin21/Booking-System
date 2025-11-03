'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  return (
    <Button variant="outline" onClick={() => history.back()}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Go Back
    </Button>
  )
}