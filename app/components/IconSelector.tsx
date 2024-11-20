'use client';

import { icons } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function IconSelector({ value, onChange }: IconSelectorProps) {
  const [search, setSearch] = useState('');
  const SelectedIcon = value ? icons[value as keyof typeof icons] : null;

  const filteredIcons = Object.entries(icons).filter(([name]) => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TooltipProvider>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
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
        <div className="p-2">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
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