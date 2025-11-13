'use client';

import { SearchSelector } from '../search-selector';
import { Label } from '@/components/ui/label';

interface VarietySelectorProps {
  id?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

export const VarietySelector = ({
  id = 'variety-selector',
  onSelect,
  disabled = false,
}: VarietySelectorProps) => {
  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-base font-medium">
        Select Variety
      </Label>
      <SearchSelector
        id={id}
        options={[
          { label: 'Example Variety 1', value: 'example1' },
          { label: 'Example Variety 2', value: 'example2' },
        ]}
        placeholder="Select a variety..."
        onSelect={onSelect}
        className="w-full sm:w-[320px]"
        buttonClassName="w-full sm:w-[320px] justify-between h-10"
        disabled={disabled}
      />
    </div>
  );
};
