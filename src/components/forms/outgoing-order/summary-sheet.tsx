'use client';

import { useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DaybookOrder } from '@/types/daybook';
import { format } from 'date-fns';

interface SelectedBag {
  orderId: string;
  order: DaybookOrder;
  size: string;
  variety: string;
  location: string;
  quantity: number;
  quantityCurr: number;
  quantityInit: number;
}

interface SummarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBags: SelectedBag[];
  selectedFarmer: {
    name: string;
    mobileNumber: string;
    address?: string;
  } | null;
  selectedCommodity: string;
  selectedVariety: string;
  remarksRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function SummarySheet({
  open,
  onOpenChange,
  selectedBags,
  selectedFarmer,
  selectedCommodity,
  selectedVariety,
  remarksRef,
  onSubmit,
  isSubmitting,
}: SummarySheetProps) {
  // Auto-focus on remarks field when sheet opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const remarksField = document.getElementById('remarks');
        if (remarksField) {
          remarksField.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto flex flex-col px-6">
        <SheetHeader className="px-0">
          <SheetTitle className="text-2xl">Order Summary</SheetTitle>
          <SheetDescription>
            Review all the bags you have selected and add remarks before submitting.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-6 space-y-6 pb-6">
          {/* Order Details */}
          <div className="p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
            <div className="space-y-4">
              {/* Header */}
              <div className="pb-3 border-b border-primary/20">
                <h3 className="text-base font-semibold text-foreground/90">Order Details</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Review the details before submitting
                </p>
              </div>

              {/* Farmer Information */}
              {selectedFarmer && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Farmer
                  </p>
                  <div className="flex flex-col gap-2">
                    <p className="text-base font-semibold text-foreground/90">
                      {selectedFarmer.name}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="text-xs">📞</span>
                        <span>{selectedFarmer.mobileNumber}</span>
                      </div>
                      {selectedFarmer.address && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="text-xs">📍</span>
                          <span className="truncate max-w-[200px]">{selectedFarmer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Commodity and Variety Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {selectedCommodity && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                      Commodity
                    </p>
                    <p className="text-sm font-semibold text-foreground/90">{selectedCommodity}</p>
                  </div>
                )}
                {selectedVariety && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                      Variety
                    </p>
                    <p className="text-sm font-semibold text-foreground/90">{selectedVariety}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Bags */}
          {selectedBags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No bags selected yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Selected Bags</h3>
                <div className="space-y-4">
                  {selectedBags.map((bag, index) => (
                    <div
                      key={`${bag.orderId}-${bag.size}-${bag.variety}-${bag.location}-${index}`}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="space-y-3">
                        {/* Order Header */}
                        <div className="flex items-start justify-between pb-2 border-b">
                          <div>
                            <p className="text-sm font-semibold text-foreground/90">
                              Gate Pass #{bag.order.gatePassNumber}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {bag.order.createdAt
                                ? format(new Date(bag.order.createdAt), 'MMM dd, yyyy')
                                : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-muted-foreground">Commodity</p>
                            <p className="text-sm font-semibold text-foreground/90">
                              {bag.order.commodity}
                            </p>
                          </div>
                        </div>

                        {/* Bag Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Variety</p>
                            <p className="font-medium text-foreground/90">{bag.variety}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Bag Size</p>
                            <p className="font-medium text-foreground/90">{bag.size}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Location</p>
                            <p className="font-medium text-foreground/90">{bag.location}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Selected Quantity</p>
                            <p className="font-semibold text-primary">{bag.quantity.toFixed(1)}</p>
                          </div>
                        </div>

                        {/* Quantity Info */}
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Available:</span>
                            <span className="font-medium text-foreground/80">
                              {bag.quantityCurr.toFixed(1)} / {bag.quantityInit.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground/90">Total Bags Selected:</p>
                  <p className="text-lg font-bold text-primary">
                    {selectedBags.reduce((sum, bag) => sum + bag.quantity, 0).toFixed(1)}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {selectedBags.length} unique bag{selectedBags.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Remarks Field */}
          <div className="space-y-3">
            <Label htmlFor="remarks" className="text-base font-medium">
              Add Remarks
            </Label>
            <Textarea
              ref={remarksRef}
              id="remarks"
              placeholder="Enter any additional remarks or notes..."
              className="min-h-[120px]"
              onKeyDown={(e) => {
                // Submit form when Enter is pressed (without Shift)
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
            />
          </div>
        </div>

        <SheetFooter className="mt-auto pt-6 border-t px-0">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || selectedBags.length === 0}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
