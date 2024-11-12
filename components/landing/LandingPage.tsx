import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Building2, Users2, Sparkles, ArrowRight, Check } from "lucide-react"
import { SiteHeader } from "../site/SiteHeader"
import { useState } from "react"
import { AuthDialog } from "@/components/auth/AuthDialog"

export default function LandingPage() {
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Build Your Business Model Canvas with AI
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Create, iterate, and perfect your business model with intelligent AI assistance. Get suggestions,
                    insights, and real-time feedback.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <form className="flex-1 space-y-2" onSubmit={(e) => {
                    e.preventDefault()
                    setShowAuthDialog(true)
                  }}>
                    <Input placeholder="Enter your email" type="email" />
                    <Button type="submit" className="w-full">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid gap-4 lg:gap-8 w-full">
                  <div className="flex items-center gap-4 rounded-lg border p-4 dark:border-gray-800">
                    <Bot className="h-6 w-6" />
                    <div className="space-y-1">
                      <h3 className="font-medium">AI Assistant</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get intelligent suggestions for each section of your canvas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4 dark:border-gray-800">
                    <Building2 className="h-6 w-6" />
                    <div className="space-y-1">
                      <h3 className="font-medium">Business Model Canvas</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Industry-standard 9-block canvas with real-time collaboration
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4 dark:border-gray-800">
                    <Users2 className="h-6 w-6" />
                    <div className="space-y-1">
                      <h3 className="font-medium">Team Collaboration</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Work together with your team in real-time
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="max-w-[900px] mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Features</h2>
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Everything you need to create and perfect your business model
              </p>
            </div>
            <div className="grid max-w-5xl mx-auto items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center justify-center space-y-4">
                <Sparkles className="h-12 w-12" />
                <h3 className="text-xl font-bold">AI-Powered Insights</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Get intelligent suggestions and feedback for each section of your canvas
                </p>
                <ul className="grid gap-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Smart suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Real-time feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Industry insights
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center text-center justify-center space-y-4">
                <Building2 className="h-12 w-12" />
                <h3 className="text-xl font-bold">Business Model Canvas</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Industry-standard 9-block canvas with powerful editing features
                </p>
                <ul className="grid gap-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> 9-block layout
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Rich text editing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Export options
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center text-center justify-center space-y-4">
                <Users2 className="h-12 w-12" />
                <h3 className="text-xl font-bold">Team Collaboration</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Work together with your team in real-time on your business model
                </p>
                <ul className="grid gap-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Real-time editing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Comments & feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Version history
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="max-w-[900px] mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Pricing</h2>
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Choose the perfect plan for your needs
              </p>
            </div>
            <div className="grid max-w-5xl mx-auto gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-between rounded-lg border p-6 dark:border-gray-800">
                <div>
                  <h3 className="text-xl font-bold">Free</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Get started with the basics</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">£0</span>
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                  <ul className="mt-4 grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> 1 Business Model Canvas
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Basic AI Assistance
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Export to PDF
                    </li>
                  </ul>
                </div>
                <Button className="mt-6" variant="outline">
                  Get Started
                </Button>
              </div>
              <div className="relative flex flex-col justify-between rounded-lg border p-6 dark:border-gray-800">
                <div className="absolute -top-2 right-0 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                  Popular
                </div>
                <div>
                  <h3 className="text-xl font-bold">Pro</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Perfect for growing businesses</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">£10</span>
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                  <ul className="mt-4 grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Unlimited Canvases
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Advanced AI Features
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Team Collaboration
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Priority Support
                    </li>
                  </ul>
                </div>
                <Button className="mt-6">Get Started</Button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border p-6 dark:border-gray-800">
                <div>
                  <h3 className="text-xl font-bold">Enterprise</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">For large organizations</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">£100</span>
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                  <ul className="mt-4 grid gap-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Everything in Pro
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Custom AI Training
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Dedicated Support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> SLA Guarantee
                    </li>
                  </ul>
                </div>
                <Button className="mt-6" variant="outline">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 cavvy.ai. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
      <AuthDialog 
        isOpen={showAuthDialog}
        openSignUp={true}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={() => setShowAuthDialog(false)}
      />
    </div>
  )
}