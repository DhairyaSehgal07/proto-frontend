'use client';

import { SearchSelector } from '../search-selector';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store';
import { useMemo } from 'react';

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

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base font-medium">
        Select Commodity
      </Label>
      <SearchSelector
        id={id}
        options={commodityOptions}
        placeholder="Select a commodity..."
        onSelect={onSelect}
        className="w-full sm:w-[320px]"
        buttonClassName="w-full sm:w-[320px] justify-between h-10"
        disabled={disabled}
      />
    </div>
  );
};
