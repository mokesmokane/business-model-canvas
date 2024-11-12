'use client'

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { User, LogOut, CreditCard, Settings, Menu } from "lucide-react"
import { useState } from "react"
import { AuthDialog } from "@/components/auth/AuthDialog"
import Link from 'next/link'
import { useExpanded } from "@/contexts/ExpandedContext"


export function SiteHeader() {
  const { user, logout, subscriptionStatus, userData } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { isExpanded, setIsExpanded } = useExpanded()

  console.log('SiteHeader Render:', {
    userExists: !!user,
    subscriptionStatus,
    userData
  });

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className={`w-full bg-white p-4 ${user ? 'border-b' : ''}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {userData && (
            <Button
              variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-900"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <Link className="flex items-center justify-center" href="#">
            <span className="text-2xl font-extrabold">cavvy.ai</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-8">
          {!user && (
            <nav className="flex gap-6">
              <Link href="/features" className="text-gray-900 hover:underline underline-offset-4 transition-colors font-extrabold">
                Features
              </Link>
              <Link href="/faq" className="text-gray-900 hover:underline underline-offset-4 transition-colors font-extrabold">
                FAQ
              </Link>
              <Link href="/pricing" className="text-gray-900 hover:underline underline-offset-4 transition-colors font-extrabold">
                Pricing
              </Link>
            </nav>
          )}
          {user && (
            <>
              {subscriptionStatus === 'free' && (
                <Link href="/upgrade" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Upgrade Plan
                </Link>
              )}
              {(subscriptionStatus === 'pro' || subscriptionStatus === 'enterprise') && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm font-medium text-blue-600">
                    {subscriptionStatus === 'pro' ? 'Pro' : 'Enterprise'} Plan
                  </span>
                </div>
              )}
            </>
          )}

          {/* Auth button/dropdown */}
          {user ? (
            <div 
              className="relative group"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Button 
                variant="ghost" 
                className="h-8 w-8 rounded-full p-0 hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </Button>

              <div className={`
                absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white
                transform transition-all duration-200 ease-in-out origin-top-right
                ${isDropdownOpen 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
              `}>
                <div className="absolute -top-2 right-0 h-2 w-full" />
                <div className="rounded-md ring-1 ring-black ring-opacity-5 py-1">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  <hr className="my-1" />
                  <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </button>
                  <hr className="my-1" />
                  <button 
                    onClick={handleSignOut}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowAuthDialog(true)}
              variant="outline"
              className="bg-gray-900 font-extrabold text-white hover:bg-gray-600 hover:text-white"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
      <AuthDialog 
        isOpen={showAuthDialog}
        openSignUp={false}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={() => setShowAuthDialog(false)}
      />
    </header>
  )
} 