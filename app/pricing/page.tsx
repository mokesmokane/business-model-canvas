import { SiteHeader } from "@/components/site/SiteHeader"
import { useState } from "react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-900"> 
    <SiteHeader />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Pricing Plans</h1>
          <p className="text-gray-400">Choose the perfect plan for your needs</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Free</h3>
            <p className="text-3xl font-bold text-white mb-6">£0<span className="text-gray-400 text-base font-normal">/month</span></p>
            <ul className="space-y-4 mb-8">
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                1 Business Model Canvas
              </li>
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                Basic AI Assistance
              </li>
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                Export to PDF
              </li>
            </ul>
            <button className="w-full py-2 px-4 border border-gray-600 rounded-md text-white hover:bg-gray-700 transition">
              Sign Up
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gray-800 rounded-lg p-8 border border-blue-500 relative transform scale-105">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-sm py-1 px-3 rounded-bl-lg rounded-tr-lg">
              Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Pro</h3>
            <p className="text-3xl font-bold text-white mb-6">£10<span className="text-gray-400 text-base font-normal">/month</span></p>
            <ul className="space-y-4 mb-8">
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                Unlimited Canvases
              </li>
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                Advanced AI Features
              </li>
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                Team Collaboration
              </li>
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                Priority Support
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-blue-500 rounded-md text-white hover:bg-blue-600 transition">
              Sign Up
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Enterprise</h3>
            <p className="text-3xl font-bold text-white mb-6">£100<span className="text-gray-400 text-base font-normal">/month</span></p>
            <ul className="space-y-4 mb-8">
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                Everything in Pro
              </li>
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                Custom AI Training
              </li>
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                Dedicated Support
              </li>
              <li className="text-gray-300 flex items-center">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                SLA Guarantee
              </li>
            </ul>
            <button className="w-full py-2 px-4 border border-gray-600 rounded-md text-white hover:bg-gray-700 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
} 