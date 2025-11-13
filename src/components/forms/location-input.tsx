'use client';
import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { useEnterNavigation } from '@/hooks/use-enter-navigation';

interface LocationInputSectionProps {
  onLastFieldEnter?: () => void;
  // For use in variety-entry component
  locations?: Record<string, { chamber: string; floor: string; row: string }>;
  onLocationChange?: (size: string, field: 'chamber' | 'floor' | 'row', value: string) => void;
  varietyId?: string;
  disabled?: boolean;
  showApplyToAll?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inline?: boolean; // If true, don't render Card wrapper (for use inside another Card)
}

interface LocationValues {
  chamber: string;
  floor: string;
  row: string;
}

export function LocationInputSection({
  onLastFieldEnter,
  locations: externalLocations,
  onLocationChange,
  varietyId,
  disabled = false,
  showApplyToAll = true,
  containerRef: externalContainerRef,
  onKeyDown: externalOnKeyDown,
  inline = false,
}: LocationInputSectionProps) {
  const { coldStorage } = useStore();
  const sizes = coldStorage?.preferences?.bagSizes || [];

  // State to track location values for each bag size (only for standalone use)
  const [internalLocationValues, setInternalLocationValues] = useState<
    Record<string, LocationValues>
  >(() => {
    const initial: Record<string, LocationValues> = {};
    sizes.forEach((size) => {
      initial[size] = { chamber: '', floor: '', row: '' };
    });
    return initial;
  });

  // Use external locations if provided, otherwise use internal state
  const locationValues = externalLocations || internalLocationValues;

  // Create a ref with the correct type for the Card component
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef =
    externalContainerRef || (internalContainerRef as React.RefObject<HTMLElement>);

  // Initialize enter navigation hook (only if not provided externally)
  const { onKeyDown: internalOnKeyDown } = useEnterNavigation({
    containerRef: containerRef,
    onLastFieldEnter: () => {
      // Focus on remarks field when all location fields are completed
      if (onLastFieldEnter) {
        onLastFieldEnter();
      }
    },
  });

  const handleKeyDown = externalOnKeyDown || internalOnKeyDown;

  // Check if first bag size is completely filled (for Apply to All button)
  const firstSize = sizes[0];
  const firstSizeValues = firstSize
    ? locationValues[firstSize]
    : { chamber: '', floor: '', row: '' };
  const isApplyToAllEnabled =
    showApplyToAll &&
    firstSize &&
    firstSizeValues.chamber.trim() !== '' &&
    firstSizeValues.floor.trim() !== '' &&
    firstSizeValues.row.trim() !== '';

  // Handle input change
  const handleInputChange = (size: string, field: 'chamber' | 'floor' | 'row', value: string) => {
    if (onLocationChange) {
      // Use external callback if provided
      onLocationChange(size, field, value);
    } else {
      // Use internal state for standalone use
      setInternalLocationValues((prev) => ({
        ...prev,
        [size]: {
          ...prev[size],
          [field]: value,
        },
      }));
    }
  };

  // Handle apply to all
  const handleApplyToAll = () => {
    if (!firstSize || !isApplyToAllEnabled) return;

    const firstValues = locationValues[firstSize];

    if (onLocationChange) {
      // Controlled mode: call onLocationChange for all sizes
      sizes.forEach((size) => {
        onLocationChange(size, 'chamber', firstValues.chamber);
        onLocationChange(size, 'floor', firstValues.floor);
        onLocationChange(size, 'row', firstValues.row);
      });
    } else {
      // Standalone mode: update internal state
      const updatedValues: Record<string, LocationValues> = {};

      sizes.forEach((size) => {
        updatedValues[size] = {
          chamber: firstValues.chamber,
          floor: firstValues.floor,
          row: firstValues.row,
        };
      });

      setInternalLocationValues(updatedValues);
    }
  };

  // If used as a standalone component (no callbacks provided)
  const isStandalone = !onLocationChange;

  const content = (
    <div className="space-y-6">
      {sizes.map((size, index) => (
        <div key={size} className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-base font-medium min-w-[80px]">{size}</Label>
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Input
                id={index === 0 && isStandalone && !inline ? 'first-location-chamber' : undefined}
                data-location-input="chamber"
                data-size={size}
                data-variety-id={varietyId}
                placeholder="Chamber"
                className="h-10 flex-1"
                value={locationValues[size]?.chamber || ''}
                onChange={(e) => handleInputChange(size, 'chamber', e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
              />
              <Input
                data-location-input="floor"
                data-size={size}
                data-variety-id={varietyId}
                placeholder="Floor"
                className="h-10 flex-1"
                value={locationValues[size]?.floor || ''}
                onChange={(e) => handleInputChange(size, 'floor', e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
              />
              <Input
                data-location-input="row"
                data-size={size}
                data-variety-id={varietyId}
                placeholder="Row"
                className="h-10 flex-1"
                value={locationValues[size]?.row || ''}
                onChange={(e) => handleInputChange(size, 'row', e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
              />
            </div>
          </div>

          {index < sizes.length - 1 && <Separator className="mt-2" />}
        </div>
      ))}
    </div>
  );

  // Apply to All button component
  const applyToAllButton = showApplyToAll ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleApplyToAll}
      disabled={!isApplyToAllEnabled}
      className="whitespace-nowrap"
    >
      Apply to All
    </Button>
  ) : null;

  if (inline) {
    return (
      <div ref={internalContainerRef}>
        {applyToAllButton && <div className="flex justify-end mb-4">{applyToAllButton}</div>}
        {content}
      </div>
    );
  }

  return (
    <Card ref={internalContainerRef}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Enter Locations</CardTitle>
        <div className="flex items-center justify-between gap-4 mt-1.5">
          <CardDescription>
            {isStandalone
              ? 'Please enter location details for each bag size'
              : 'Enter location details for each bag size'}
          </CardDescription>
          {applyToAllButton}
        </div>
      </CardHeader>

      <CardContent>{content}</CardContent>
    </Card>
  );
}
