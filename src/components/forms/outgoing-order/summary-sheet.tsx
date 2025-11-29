'use client';

import { useEffect, useMemo } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  // Group bags by gate pass (orderId) and then by variety using Object.groupBy()
  const groupedBags = useMemo(() => {
    // First group by orderId using Object.groupBy()
    const orderGroups = Object.groupBy(selectedBags, (bag) => bag.orderId);

    // Then for each order, group by variety and flatten into result array
    const result: Array<{
      orderId: string;
      order: DaybookOrder;
      variety: string;
      bags: SelectedBag[];
    }> = [];

    // Iterate over each order group
    Object.entries(orderGroups).forEach(([orderId, bags]) => {
      if (!bags || bags.length === 0) return;

      // Group bags by variety within this order using Object.groupBy()
      const varietyGroups = Object.groupBy(bags, (bag) => bag.variety);

      // Create an entry for each variety in this order
      Object.entries(varietyGroups).forEach(([variety, varietyBags]) => {
        if (!varietyBags || varietyBags.length === 0) return;

        result.push({
          orderId,
          order: bags[0].order,
          variety,
          bags: varietyBags,
        });
      });
    });

    return result;
  }, [selectedBags]);

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
                <h3 className="text-base font-semibold mb-3">Selected Bags</h3>
                <div className="space-y-8">
                  {(() => {
                    // Group by orderId to show gate pass header only once per order using Object.groupBy()
                    const orderGroups = Object.groupBy(groupedBags, (group) => group.orderId);

                    return Object.entries(orderGroups)
                      .filter(([, varietyGroups]) => varietyGroups && varietyGroups.length > 0)
                      .map(([orderId, varietyGroups]) => {
                        // TypeScript: varietyGroups is guaranteed to be defined after filter
                        const groups = varietyGroups!;
                        const firstGroup = groups[0];
                        return (
                          <div key={orderId} className="rounded-lg border bg-card overflow-hidden">
                            {/* Gate Pass Header */}
                            <div className="px-3 py-2 bg-muted/50 border-b">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-foreground/90">
                                    Gate Pass #{firstGroup.order.gatePassNumber}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {firstGroup.order.createdAt
                                      ? format(new Date(firstGroup.order.createdAt), 'MMM dd, yyyy')
                                      : 'N/A'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Commodity
                                  </p>
                                  <p className="text-xs font-semibold text-foreground/90">
                                    {firstGroup.order.commodity}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Tables for each variety */}
                            <div className="space-y-3">
                              {groups.map((group, varietyIndex) => (
                                <div key={`${orderId}-${group.variety}-${varietyIndex}`}>
                                  {/* Variety Header */}
                                  <div className="px-3 py-1.5 bg-muted/30 border-b">
                                    <p className="text-xs font-semibold text-foreground/90">
                                      Variety: {group.variety}
                                    </p>
                                  </div>

                                  {/* Table */}
                                  <div className="overflow-x-auto">
                                    <Table className="table-fixed w-full">
                                      <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                          <TableHead className="font-medium text-foreground/80 w-[20%] truncate px-2 py-1.5 text-xs">
                                            Size
                                          </TableHead>
                                          <TableHead className="font-medium text-foreground/80 w-[20%] truncate px-2 py-1.5 text-xs">
                                            Location
                                          </TableHead>
                                          <TableHead className="font-medium text-foreground/80 text-right w-[18%] px-2 py-1.5 text-xs whitespace-nowrap">
                                            Avail
                                          </TableHead>
                                          <TableHead className="font-medium text-foreground/80 text-right w-[18%] px-2 py-1.5 text-xs whitespace-nowrap">
                                            Sel
                                          </TableHead>
                                          <TableHead className="font-medium text-foreground/80 text-right w-[18%] px-2 py-1.5 text-xs whitespace-nowrap">
                                            Rem
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {group.bags.map((bag, index) => {
                                          const remaining = bag.quantityCurr - bag.quantity;
                                          return (
                                            <TableRow
                                              key={`${bag.orderId}-${bag.size}-${bag.variety}-${bag.location}-${index}`}
                                              className="hover:bg-muted/50"
                                            >
                                              <TableCell className="text-foreground/80 truncate px-2 py-1.5 text-xs">
                                                <span className="truncate block">{bag.size}</span>
                                              </TableCell>
                                              <TableCell className="text-foreground/80 truncate px-2 py-1.5 text-xs">
                                                <span className="truncate block">
                                                  {bag.location}
                                                </span>
                                              </TableCell>
                                              <TableCell className="text-right text-foreground/80 px-2 py-1.5 text-xs whitespace-nowrap">
                                                {bag.quantityCurr.toFixed(1)}
                                              </TableCell>
                                              <TableCell className="text-right px-2 py-1.5 text-xs whitespace-nowrap">
                                                <span className="font-semibold text-primary">
                                                  {bag.quantity.toFixed(1)}
                                                </span>
                                              </TableCell>
                                              <TableCell className="text-right text-foreground/80 px-2 py-1.5 text-xs whitespace-nowrap">
                                                {remaining.toFixed(1)}
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>

              {/* Total Summary */}
              <div className="px-3 py-2 rounded-lg border bg-muted/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground/90">Total Bags Selected:</p>
                  <p className="text-base font-bold text-primary">
                    {selectedBags.reduce((sum, bag) => sum + bag.quantity, 0).toFixed(1)}
                  </p>
                </div>
                <div className="mt-1.5 pt-1.5 border-t">
                  <p className="text-xs text-muted-foreground">
                    {selectedBags.length} unique bag{selectedBags.length !== 1 ? 's' : ''} selected
                    across {groupedBags.length} gate pass{groupedBags.length !== 1 ? 'es' : ''}
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
