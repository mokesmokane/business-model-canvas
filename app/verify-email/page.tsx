'use client'

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from 'next/navigation'
import { auth } from "@/lib/firebase"
import { applyActionCode } from 'firebase/auth'

export default function VerifyEmailPage() {
  const { sendVerificationEmail, user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState('')
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    console.log('Auth state:', { sendVerificationEmail, user })
  }, [sendVerificationEmail, user])

  useEffect(() => {
    const oobCode = searchParams.get('oobCode')
    
    if (oobCode) {
      setVerifying(true)
      applyActionCode(auth, oobCode)
        .then(() => {
          router.push('/verified-success')
        })
        .catch((error) => {
          setError('Failed to verify email: ' + error.message)
        })
        .finally(() => {
          setVerifying(false)
        })
    }
  }, [searchParams, router])

  const handleResendVerification = async () => {
    try {
      if (!sendVerificationEmail) {
        throw new Error('Verification functionality not available')
      }
      await sendVerificationEmail()
      setResendDisabled(true)
      setCountdown(60)
      setError('')
    } catch (err) {
      console.error('Verification error:', err)
      setError(err instanceof Error ? err.message : 'Failed to resend verification email')
    }
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setResendDisabled(false)
    }
  }, [countdown])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <p className="text-center text-gray-600">Please sign in to verify your email</p>
          <Link href="/login">
            <Button className="w-full mt-4">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
              <Mail className="h-10 w-10 text-blue-500" />
            </div>
            {verifying ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h1>
                <p className="text-gray-600 mb-6">Please wait while we verify your email address.</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                <p className="text-gray-600 mb-6">
                  We've sent you a verification link. Please check your email and click the link to verify your account.
                </p>
              </>
            )}
            <div className="space-y-4 w-full">
              <Button
                onClick={handleResendVerification}
                disabled={resendDisabled}
                className="w-full"
              >
                {resendDisabled 
                  ? `Resend available in ${countdown}s` 
                  : 'Resend verification email'}
              </Button>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to home
                </Button>
              </Link>
            </div>
            {error && (
              <p className="text-red-500 mt-4 text-sm">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
