'use client'
 
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "next-themes"
import { SiteHeader } from "@/components/site/SiteHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { Bell, Moon, Sun, Palette, Shield, CreditCard } from "lucide-react"
import Link from "next/link"
import { Providers } from "@/components/providers/Providers"
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav"
import { useIsMobile } from "@/hooks/useIsMobile"
import { CanvasFoldersProvider } from "@/contexts/CanvasFoldersContext"
import { MobileHeader } from "@/components/mobile/MobileHeader"
 
 export default function SettingsPage() {
  const { user, userData } = useAuth()
  const { theme, setTheme } = useTheme()
  const { subscriptionStatus } = useSubscription()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const isMobile = useIsMobile()

  const handleNotificationChange = async (checked: boolean) => {
    setEmailNotifications(checked)
    // Add notification settings update logic here
  }

  return (
    <CanvasFoldersProvider>
      <div className="min-h-screen bg-background">
        {isMobile ? <MobileHeader /> : <SiteHeader />}
        <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="general" className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Settings</h1>
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Theme</Label>
                      <div className="text-sm text-muted-foreground">
                        Choose your preferred theme
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTheme('light')}
                        className={theme === 'light' ? 'border-primary' : ''}
                      >
                        <Sun className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTheme('dark')}
                        className={theme === 'dark' ? 'border-primary' : ''}
                      >
                        <Moon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Notifications</Label>
                      <div className="text-sm text-muted-foreground">
                        Receive updates and notifications via email
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={handleNotificationChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Subscription</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Current Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        {subscriptionStatus === 'pro' ? 'Pro Plan' : 'Free Plan'}
                      </p>
                    </div>
                    {subscriptionStatus !== 'pro' && (
                      <Link href="/pricing">
                        <Button>Upgrade to Pro</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Link href="/reset-password">
                      <Button variant="outline" className="w-full">
                        Change Password
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {success && <p className="mt-4 text-sm text-green-500">{success}</p>}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>
        </div>
        {isMobile && <MobileBottomNav />}
      </div>
    </CanvasFoldersProvider>
  )
}
