import { Button } from '@/components/ui/button'
import { useExpanded } from '@/contexts/ExpandedContext';
import { Lightbulb, HelpCircle, MessageCircle, Search } from 'lucide-react'

const actions = [
  { key: 'suggest', label: 'Suggest', icon: Lightbulb, color: 'text-amber-500 dark:text-amber-400' },
  { key: 'critique', label: 'Critique', icon: MessageCircle, color: 'text-green-500 dark:text-green-400' },
  { key: 'question', label: 'Question', icon: HelpCircle, color: 'text-purple-500 dark:text-purple-400' },
  { key: 'research', label: 'Research', icon: Search, color: 'text-blue-500 dark:text-blue-400' }
]

interface ActionButtonsProps {
  onActionSelect: (action: string) => void;
}

export function ActionButtons({ onActionSelect }: ActionButtonsProps) {
  const { isWide } = useExpanded()
  return (
    <div className={`flex gap-2 px-2 py-2 ${isWide ? 'justify-start' : 'justify-evenly'}`}>
      {actions.map(({ key, label, icon: Icon, color }) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          className={`
            border-gray-200 dark:border-gray-700 
            bg-gray-50 dark:bg-gray-900 
            text-muted-foreground hover:text-foreground
            hover:bg-gray-100 dark:hover:bg-gray-800
            ${isWide ? 'flex gap-2 items-center' : ''}
          `}
          onClick={() => onActionSelect(key)}
        >
          {isWide && <Icon size={16} className={color} />}
          {label}
        </Button>
      ))}
    </div>
  )
} 