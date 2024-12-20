'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.push('/epics')
  }, [router])

  // Show loading state while redirecting
  return <div>Loading...</div>
} 
