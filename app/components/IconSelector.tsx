'use client';

import { icons } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles } from 'lucide-react';

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
  context?: {
    name?: string;
    description?: string;
    sectionName?: string;
    sectionDescription?: string;
  };
}

interface IconSuggestion {
  iconName: string;
  rationale: string;
}

export default function IconSelector({ value, onChange, context }: IconSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<IconSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const SelectedIcon = value ? icons[value as keyof typeof icons] : null;

  const filteredIcons = Object.entries(icons).filter(([name]) => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  const getSuggestions = async () => {
    setIsLoading(true);
    try {
      // Build context text from available context
      const contextText = [
        context?.name && `Name: ${context.name}`,
        context?.description && `Description: ${context.description}`,
        context?.sectionName && `Section Name: ${context.sectionName}`,
        context?.sectionDescription && `Section Description: ${context.sectionDescription}`,
      ].filter(Boolean).join('\n');

      const response = await fetch('/api/suggest-icons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: contextText }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');

      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to get icon suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start" onClick={() => setIsOpen(true)}>
            {SelectedIcon ? (
              <>
                <SelectedIcon className="h-4 w-4 mr-2" />
                {value}
              </>
            ) : (
              "Select an icon"
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Select an Icon</DialogTitle>
          </DialogHeader> 
          <div className="p-2 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              {context && (
                <Button 
                  variant="outline" 
                  onClick={getSuggestions}
                  disabled={isLoading}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isLoading ? 'Getting suggestions...' : 'Get Suggestions'}
                </Button>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="text-sm font-medium mb-3">Suggested Icons</h3>
                <div className="grid grid-cols-6 gap-4">
                  {suggestions.map(({ iconName, rationale }) => {
                    const Icon = icons[iconName as keyof typeof icons];
                    if (!Icon) return null;

                    return (
                      <Tooltip key={iconName}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex items-center justify-center p-4 h-20 w-20 hover:bg-accent"
                            onClick={() => {
                              onChange(iconName);
                              setSearch('');
                              setIsOpen(false);
                            }}
                          >
                            <Icon className="!h-8 !w-8" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-[200px]">
                            <div className="font-medium">{iconName}</div>
                            <div className="text-xs text-muted-foreground">{rationale}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto">
              {filteredIcons.map(([iconName, Icon]) => (
                <Tooltip key={iconName}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-center p-4 h-20 w-20 hover:bg-accent"
                      onClick={() => {
                        onChange(iconName);
                        setSearch('');
                        setIsOpen(false);
                      }}
                    >
                      <Icon className="!h-8 !w-8" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {iconName}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
} 