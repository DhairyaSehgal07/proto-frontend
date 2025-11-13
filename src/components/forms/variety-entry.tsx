'use client';

import React, { useRef } from 'react';
import { VarietySelector } from './variety-selector';
import { QuantityInputSection } from './quantity-input';
import { LocationInputSection } from './location-input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useEnterNavigation } from '@/hooks/use-enter-navigation';
import { X } from 'lucide-react';

interface VarietyEntryProps {
  index: number;
  varietyId: string;
  variety: string;
  onRemove: (id: string) => void;
  onVarietyChange: (id: string, variety: string) => void;
  onQuantityChange: (id: string, size: string, quantity: string) => void;
  onCustomMarkaChange: (id: string, size: string, customMarka: string) => void;
  onLocationChange: (
    id: string,
    size: string,
    field: 'chamber' | 'floor' | 'row',
    value: string
  ) => void;
  quantities: Record<string, string>;
  customMarka: Record<string, string>;
  locations: Record<string, { chamber: string; floor: string; row: string }>;
  onLastFieldEnter?: () => void;
  canRemove: boolean;
  disabled?: boolean;
}

export function VarietyEntry({
  index,
  varietyId,
  variety, // Reserved for future use (controlled component)
  onRemove,
  onVarietyChange,
  onQuantityChange,
  onCustomMarkaChange,
  onLocationChange,
  quantities,
  customMarka,
  locations,
  onLastFieldEnter,
  canRemove,
  disabled = false,
}: VarietyEntryProps) {
  // Suppress unused variable warning - variety is reserved for future controlled component use
  void variety;
  const containerRef = useRef<HTMLDivElement>(null);

  const { onKeyDown } = useEnterNavigation({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    onLastFieldEnter: () => {
      if (onLastFieldEnter) {
        onLastFieldEnter();
      }
    },
  });

  // Handle variety selection from the selector
  const handleVarietySelect = (value: string) => {
    onVarietyChange(varietyId, value);
  };

  // Wrapper functions to match the component's callback signature
  const handleQuantityChange = (size: string, quantity: string) => {
    onQuantityChange(varietyId, size, quantity);
  };

  const handleCustomMarkaChange = (size: string, customMarka: string) => {
    onCustomMarkaChange(varietyId, size, customMarka);
  };

  const handleLocationChange = (
    size: string,
    field: 'chamber' | 'floor' | 'row',
    value: string
  ) => {
    onLocationChange(varietyId, size, field, value);
  };

  return (
    <Card ref={containerRef} className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Variety {index + 1}</CardTitle>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(varietyId)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Variety Selector */}
        <div className="space-y-3">
          <VarietySelector
            id={`variety-selector-${varietyId}`}
            onSelect={handleVarietySelect}
            disabled={disabled}
          />
        </div>

        {/* Quantity Inputs */}
        <div className="space-y-6">
          <Label className="text-base font-medium mb-3 block">Enter Quantities</Label>
          <QuantityInputSection
            quantities={quantities}
            customMarka={customMarka}
            onQuantityChange={handleQuantityChange}
            onCustomMarkaChange={handleCustomMarkaChange}
            varietyId={varietyId}
            disabled={disabled}
            showCustomMarka={true}
            inline={true}
            containerRef={containerRef as React.RefObject<HTMLElement>}
            onKeyDown={onKeyDown}
          />
        </div>

        {/* Location Inputs */}
        <div className="mt-16">
          <Label className="text-base font-medium mb-3 block">Enter Locations</Label>
          <LocationInputSection
            locations={locations}
            onLocationChange={handleLocationChange}
            varietyId={varietyId}
            disabled={disabled}
            showApplyToAll={true}
            inline={true}
            containerRef={containerRef as React.RefObject<HTMLElement>}
            onKeyDown={onKeyDown}
          />
        </div>
      </CardContent>
    </Card>
  );
}
