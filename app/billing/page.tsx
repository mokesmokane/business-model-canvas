'use client'

import { SiteHeader } from "@/components/site/SiteHeader"
import { SubscriptionDetails } from "./components/SubscriptionDetails"
import { SubscriptionProvider } from "@/contexts/SubscriptionContext"

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <SubscriptionProvider>
        <SubscriptionDetails />
      </SubscriptionProvider>
    </div>
  )
} 