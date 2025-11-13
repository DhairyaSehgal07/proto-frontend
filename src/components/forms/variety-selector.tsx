'use client';

import { SearchSelector } from '../search-selector';
import { Label } from '@/components/ui/label';

export const VarietySelector = () => {
  return (
    <div className="space-y-3">
      <Label htmlFor="variety-selector" className="text-base font-medium">
        Select Variety
      </Label>
      <SearchSelector
        id="variety-selector"
        options={[
          { label: 'Example Variety 1', value: 'example1' },
          { label: 'Example Variety 2', value: 'example2' },
        ]}
        placeholder="Select a variety..."
        onSelect={() => {}}
        className="w-full sm:w-[320px]"
        buttonClassName="w-full sm:w-[320px] justify-between h-10"
      />
    </div>
  );
};
