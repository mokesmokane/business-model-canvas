import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { LucideIcon } from 'lucide-react'

interface CanvasSectionProps {
  title: string
  icon: LucideIcon
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export function CanvasSection({ title, icon: Icon, value, onChange, placeholder, className }: CanvasSectionProps) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <Textarea
          className="w-full h-full resize-none border-none focus:ring-0"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </CardContent>
    </Card>
  )
} 