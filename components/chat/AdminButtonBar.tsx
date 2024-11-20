import { Button } from '@/components/ui/button'
import { 
  Wand2,
  BrainCircuit,
  MessageSquareQuote,
  ListChecks,
  FileQuestion,
  X
} from 'lucide-react'

const adminTools = [
  { key: 'suggestCanvasTypes', label: 'Suggest Canvas Types', icon: Wand2 },
  { key: 'suggestCanvasLayouts', label: 'Suggest Canvas Layouts', icon: BrainCircuit }
]

interface AdminButtonBarProps {
  activeTool: string | null
  onToolSelect: (tool: string | null) => void
}

export function AdminButtonBar({ activeTool, onToolSelect }: AdminButtonBarProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {adminTools.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 
            border-gray-200 dark:border-gray-700 
            ${key === activeTool
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'text-muted-foreground hover:text-foreground bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          onClick={() => onToolSelect(key)}
        >
          <Icon className="w-4 h-4" />
          {label}
        </Button>
      ))}
      {activeTool && (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
          onClick={() => onToolSelect(null)}
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
      )}
    </div>
  )
} 