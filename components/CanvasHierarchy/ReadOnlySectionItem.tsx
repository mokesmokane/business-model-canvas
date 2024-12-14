import { Card } from '@/components/ui/card'
import { SectionItem as SectionItemType, TextSectionItem } from '@/types/canvas'
import ReactMarkdown from 'react-markdown'

interface ReadOnlySectionItemProps {
  item: SectionItemType
}

export function ReadOnlySectionItem({ item }: ReadOnlySectionItemProps) {
  const textItem = item as TextSectionItem

  return (
    <Card className="mb-2 p-3">
      <div className="text-sm whitespace-pre-wrap">
        <ReactMarkdown>{textItem.content}</ReactMarkdown>
      </div>
    </Card>
  )
} 