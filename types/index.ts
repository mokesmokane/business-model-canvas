import { LucideIcon } from 'lucide-react'

export interface FormData {
  designedFor: string
  designedBy: string
  date: string
  version: string
}

export interface CanvasSectionProps {
  title: string
  icon: LucideIcon
  placeholder: string
}

export interface SidebarProps {
  isExpanded: boolean
  onToggle: () => void
}

export interface SidebarFooterProps {
  isExpanded: boolean
}

export interface HeaderProps {
  formData: FormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
} 