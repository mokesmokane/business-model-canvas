'use client'

import { Interest } from './types/onboarding'
import { Card } from '@/components/ui/card'
import { Book, Briefcase, GraduationCap, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCanvasTypes } from '@/contexts/CanvasTypeContext'

interface InterestSelectorProps {
  onSelect: (interest: Interest) => void
}

export function InterestSelector({ onSelect }: InterestSelectorProps) {
  const { canvasTypes } = useCanvasTypes()

  const interests = [
    {
      id: 'creativity',
      title: 'Creativity',
      description: 'Story development, art planning, and creative projects',
      icon: Sparkles
    },
    {
      id: 'business',
      title: 'Business',
      description: 'Business planning, strategy, and operations',
      icon: Briefcase
    },
    {
      id: 'education',
      title: 'Education',
      description: 'Lesson planning, curriculum development, and learning',
      icon: GraduationCap
    },
    {
      id: 'other',
      title: 'All Canvas Types',
      description: 'Browse our complete collection of canvas frameworks',
      icon: Book
    }
  ]

  const handleSelect = (interest: string) => {
    onSelect(interest as Interest)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {interests.map((interest) => (
        <motion.div
          key={interest.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className="p-6 cursor-pointer hover:bg-muted transition-colors"
            onClick={() => handleSelect(interest.id)}
          >
            <motion.div
              initial={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <interest.icon className="w-12 h-12 mb-4 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">{interest.title}</h3>
            <p className="text-sm text-muted-foreground">{interest.description}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

