'use client'

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signIn(email, password)
      router.push('/')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'FsiteheaderFailed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-extrabold">
              cavvy.ai
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign in to your account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <Link 
              href="/reset-password" 
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 