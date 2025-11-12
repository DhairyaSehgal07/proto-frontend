'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronUp, ChevronDown, Printer } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { DaybookOrder } from '@/types/daybook';

interface TableRow {
  variety: string;
  size: string;
  quantityBefore: string;
  quantityRemoved: string;
  quantityAfter: string;
  weight: string;
  chamber: string;
  floor: string;
  row: string;
  rVoucher: string;
}

interface DeliveryVoucherCardProps {
  data: DaybookOrder;
}

// Memoized detail row component
const DetailRow = memo(({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="font-semibold text-sm lg:text-base text-foreground">{value}</div>
  </div>
));
DetailRow.displayName = 'DetailRow';

// Static column definition
const createTableColumns = (): ColumnDef<TableRow>[] => [
  {
    accessorKey: 'variety',
    header: 'Variety',
  },
  {
    accessorKey: 'size',
    header: 'Size',
  },
  {
    accessorKey: 'quantityBefore',
    header: 'Qty Before',
  },
  {
    accessorKey: 'quantityRemoved',
    header: 'Qty Removed',
    cell: ({ row }) => (
      <span className="font-bold text-destructive">{row.original.quantityRemoved}</span>
    ),
  },
  {
    accessorKey: 'quantityAfter',
    header: 'Qty After',
    cell: ({ row }) => <span className="font-bold text-primary">{row.original.quantityAfter}</span>,
  },
  {
    accessorKey: 'weight',
    header: 'Weight (kg)',
  },
  {
    accessorKey: 'chamber',
    header: 'Chamber',
  },
  {
    accessorKey: 'floor',
    header: 'Floor',
  },
  {
    accessorKey: 'row',
    header: 'Row',
  },
  {
    accessorKey: 'incomingOrderId',
    header: 'R. Voucher',
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <div className="w-2 h-2 bg-primary rounded-full" />
        <span>{row.original.rVoucher}</span>
      </div>
    ),
  },
];

// Utility function to format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

function DeliveryVoucherCard({ data }: DeliveryVoucherCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize toggle handler
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Memoize print handler (placeholder)
  const handlePrint = useCallback(() => {
    // Implement print logic
    window.print();
  }, []);

  // Transform varieties and bagSizes into table rows
  const tableRows = useMemo((): TableRow[] => {
    const rows: TableRow[] = [];

    // Process each variety
    // For delivery vouchers, we transform quantityInit/quantityCurr to quantityBefore/quantityRemoved/quantityAfter
    data.varieties.forEach((variety) => {
      variety.bagSizes.forEach((bagSize) => {
        // quantityBefore = quantityInit (initial quantity)
        // quantityRemoved = quantityInit - quantityCurr (what was removed)
        // quantityAfter = quantityCurr (remaining quantity)
        const quantityBefore = bagSize.quantityInit;
        const quantityAfter = bagSize.quantityCurr;
        const quantityRemoved = quantityBefore - quantityAfter;

        rows.push({
          variety: variety.name,
          size: bagSize.name,
          quantityBefore: quantityBefore.toString(),
          quantityRemoved: quantityRemoved.toString(),
          quantityAfter: quantityAfter.toString(),
          weight:
            bagSize.approxWeight !== undefined && bagSize.approxWeight !== null
              ? bagSize.approxWeight.toFixed(2)
              : 'N/A',
          chamber: bagSize.chamber,
          floor: bagSize.floor,
          row: bagSize.row,
          rVoucher:
            bagSize.incomingOrderId !== undefined && bagSize.incomingOrderId !== null
              ? bagSize.incomingOrderId.toString()
              : 'N/A',
        });
      });
    });

    // Calculate totals from the data
    const totalBags =
      data.totalBags ??
      data.varieties.reduce(
        (sum, variety) =>
          sum +
          variety.bagSizes.reduce(
            (bagSum, bag) => bagSum + (bag.quantityInit - bag.quantityCurr),
            0
          ),
        0
      );
    const totalWeight =
      data.totalWeight ??
      data.varieties.reduce(
        (sum, variety) =>
          sum +
          variety.bagSizes.reduce((bagSum, bag) => {
            const removed = bag.quantityInit - bag.quantityCurr;
            const weightPerBag =
              bag.approxWeight !== undefined && bag.approxWeight !== null
                ? bag.approxWeight / bag.quantityInit
                : 0;
            return bagSum + removed * weightPerBag;
          }, 0),
        0
      );

    // Add Total row
    if (rows.length > 0) {
      rows.push({
        variety: 'Total',
        size: '-',
        quantityBefore: '-',
        quantityRemoved: totalBags.toString(),
        quantityAfter: '-',
        weight: totalWeight > 0 ? totalWeight.toFixed(2) : 'N/A',
        chamber: '-',
        floor: '-',
        row: '-',
        rVoucher: '-',
      });
    }

    return rows;
  }, [data.varieties, data.totalBags, data.totalWeight]);

  // Memoize columns
  const columns = useMemo(() => createTableColumns(), []);

  // Extract farmer information
  const farmer = data.farmerStorageLink?.farmer;
  const partyName = farmer?.name ?? 'N/A';
  const address = farmer?.address ?? 'N/A';
  const mobileNumber = farmer?.mobileNumber ?? 'N/A';

  // Format date
  const formattedDate = useMemo(() => formatDate(data.createdAt), [data.createdAt]);

  // Get all variety names (for display in header if needed)
  const varietyNames = useMemo(
    () => data.varieties.map((v) => v.name).join(', ') || 'N/A',
    [data.varieties]
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4 sm:pb-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-destructive rounded-full shrink-0 mt-0.5" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
              Delivery Voucher:{' '}
              <span className="text-foreground font-bold">{data.gatePassNumber}</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <div className="px-3 py-1.5 bg-muted rounded-full text-xs sm:text-sm text-muted-foreground">
              Date: {formattedDate}
            </div>
            <div className="px-3 py-1.5 bg-secondary rounded-full text-xs sm:text-sm">
              <span className="text-muted-foreground">C.Stock:</span>{' '}
              <span className="text-foreground font-semibold">{data.currentStockAtThatTime}</span>
            </div>
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-5 sm:mb-6">
          <DetailRow label="Commodity" value={data.commodity} />
          <DetailRow label="Variety" value={varietyNames} />
          <DetailRow label="Party Name" value={partyName} />
          <DetailRow label="Gate Pass Type" value={data.gatePassType} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={toggleExpanded} className="w-full sm:w-auto">
            <span>{isExpanded ? 'Less Details' : 'More Details'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            aria-label="Print voucher"
            className="w-full sm:w-auto"
          >
            <Printer className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-6 sm:pb-8">
          {/* Farmer Details */}
          <section className="mb-6 sm:mb-8">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 text-foreground">
              Farmer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              <DetailRow label="Name" value={partyName} />
              <DetailRow label="Address" value={address} />
              <DetailRow label="Mobile Number" value={mobileNumber} />
              {farmer?.id && <DetailRow label="Farmer ID" value={farmer.id} />}
            </div>
          </section>

          <Separator className="my-6 sm:my-8" />

          {/* Table Section */}
          <section className="mb-6 sm:mb-8">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 text-foreground">
              Bag Details by Variety
            </h3>
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <DataTable
                columns={columns}
                data={tableRows}
                enableRowSelection={false}
                enablePagination={false}
                enableSorting={true}
                enableFiltering={false}
                enableColumnVisibility={true}
              />
            </div>
          </section>

          {/* Totals */}
          <div className="bg-muted/50 rounded-lg p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <span className="font-bold text-base sm:text-lg text-foreground">Total Bags</span>
                <span className="font-bold text-lg sm:text-xl text-destructive">
                  {data.totalBags ??
                    data.varieties.reduce(
                      (sum, variety) =>
                        sum +
                        variety.bagSizes.reduce(
                          (bagSum, bag) => bagSum + (bag.quantityInit - bag.quantityCurr),
                          0
                        ),
                      0
                    )}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <span className="font-bold text-base sm:text-lg text-foreground">Total Weight</span>
                <span className="font-bold text-lg sm:text-xl text-destructive">
                  {(() => {
                    const weight =
                      data.totalWeight ??
                      data.varieties.reduce(
                        (sum, variety) =>
                          sum +
                          variety.bagSizes.reduce((bagSum, bag) => {
                            const removed = bag.quantityInit - bag.quantityCurr;
                            const weightPerBag =
                              bag.approxWeight !== undefined && bag.approxWeight !== null
                                ? bag.approxWeight / bag.quantityInit
                                : 0;
                            return bagSum + removed * weightPerBag;
                          }, 0),
                        0
                      );
                    return weight > 0 ? `${weight.toFixed(2)} kg` : 'N/A';
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Created By */}
          {data.createdBy && (
            <>
              <Separator className="my-6 sm:my-8" />
              <section className="mb-6 sm:mb-8">
                <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 text-foreground">
                  Created By
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                  <DetailRow label="Name" value={data.createdBy.name} />
                  <DetailRow label="User ID" value={data.createdBy.id} />
                </div>
              </section>
            </>
          )}

          {/* Remarks */}
          {data.remarks && (
            <>
              <Separator className="my-6 sm:my-8" />
              <section>
                <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5 text-foreground">
                  Remarks
                </h3>
                <div className="bg-muted border border-border rounded-md p-4 sm:p-5">
                  <p className="text-sm sm:text-base text-foreground leading-relaxed">
                    {data.remarks}
                  </p>
                </div>
              </section>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default memo(DeliveryVoucherCard);
