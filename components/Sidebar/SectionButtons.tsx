import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Workflow, 
  Gift, 
  Heart, 
  Users2, 
  Truck, 
  Receipt, 
  Coins,
  LucideIcon
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Section } from '@/types/canvas'
import { initialCanvasState } from '@/contexts/CanvasContext'

// Define the section icons mapping
const sectionIcons: Record<string, LucideIcon> = {
  keyPartners: Building2,
  keyActivities: Workflow,
  keyResources: Receipt,
  valuePropositions: Gift,
  customerRelationships: Heart,
  channels: Truck,
  customerSegments: Users2,
  costStructure: Users,
  revenueStreams: Coins,
};

// Type the Map entries and conversion
const sections = Array.from(
  initialCanvasState.sections.entries() as IterableIterator<[string, Section]>
).map(([key, section]) => ({
  icon: sectionIcons[key],
  name: section.name,
  key: key
}));

interface SectionButtonsProps {
  activeSection: string | null;
  onSectionSelect: (section: string | null) => void;
}

export function SectionButtons({ activeSection, onSectionSelect }: SectionButtonsProps) {
  return (
    <div className="flex justify-between px-4 py-2">
      {sections.map(({ icon: Icon, name, key }) => (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 ${
                activeSection === key 
                  ? 'dark:bg-gray-800 dark:text-gray-100 bg-gray-100 text-gray-900' 
                  : 'text-gray-400'
              }`}
              onClick={() => {
                if (activeSection !== key) {
                  onSectionSelect(key)
                  console.log(`Selected section: ${key}`)
                } else {
                  onSectionSelect(null)
                  console.log(`Deselected section: ${key}`)
                }
              }}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-800"
          >
            {name}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
} 