import { Button } from "@/components/ui/button"
import { CreditCard, LogOut, Menu, Settings, User } from "lucide-react"
import Link from 'next/link'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import { MobileDrawer } from "./MobileDrawer"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import { SubscriptionBadge } from "../subscription/SubscriptionBadge"
import { SubscriptionProvider } from "@/contexts/SubscriptionContext"
import { useState } from "react"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'


export function MobileHeader() {
  const { user, logout } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    try {   
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {user && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 [&_button[data-state=open]]:hidden">
                <VisuallyHidden asChild>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <MobileDrawer onClose={() => setIsOpen(false)} />
              </SheetContent>
            </Sheet>
          )}
          <Link className="flex items-center justify-center" href="#">
            <span className="text-2xl font-extrabold text-foreground">cavvy.ai</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {!user && (
            <>
              <Link href="/features" className="text-sm font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium">
                Pricing
              </Link>
            </>
          )}
          {user && (
            <SubscriptionProvider>
              <SubscriptionBadge />
            </SubscriptionProvider>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full hover:bg-muted-foreground/10"
                >
                  <div className="absolute inset-0 rounded-full bg-muted flex items-center justify-center">
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
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
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
    </header>
  )
} 