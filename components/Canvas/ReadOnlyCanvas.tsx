import { Section, SectionItem, TextSectionItem } from '@/types/canvas'
import { CanvasType } from '@/types/canvas-sections'
import { CSSProperties } from 'react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import { LucideIcon, LucideProps } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Canvas } from '@/types/canvas'

interface ReadOnlyCanvasProps {
  sections: Map<string, Section>
  canvasType: CanvasType
  canvasLayout: {
    gridTemplate: {
      columns: string
      rows: string
    }
    areas: string[]
  }
  title: string
  description?: string
  name: string
  designedFor: string
  designedBy: string
  date: string
  version: string
}

type IconType = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>

interface ReadOnlyHeaderProps {
  title: string;
  description?: string;
  name: string;
  designedFor: string;
  designedBy: string;
  date: string;
  version: string;
  canvasTheme?: 'light' | 'dark';
}

function ReadOnlyHeader({ title, description, name, designedFor, designedBy, date, version, canvasTheme = 'light' }: ReadOnlyHeaderProps) {
  return (
    <div className={`flex items-center justify-between p-4 border-b ${
      canvasTheme === 'light' 
        ? 'bg-white border-gray-200 text-black'
        : 'bg-gray-950 border-gray-800 text-white'
    }`}>
      <div className="flex items-center gap-4">
        <h1 className={`text-3xl font-bold tracking-tight ${
          canvasTheme === 'light' ? 'text-black' : 'text-white'
        }`}>
          {title}
        </h1>
        <div className="flex items-center gap-2">
          <Input 
            value={name}
            className={`max-w-[200px] ${
              canvasTheme === 'light' ? 'text-black' : 'text-white'
            }`}
            readOnly
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Input
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="text"
          placeholder="Designed For"
          value={designedFor}
          readOnly
        />
        <Input
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="text"
          placeholder="Designed By"
          value={designedBy}
          readOnly
        />
        <Input
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="date"
          placeholder="Date"
          value={date}
          readOnly
        />
        <Input
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="text"
          placeholder="Version"
          value={version}
          readOnly
        />
      </div>
    </div>
  )
}

function ReadOnlySection({ 
  title, 
  items,
  config
}: { 
  title: string
  items: SectionItem[]
  config?: {
    name: string
    icon: IconType
    color?: string
  }
}) {
  const Icon = config?.icon

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        {Icon && (
          <div className={cn(
            "rounded p-1",
            config.color || "bg-muted"
          )}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <h3 className="font-semibold text-card-foreground">{title}</h3>
      </div>
      <div className="flex-1 space-y-2">
        {items.map((item, index) => {
          if (item instanceof TextSectionItem) {
            return (
              <div 
                key={index} 
            className="rounded-md border border-border bg-background p-2 text-sm text-foreground whitespace-pre-wrap"
              >
                {item.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < item.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
            </div>
            )
          }
        })}
      </div>
    </div>
  )
}

function ReadOnlyContent({ sections, canvasType, canvasLayout }: ReadOnlyCanvasProps) {
  const sortedSections = Array.from(sections.entries())
    .map(([key, section]) => ({
      key,
      section,
      config: canvasType.sections.find(s => s.name === key)
    }))
    .sort((a, b) => (a.section.gridIndex || 0) - (b.section.gridIndex || 0))

  const containerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: canvasLayout.gridTemplate.columns,
    gridTemplateRows: canvasLayout.gridTemplate.rows,
    gap: '1rem',
    padding: '1rem',
    height: 'calc(100vh - 64px)',
    width: '100%',
  }

  return (
    <div className="relative flex-1 overflow-auto w-full">
      <div className="h-full">
        <div style={containerStyle}>
          {sortedSections.map((item, index) => {
            const Icon = item.config?.icon ? Icons[item.config.icon as keyof typeof Icons] : undefined
            
            return (
              <div
                key={item.key}
                style={{ gridArea: canvasLayout.areas[index] }}
              >
                <ReadOnlySection
                  title={item.config?.name || ''}
                  items={item.section.sectionItems}
                  config={Icon && {
                    name: item.config!.name,
                    icon: Icon as IconType
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ReadOnlyCanvas({ sections, canvasType, canvasLayout, title, description, name, designedFor, designedBy, date, version }: ReadOnlyCanvasProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background min-h-screen">
      <ReadOnlyHeader title={title} description={description} name={name} designedFor={designedFor} designedBy={designedBy} date={date} version={version} />
      <ReadOnlyContent 
        sections={sections}
        canvasType={canvasType}
        canvasLayout={canvasLayout}
        title={title}
        description={description}
        name={name}
        designedFor={designedFor}
        designedBy={designedBy}
        date={date}
        version={version}
      />
    </div>
  )
} 