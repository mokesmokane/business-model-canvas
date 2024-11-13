'use client'

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export function SubscriptionDetails() {
  const { user } = useAuth()
  const { subscriptionStatus, subscriptionPeriodEnd } = useSubscription()
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (timestamp: number | string) => {
    const timestampNumber = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
    return new Date(timestampNumber * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Billing</h1>
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading || !subscriptionStatus || subscriptionStatus === 'free'}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                {subscriptionStatus === 'pro' ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                )}
                <div>
                  <h3 className="font-medium">
                    {subscriptionStatus === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </h3>
                  {subscriptionPeriodEnd && subscriptionStatus === 'pro' && (
                    <p className="text-sm text-muted-foreground">
                      Your subscription renews on {subscriptionPeriodEnd.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {subscriptionStatus !== 'pro' && (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Upgrade to Pro to unlock all features
                  </p>
                  <Link href="/upgrade">
                    <Button>
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {subscriptionStatus === 'pro' && (
            <Card>
              <CardHeader>
                <CardTitle>Pro Plan Features</CardTitle>
                <CardDescription>
                  Your current plan includes:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Unlimited Canvases
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Advanced AI Features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Team Collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority Support
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 