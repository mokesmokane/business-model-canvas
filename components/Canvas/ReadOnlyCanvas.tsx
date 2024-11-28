import { Section } from '@/types/canvas'
import { CanvasType } from '@/types/canvas-sections'
import { CSSProperties } from 'react'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import { LucideIcon, LucideProps } from 'lucide-react'

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
}

type IconType = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>

function ReadOnlyHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border px-4 py-2">
      <div className="flex items-center gap-2">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
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
  items: string[]
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
        {items.map((item, index) => (
          <div 
            key={index} 
            className="rounded-md border border-border bg-background p-2 text-sm text-foreground whitespace-pre-wrap"
          >
            {item.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < item.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ReadOnlyContent({ sections, canvasType, canvasLayout }: Omit<ReadOnlyCanvasProps, 'title' | 'description'>) {
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
                  items={item.section.items}
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

export function ReadOnlyCanvas({ sections, canvasType, canvasLayout, title, description }: ReadOnlyCanvasProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background min-h-screen">
      <ReadOnlyHeader title={title} description={description} />
      <ReadOnlyContent 
        sections={sections}
        canvasType={canvasType}
        canvasLayout={canvasLayout}
      />
    </div>
  )
} 