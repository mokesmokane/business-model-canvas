'use client'

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { User, LogOut, CreditCard, Settings, Menu } from "lucide-react"
import { useState } from "react"
import { AuthDialog } from "@/components/auth/AuthDialog"
import Link from 'next/link'
import { useExpanded } from "@/contexts/ExpandedContext"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


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
    <header className="sticky top-0 z-40 w-full border-b bg-background border-border">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <Link className="flex items-center justify-center" href="#">
            <span className="text-2xl font-extrabold">cavvy.ai</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-6">
          {!user && (
            <>
              <Link href="/features" className="hover:underline underline-offset-4 transition-colors font-extrabold">
                Features
              </Link>
              <Link href="/faq" className="hover:underline underline-offset-4 transition-colors font-extrabold">
                FAQ
              </Link>
              <Link href="/pricing" className="hover:underline underline-offset-4 transition-colors font-extrabold">
                Pricing
              </Link>
            </>
          )}
          {user && (
            <>
              {subscriptionStatus === 'free' && (
                <Link href="/upgrade" className="text-muted-foreground hover:text-foreground transition-colors">
                  Upgrade Plan
                </Link>
              )}
              {(subscriptionStatus === 'pro' || subscriptionStatus === 'enterprise') && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {subscriptionStatus === 'pro' ? 'Pro' : 'Enterprise'} Plan
                  </span>
                </div>
              )}
            </>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => setShowAuthDialog(true)}
              variant="outline"
              className="font-extrabold"
            >
              Sign In
            </Button>
          )}
        </nav>
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