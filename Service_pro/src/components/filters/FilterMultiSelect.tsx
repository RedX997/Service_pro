import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface FilterMultiSelectProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
}

export function FilterMultiSelect({ label, value, onChange, options }: FilterMultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleRemove = (option: string) => {
    onChange(value.filter(v => v !== option));
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-9 font-normal"
          >
            {value.length > 0 ? `${value.length} selected` : 'Select services...'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="max-h-[200px] overflow-y-auto">
            {options.map((option) => (
              <div
                key={option}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded hover:bg-muted",
                  value.includes(option) && "bg-muted"
                )}
                onClick={() => handleToggle(option)}
              >
                <div className={cn(
                  "h-4 w-4 border rounded flex items-center justify-center",
                  value.includes(option) && "bg-primary border-primary"
                )}>
                  {value.includes(option) && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span>{option}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((option) => (
            <Badge key={option} variant="secondary" className="text-xs">
              {option}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(option);
                }}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';
