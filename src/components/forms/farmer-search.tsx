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

import { useGetAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';

export const FarmerSearch = () => {
  const [open, setOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);

  const farmersQuery = useGetAllFarmers();

  // Actual farmer data from API
  const farmers = farmersQuery.data?.data ?? [];

  const loading = farmersQuery.isLoading;
  const isEmpty = !loading && farmers.length === 0;

  const selectedFarmerName =
    farmers.find((f) => f.id === selectedFarmer)?.name ?? 'Select farmer...';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          id="farmer-search"
          className="w-full sm:w-[320px] justify-between h-10 flex-shrink-0"
        >
          {selectedFarmer ? selectedFarmerName : 'Select farmer...'}
          <ChevronsUpDown className="opacity-50 h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search by name, mobile, or address..." className="h-9" />

          <CommandList>
            {loading && (
              <CommandEmpty>
                <span className="text-xs text-muted-foreground">Loading farmers...</span>
              </CommandEmpty>
            )}

            {isEmpty && (
              <CommandEmpty>
                <span className="text-xs text-muted-foreground">No farmers found.</span>
              </CommandEmpty>
            )}

            {!loading && farmers.length > 0 && (
              <CommandGroup>
                {farmers.map((farmer) => (
                  <CommandItem
                    key={farmer.id}
                    onSelect={() => {
                      setSelectedFarmer(farmer.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{farmer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        📞 {farmer.mobileNumber}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        📍 {farmer.address}
                      </span>
                    </div>

                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        selectedFarmer === farmer.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
