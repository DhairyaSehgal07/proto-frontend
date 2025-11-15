'use client';
import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useEnterNavigation } from '@/hooks/use-enter-navigation';

interface QuantityInputSectionProps {
  onLastFieldEnter?: () => void;
  // For use in variety-entry component
  quantities?: Record<string, string>;
  customMarka?: Record<string, string>;
  onQuantityChange?: (size: string, quantity: string) => void;
  onCustomMarkaChange?: (size: string, customMarka: string) => void;
  varietyId?: string;
  sizes?: string[]; // Sizes array passed from parent
  disabled?: boolean;
  showCustomMarka?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inline?: boolean; // If true, don't render Card wrapper (for use inside another Card)
}

export function QuantityInputSection({
  onLastFieldEnter,
  quantities,
  customMarka,
  onQuantityChange,
  onCustomMarkaChange,
  varietyId,
  sizes = [],
  disabled = false,
  showCustomMarka = false,
  containerRef: externalContainerRef,
  onKeyDown: externalOnKeyDown,
  inline = false,
}: QuantityInputSectionProps) {
  // Create a ref with the correct type for the Card component
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef =
    externalContainerRef || (internalContainerRef as React.RefObject<HTMLElement>);

  // Initialize the hook with the container ref (only if not provided externally)
  const { onKeyDown: internalOnKeyDown } = useEnterNavigation({
    containerRef: containerRef,
    onLastFieldEnter: () => {
      // Handle when all quantities are entered
      if (onLastFieldEnter) {
        onLastFieldEnter();
      }
    },
  });

  const handleKeyDown = externalOnKeyDown || internalOnKeyDown;

  // If used as a standalone component (no callbacks provided)
  const isStandalone = !onQuantityChange && !onCustomMarkaChange;

  const content = (
    <div className="space-y-6">
      {sizes.map((size, index) => (
        <div key={size} className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-base font-medium min-w-[80px]">{size}</Label>
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Input
                placeholder="Quantity"
                value={quantities?.[size] || ''}
                onChange={(e) => onQuantityChange?.(size, e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-10"
                data-variety-id={varietyId}
                data-size={size}
                data-type="quantity"
                disabled={disabled}
              />
              {showCustomMarka && (
                <Input
                  placeholder="Custom Marka"
                  value={customMarka?.[size] || ''}
                  onChange={(e) => onCustomMarkaChange?.(size, e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-10"
                  data-variety-id={varietyId}
                  data-size={size}
                  data-type="customMarka"
                  disabled={disabled}
                />
              )}
            </div>
          </div>
          {index < sizes.length - 1 && <Separator className="mt-2" />}
        </div>
      ))}
    </div>
  );

  if (inline) {
    return <div ref={internalContainerRef}>{content}</div>;
  }

  return (
    <Card ref={internalContainerRef}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Enter Quantities</CardTitle>
        <CardDescription className="mt-1.5">
          {isStandalone
            ? 'Please select a variety first to enter quantities'
            : 'Enter quantities for each bag size'}
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
