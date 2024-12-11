'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import DynamicIcon from "../Util/DynamicIcon"
import { CanvasType } from "@/types/canvas-sections"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SelectedCanvasTypeCardProps {
  type: CanvasType
  className?: string
  compact?: boolean
}

export function SelectedCanvasTypeCard({ type, className, compact = false }: SelectedCanvasTypeCardProps) {
  return (
    <Card className={cn("w-full max-w-[600px] bg-card", className)}>
      <CardHeader className={cn(compact ? "p-4" : "")}>
        <div className={cn("flex items-center gap-3", compact ? "mb-2" : "mb-4")}>
          <div className={cn("rounded-md bg-primary/10", compact ? "p-2" : "p-2.5")}>
            <DynamicIcon name={type.icon} className={cn("text-primary", compact ? "h-6 w-6" : "h-8 w-8")} />
          </div>
          <div>
            <CardTitle className={cn(compact ? "text-lg mb-0.5" : "text-2xl mb-1")}>{type.name}</CardTitle>
            <CardDescription className={cn(compact ? "text-sm" : "text-base")}>
              {type.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn(compact ? "p-4 pt-0" : "")}>
        <div
          className="w-full"
          style={{
            display: 'grid',
            gridTemplateColumns: type.defaultLayout?.layout.gridTemplate.columns || 'repeat(2, 1fr)',
            gridTemplateRows: type.defaultLayout?.layout.gridTemplate.rows || 'repeat(2, 1fr)',
            gap: compact ? '0.5rem' : '0.75rem',
          }}
        >
          {type.sections.map((section, index) => {
            let gridArea;
            if (type.defaultLayout?.layout.areas?.[index]) {
              const [row, col, rowSpan, colSpan] = type.defaultLayout.layout.areas[index].split('/').map(n => n.trim());
              gridArea = `${row} / ${col} / ${rowSpan} / ${colSpan}`;
            } else {
              const row = Math.floor(index / 2) + 1;
              const col = (index % 2) + 1;
              gridArea = `${row} / ${col} / ${row + 1} / ${col + 1}`;
            }
            
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex flex-col gap-1 rounded-md border bg-card/50 cursor-default",
                        compact ? "p-2" : "p-3"
                      )}
                      style={{ gridArea }}
                    >
                      <div className="flex items-center gap-2">
                        <DynamicIcon 
                          name={section.icon} 
                          className={cn("text-primary", compact ? "w-3.5 h-3.5" : "w-4 h-4")}
                        />
                        <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
                          {section.name}
                        </span>
                      </div>
                      <p className={cn(
                        "text-muted-foreground line-clamp-2",
                        compact ? "text-[11px] leading-tight" : "text-xs"
                      )}>
                        {section.placeholder}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-[300px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <DynamicIcon name={section.icon} className="w-4 h-4 text-primary" />
                        <span className="font-medium">{section.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {section.placeholder}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
} 