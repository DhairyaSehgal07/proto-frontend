'use client';
import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store';
import { useEnterNavigation } from '@/hooks/use-enter-navigation';

export function QuantityInputSection() {
  const { coldStorage } = useStore();
  const sizes = coldStorage?.preferences?.bagSizes || [];

  // Create a ref with the correct type for the Card component
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize the hook with the container ref
  const { onKeyDown } = useEnterNavigation({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    onLastFieldEnter: () => {
      // Handle when all quantities are entered
    },
  });

  return (
    <Card ref={containerRef}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Enter Quantities</CardTitle>
        <CardDescription className="mt-1.5">
          Please select a variety first to enter quantities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sizes.map((size, index) => (
            <div key={size} className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-base font-medium min-w-[80px]">{size}</Label>
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <Input placeholder="Quantity" onKeyDown={onKeyDown} className="h-10" />
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
