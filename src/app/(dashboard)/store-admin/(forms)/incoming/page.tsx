'use client';

import {
  AddFarmerModal,
  FarmerSearch,
  VarietySelector,
  DatePicker,
  QuantityInputSection,
  Stepper,
} from '@/components/forms';
import { LocationInputSection } from '@/components/forms/location-input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function IncomingOrderPage() {
  const steps = [
    {
      title: 'Basic Info',
      description: 'Farmer details, variety, and quantity information.',
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Select or add a farmer to start creating an incoming order.
              </p>
              <div className="space-y-3">
                <Label htmlFor="farmer-search" className="text-base font-medium">
                  Select Farmer
                </Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <FarmerSearch />
                  <AddFarmerModal />
                </div>
              </div>
            </div>
          </div>
          <VarietySelector />
          <DatePicker />
          <QuantityInputSection />
        </div>
      ),
    },
    {
      title: 'Location & Remarks',
      description: 'Specify storage location and optional remarks.',
      content: (
        <div className="space-y-8">
          <LocationInputSection />
          <div className="space-y-3">
            <Label htmlFor="remarks" className="text-base font-medium">
              Add Remarks
            </Label>
            <Textarea
              id="remarks"
              placeholder="Enter any additional remarks or notes..."
              className="min-h-[120px]"
            />
          </div>
        </div>
      ),
    },
  ];

  const handleSubmit = () => {
    // Form submission logic will be implemented here
  };

  return <Stepper steps={steps} onSubmit={handleSubmit} />;
}
