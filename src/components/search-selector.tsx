'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// 🧱 Generic type-safe version
interface Option<T extends string> {
  label: string;
  value: T;
}

interface SearchSelectorProps<T extends string> {
  options: Option<T>[];
  placeholder?: string;
  onSelect?: (value: T | '') => void;
  className?: string;
  buttonClassName?: string;
  id?: string;
  disabled?: boolean;
}

export function SearchSelector<T extends string>({
  options,
  placeholder = 'Select option...',
  onSelect,
  className,
  buttonClassName,
  id,
  disabled = false,
}: SearchSelectorProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<T | ''>('');

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (currentValue: T) => {
    const newValue = currentValue === value ? '' : currentValue;
    setValue(newValue);
    onSelect?.(newValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-[200px] justify-between', buttonClassName)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn('w-[200px] p-0', className)}>
        <Command>
          <CommandInput placeholder={`Search...`} className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => handleSelect(opt.value)}
                >
                  {opt.label}
                  <Check
                    className={cn('ml-auto', value === opt.value ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
