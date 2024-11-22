'use client'

import { SiteHeader } from "@/components/site/SiteHeader"
import { SubscriptionDetails } from "./components/SubscriptionDetails"
import { SubscriptionProvider } from "@/contexts/SubscriptionContext"
import { Providers } from "@/components/providers/Providers"

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Providers>
        <SiteHeader />
        <SubscriptionProvider>
          <SubscriptionDetails />
        </SubscriptionProvider>
      </Providers>
    </div>
  )
} 