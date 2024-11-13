'use client'

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { auth } from "@/lib/firebase"
import { applyActionCode, confirmPasswordReset } from 'firebase/auth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

const AuthActionPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [verifying, setVerifying] = useState(false)
  
  // Password reset states
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const mode = searchParams.get('mode')
  const oobCode = searchParams.get('oobCode')

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid action code')
      return
    }

    if (mode === 'verifyEmail') {
      setVerifying(true)
      applyActionCode(auth, oobCode)
        .then(() => auth.currentUser?.reload())
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
  }, [mode, oobCode, router])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!oobCode) {
      setError('Invalid password reset link')
      return
    }

    try {
      await confirmPasswordReset(auth, oobCode, password)
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset password')
    }
  }

  const renderContent = () => {
    if (mode === 'verifyEmail') {
      return (
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
            <Mail className="h-10 w-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {verifying ? 'Verifying your email...' : 'Email Verification'}
          </h1>
          <p className="text-gray-600 mb-6">
            {verifying ? 'Please wait while we verify your email address.' : 'Processing your verification request.'}
          </p>
          <Link href="/" className="block w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </div>
      )
    }

    if (mode === 'resetPassword') {
      return (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Reset Password</h1>
          {success ? (
            <div className="text-center">
              <p className="text-green-600 mb-4">Password reset successful!</p>
              <p className="text-gray-600">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </form>
          )}
        </>
      )
    }

    return <p className="text-center text-gray-600">Invalid action type</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          {renderContent()}
          {error && <p className="text-sm text-red-500 mt-4 text-center">{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default AuthActionPage 