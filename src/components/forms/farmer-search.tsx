'use client';

import React, { useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);

  // ✅ Example farmer data
  const farmers = [
    { id: 1, name: 'John Doe', phone: '9876543210', address: 'Green Valley, CA' },
    { id: 2, name: 'Mary Johnson', phone: '9123456789', address: 'Sunrise Farm, TX' },
    { id: 3, name: 'Rajesh Kumar', phone: '9871203456', address: 'Pune, Maharashtra' },
    { id: 4, name: 'Emily Brown', phone: '9988776655', address: 'Maple Grove, WA' },
    { id: 5, name: 'Carlos Rivera', phone: '9090909090', address: 'Hacienda Santa Fe, MX' },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          id="farmer-search"
          className="w-full sm:w-[320px] justify-between h-10 flex-shrink-0"
        >
          {selectedFarmer
            ? farmers.find((f) => f.id === Number(selectedFarmer))?.name
            : 'Select farmer...'}
          <ChevronsUpDown className="opacity-50 h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search by name, mobile, or location..." className="h-9" />
          <CommandList>
            <CommandEmpty>No farmers found.</CommandEmpty>
            <CommandGroup>
              {farmers.map((farmer) => (
                <CommandItem
                  key={farmer.id}
                  onSelect={() => {
                    setSelectedFarmer(String(farmer.id));
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{farmer.name}</span>
                    <span className="text-xs text-muted-foreground">📞 {farmer.phone}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      📍 {farmer.address}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      selectedFarmer === String(farmer.id) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
