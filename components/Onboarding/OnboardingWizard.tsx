'use client'

import { useState } from 'react'
import { Interest, OnboardingState } from './types/onboarding'
import { InterestSelector } from './InterestSelector'
import { CanvasRecommendations } from './CanvasRecommendations'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function OnboardingWizard() {
  const [state, setState] = useState<OnboardingState>({
    interest: null,
    completed: false
  })

  const handleInterestSelect = (interest: Interest) => {
    setState({ ...state, interest })
  }

  const handleComplete = () => {
    setState({ ...state, completed: true })
    // You might want to store this in your backend or localStorage
    window.localStorage.setItem('onboarding_completed', 'true')
    window.location.href = '/dashboard'
  }

  const handleBack = () => {
    setState({ ...state, interest: null })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to Cavvy.ai
          </h1>
          <p className="text-xl text-muted-foreground">
            Let&apos;s help you find the perfect canvas framework for your needs
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!state.interest ? (
            <motion.div
              key="interest-selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-center mb-8">
                  What brings you to Cavvy today?
                </h2>
                <InterestSelector onSelect={handleInterestSelect} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="canvas-recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="absolute top-0 left-0"
              >
              </motion.div>
              <CanvasRecommendations
                interest={state.interest}
                onComplete={handleComplete}
                onBack={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

