'use client';

import React from 'react';
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

export const FarmerSearch = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          id="farmer-search"
          className="w-full sm:w-[320px] justify-between h-10 flex-shrink-0"
        >
          Select farmer...
          <ChevronsUpDown className="opacity-50 h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search by name, mobile, or location..." className="h-9" />
          <CommandList>
            <CommandEmpty>No farmers found.</CommandEmpty>
            <CommandGroup>
              <CommandItem>
                <div className="flex flex-col">
                  <span className="font-medium">Farmer Name</span>
                  <span className="text-xs text-muted-foreground">📞 1234567890</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    📍 Farmer Address
                  </span>
                </div>
                <Check className={cn('ml-auto opacity-0')} />
              </CommandItem>

              <CommandItem>
                <div className="flex flex-col">
                  <span className="font-medium">Another Farmer</span>
                  <span className="text-xs text-muted-foreground">📞 9876543210</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    📍 Another Address
                  </span>
                </div>
                <Check className={cn('ml-auto opacity-0')} />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
