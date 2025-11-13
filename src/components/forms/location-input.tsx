'use client';
import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store';
import { useEnterNavigation } from '@/hooks/use-enter-navigation';

export function LocationInputSection() {
  const { coldStorage } = useStore();
  const sizes = coldStorage?.preferences?.bagSizes || [];

  // Create a ref with the correct type for the Card component
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize enter navigation hook
  const { onKeyDown } = useEnterNavigation({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    onLastFieldEnter: () => {
      // Handle when all location fields are completed
    },
  });

  return (
    <Card ref={containerRef}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Enter Locations</CardTitle>
        <CardDescription className="mt-1.5">
          Please enter location details for each bag size
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {sizes.map((size, index) => (
            <div key={size} className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-base font-medium min-w-[80px]">{size}</Label>
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <Input placeholder="Chamber" className="h-10 flex-1" onKeyDown={onKeyDown} />
                  <Input placeholder="Floor" className="h-10 flex-1" onKeyDown={onKeyDown} />
                  <Input placeholder="Row" className="h-10 flex-1" onKeyDown={onKeyDown} />
                </div>
              </div>

              {index < sizes.length - 1 && <Separator className="mt-2" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
