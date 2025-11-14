'use client';

import { SearchSelector } from '../search-selector';
import { Label } from '@/components/ui/label';

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
  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base font-medium">
        Select Commodity
      </Label>
      <SearchSelector
        id={id}
        options={[
          { label: 'Potato', value: 'potato' },
          { label: 'Onion', value: 'onion' },
          { label: 'Tomato', value: 'tomato' },
          { label: 'Carrot', value: 'carrot' },
          { label: 'Garlic', value: 'garlic' },
        ]}
        placeholder="Select a commodity..."
        onSelect={onSelect}
        className="w-full sm:w-[320px]"
        buttonClassName="w-full sm:w-[320px] justify-between h-10"
        disabled={disabled}
      />
    </div>
  );
};
