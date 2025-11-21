'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/store';
import { useMemo, useEffect } from 'react';

interface CommoditySelectorProps {
  id?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

export const CommoditySelector = ({
  id = 'commodity-selector',
  onSelect,
  disabled = false,
}: CommoditySelectorProps) => {
  const { coldStorage } = useStore();

  const commodityOptions = useMemo(() => {
    return (
      coldStorage?.preferences?.commodities?.map((commodity) => ({
        label: commodity.name,
        value: commodity.name,
      })) || []
    );
  }, [coldStorage?.preferences?.commodities]);

  const defaultValue = commodityOptions.length > 0 ? commodityOptions[0].value : undefined;

  // Call onSelect with the first value when it's available
  useEffect(() => {
    if (defaultValue && onSelect) {
      onSelect(defaultValue);
    }
  }, [defaultValue, onSelect]);

  const handleValueChange = (value: string) => {
    onSelect?.(value);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base font-medium">
        Select Commodity
      </Label>
      <Select
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={disabled || commodityOptions.length === 0}
      >
        <SelectTrigger id={id} className="w-full sm:w-[320px] h-10">
          <SelectValue placeholder="Select a commodity..." />
        </SelectTrigger>
        <SelectContent className="w-full sm:w-[320px]">
          {commodityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
