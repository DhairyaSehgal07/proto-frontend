'use client';

import { FarmerSearch } from '@/components/forms';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStore } from '@/store';
import OrderNumber from '@/components/forms/order-number';
import { useGetGatePassNumber } from '@/services/base/incoming-orders/useGatePassNumber';
import { Commodity, CreateIncomingOrderInput } from '@/types/incomingOrder';
import { useCreateIncomingOrder } from '@/services/base/incoming-orders/useCreateIncomingOrder';
import { toast } from 'sonner';
import { useGetAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';
import { useGetOrdersOfFarmer } from '@/services/base/store-admin/functions/useGetOrdersOfFarmer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DaybookOrder } from '@/types/daybook';
import { MapPin, Columns } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function OutgoingOrderPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [farmerStorageLinkId, setFarmerStorageLinkId] = useState<string>('');
  const [selectedVariety, setSelectedVariety] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Map<string, number>>(new Map());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCardKey, setSelectedCardKey] = useState<string | null>(null);
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [maxQuantity, setMaxQuantity] = useState<number>(0);
  const [quantityError, setQuantityError] = useState<string>('');
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const autoSelectedCommodityRef = useRef<string>('');
  const { coldStorage } = useStore();

  const { data } = useGetGatePassNumber((selectedCommodity as Commodity) || undefined, 'outgoing');
  const createIncomingOrderMutation = useCreateIncomingOrder();
  const farmersQuery = useGetAllFarmers();
  const farmerOrdersQuery = useGetOrdersOfFarmer({
    farmerStorageLinkId,
    type: 'incoming',
    enabled: !!farmerStorageLinkId,
  });

  // Extract unique commodities from farmer's incoming orders
  const availableCommodities = useMemo(() => {
    if (!farmerStorageLinkId || !farmerOrdersQuery.data?.data) return [];
    const commoditySet = new Set<string>();
    farmerOrdersQuery.data.data.forEach((order) => {
      if (order.commodity) {
        commoditySet.add(order.commodity);
      }
    });
    return Array.from(commoditySet).sort();
  }, [farmerStorageLinkId, farmerOrdersQuery.data]);

  // Auto-select commodity if only one is available
  useEffect(() => {
    if (availableCommodities.length === 1) {
      const singleCommodity = availableCommodities[0];
      // Only auto-select if:
      // 1. We haven't already auto-selected this commodity, AND
      // 2. Either no commodity is selected, or the current selection was auto-selected
      if (
        singleCommodity !== autoSelectedCommodityRef.current &&
        (!selectedCommodity || selectedCommodity === autoSelectedCommodityRef.current)
      ) {
        autoSelectedCommodityRef.current = singleCommodity;
        setSelectedCommodity(singleCommodity);
      }
    } else if (availableCommodities.length === 0) {
      autoSelectedCommodityRef.current = '';
      setSelectedCommodity('');
    }
    // Reset auto-select ref when commodities change (multiple commodities available)
    else if (availableCommodities.length > 1) {
      // Only clear if current selection was auto-selected
      if (selectedCommodity === autoSelectedCommodityRef.current) {
        autoSelectedCommodityRef.current = '';
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableCommodities]);

  // Get incoming orders filtered by selected commodity
  const incomingOrdersByCommodity = useMemo(() => {
    if (!farmerOrdersQuery.data?.data) return [];
    const orders = farmerOrdersQuery.data.data;
    if (selectedCommodity) {
      return orders.filter((order) => order.commodity === selectedCommodity);
    }
    return [];
  }, [farmerOrdersQuery.data, selectedCommodity]);

  // Extract unique varieties from incoming orders
  const availableVarieties = useMemo(() => {
    if (!selectedCommodity || incomingOrdersByCommodity.length === 0) return [];
    const varietySet = new Set<string>();
    incomingOrdersByCommodity.forEach((order) => {
      order.varieties.forEach((variety) => {
        varietySet.add(variety.name);
      });
    });
    return Array.from(varietySet).sort();
  }, [incomingOrdersByCommodity, selectedCommodity]);

  // Handle commodity selection
  const handleCommodityChange = useCallback((commodity: string) => {
    setSelectedCommodity(commodity === '__all__' ? '' : commodity);
    setSelectedVariety(''); // Reset variety when commodity changes
  }, []);

  const handleSubmit = useCallback(() => {
    const gatePassNumber = data?.data?.nextGatePassNumber;
    if (!gatePassNumber) {
      toast.error('Gate pass number not available. Please select a commodity.');
      return;
    }

    if (!farmerStorageLinkId) {
      toast.error('Please select a farmer.');
      return;
    }

    if (!selectedCommodity) {
      toast.error('Please select a commodity.');
      return;
    }

    if (!selectedVariety) {
      toast.error('Please select a variety.');
      return;
    }

    const remarks = remarksRef.current?.value || null;

    // Prepare payload (adjust according to your API requirements)
    const payload: CreateIncomingOrderInput = {
      farmerStorageLinkId,
      commodity: selectedCommodity as Commodity,
      gatePassNumber,
      remarks: remarks?.trim() || null,
      varieties: [], // TODO: Add varieties when implementing full outgoing order functionality
    };

    // Submit to API
    createIncomingOrderMutation.mutate(payload, {
      onSuccess: () => {
        // Reset form after successful submission
        setSelectedCommodity('');
        setFarmerStorageLinkId('');
        setSelectedVariety('');
        setSelectedOrders(new Set());
        setActiveStep(0);
        if (remarksRef.current) {
          remarksRef.current.value = '';
        }
      },
    });
  }, [
    farmerStorageLinkId,
    selectedCommodity,
    selectedVariety,
    data?.data?.nextGatePassNumber,
    remarksRef,
    createIncomingOrderMutation,
  ]);

  // Get farmer name from farmerStorageLinkId
  const selectedFarmer = useMemo(() => {
    if (!farmerStorageLinkId || !farmersQuery.data?.data) return null;
    return farmersQuery.data?.data.find((f) => f.id === farmerStorageLinkId) ?? null;
  }, [farmerStorageLinkId, farmersQuery.data?.data]);

  // Get incoming orders filtered by selected commodity and variety
  const incomingOrders = useMemo(() => {
    let orders = incomingOrdersByCommodity;

    // Filter out orders with empty varieties arrays
    orders = orders.filter((order) => order.varieties && order.varieties.length > 0);

    // Filter by selected variety if one is selected
    if (selectedVariety) {
      orders = orders.filter((order) =>
        order.varieties.some((variety) => variety.name === selectedVariety)
      );
    }

    return orders;
  }, [incomingOrdersByCommodity, selectedVariety]);

  // Get bag sizes for selected commodity from preferences
  const bagSizes = useMemo(() => {
    if (!selectedCommodity || !coldStorage?.preferences?.commodities) return [];
    const commodity = coldStorage.preferences.commodities.find((c) => c.name === selectedCommodity);
    return commodity?.sizes ?? [];
  }, [selectedCommodity, coldStorage]);

  // Initialize visible columns when bag sizes change
  useEffect(() => {
    if (bagSizes.length > 0) {
      setVisibleColumns((prev) => {
        // Only update if the bag sizes have actually changed
        const currentSizes = new Set(bagSizes);
        const prevSizes = new Set(prev);
        const sizesMatch =
          currentSizes.size === prevSizes.size &&
          Array.from(currentSizes).every((size) => prevSizes.has(size));
        if (!sizesMatch) {
          return new Set(bagSizes);
        }
        return prev;
      });
    } else {
      setVisibleColumns(new Set());
    }
  }, [bagSizes]);

  // Filter bag sizes to only show visible columns
  const visibleBagSizes = useMemo(() => {
    return bagSizes.filter((size) => visibleColumns.has(size));
  }, [bagSizes, visibleColumns]);

  // Handle column visibility toggle
  const handleColumnToggle = useCallback((size: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(size)) {
        next.delete(size);
      } else {
        next.add(size);
      }
      return next;
    });
  }, []);

  // Get data for a specific order and size combination
  const getOrderSizeData = useCallback((order: DaybookOrder, size: string) => {
    // Find all varieties in this order that have this bag size
    const matchingData: Array<{
      variety: string;
      quantityCurr: number;
      quantityInit: number;
      location: string;
    }> = [];

    order.varieties.forEach((variety) => {
      variety.bagSizes.forEach((bagSize) => {
        if (bagSize.name === size && bagSize.quantityCurr > 0) {
          matchingData.push({
            variety: variety.name,
            quantityCurr: bagSize.quantityCurr,
            quantityInit: bagSize.quantityInit,
            location: `${bagSize.chamber}/${bagSize.floor}/${bagSize.row}`,
          });
        }
      });
    });

    return matchingData;
  }, []);

  // Handle order selection
  const handleOrderToggle = useCallback((orderId: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }, []);

  // Generate unique key for a card
  const getCardKey = useCallback(
    (orderId: string, size: string, variety: string, location: string) => {
      return `${orderId}-${size}-${variety}-${location}`;
    },
    []
  );

  // Handle card click to open dialog
  const handleCardClick = useCallback(
    (orderId: string, size: string, variety: string, location: string, currentQuantity: number) => {
      const cardKey = getCardKey(orderId, size, variety, location);
      setSelectedCardKey(cardKey);
      setMaxQuantity(currentQuantity);
      const existingQuantity = quantities.get(cardKey);
      setQuantityInput(existingQuantity ? existingQuantity.toString() : '');
      setQuantityError('');
      setDialogOpen(true);
    },
    [getCardKey, quantities]
  );

  // Handle quantity input change with validation
  const handleQuantityInputChange = useCallback(
    (value: string) => {
      setQuantityError('');

      // Allow empty input or just a decimal point
      if (value === '' || value === '.') {
        setQuantityInput(value);
        return;
      }

      // Parse the input value
      const quantity = parseFloat(value);

      // If not a valid number, don't update (prevent invalid input)
      if (isNaN(quantity)) {
        return;
      }

      // Check if value exceeds maximum
      if (quantity > maxQuantity) {
        setQuantityInput(value);
        setQuantityError(`Quantity cannot exceed ${maxQuantity.toFixed(1)}`);
        return;
      }

      if (quantity <= 0) {
        setQuantityInput(value);
        setQuantityError('Quantity must be greater than 0');
        return;
      }

      // Valid input
      setQuantityInput(value);
    },
    [maxQuantity]
  );

  // Handle quantity submission
  const handleQuantitySubmit = useCallback(() => {
    if (!selectedCardKey) return;

    const quantity = parseFloat(quantityInput);
    if (isNaN(quantity) || quantity <= 0) {
      setQuantityError('Please enter a valid quantity greater than 0');
      toast.error('Please enter a valid quantity greater than 0');
      return;
    }

    if (quantity > maxQuantity) {
      setQuantityError(`Quantity cannot exceed ${maxQuantity.toFixed(1)}`);
      toast.error(`Quantity cannot exceed ${maxQuantity.toFixed(1)}`);
      return;
    }

    setQuantities((prev) => {
      const next = new Map(prev);
      next.set(selectedCardKey, quantity);
      return next;
    });

    setDialogOpen(false);
    setSelectedCardKey(null);
    setQuantityInput('');
    setQuantityError('');
    setMaxQuantity(0);
  }, [selectedCardKey, quantityInput, maxQuantity]);

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedCardKey(null);
    setQuantityInput('');
    setQuantityError('');
    setMaxQuantity(0);
  }, []);

  const steps = [
    {
      title: 'Info',
      description: 'Select farmer, commodity, and variety.',
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Select or add a farmer to start creating an outgoing order.
              </p>
              <div className="space-y-3">
                <Label htmlFor="farmer-search" className="text-base font-medium">
                  Select Farmer
                </Label>
                <FarmerSearch
                  onSelect={(id) => {
                    setFarmerStorageLinkId(id);
                    // Reset commodity and variety when farmer changes
                    setSelectedCommodity('');
                    setSelectedVariety('');
                    setSelectedOrders(new Set());
                    setVisibleColumns(new Set());
                    autoSelectedCommodityRef.current = '';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Commodity Selector - Only show after farmer is selected */}
          {farmerStorageLinkId && (
            <div className="space-y-3">
              <Label htmlFor="commodity" className="text-base font-medium">
                Select Commodity
              </Label>
              {farmerOrdersQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading commodities...</p>
              ) : availableCommodities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No commodities found for this farmer
                </p>
              ) : (
                <Select
                  value={selectedCommodity || '__all__'}
                  onValueChange={handleCommodityChange}
                >
                  <SelectTrigger id="commodity">
                    <SelectValue placeholder="Choose a commodity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Commodities</SelectItem>
                    {availableCommodities.map((commodity) => (
                      <SelectItem key={commodity} value={commodity}>
                        {commodity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Variety Selector */}
          {selectedCommodity && availableVarieties.length > 0 && (
            <div className="space-y-3">
              <Label htmlFor="variety" className="text-base font-medium">
                Select Variety
              </Label>
              <Select
                value={selectedVariety || '__all__'}
                onValueChange={(value) => setSelectedVariety(value === '__all__' ? '' : value)}
              >
                <SelectTrigger id="variety">
                  <SelectValue placeholder="Choose a variety" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Varieties</SelectItem>
                  {availableVarieties.map((variety) => (
                    <SelectItem key={variety} value={variety}>
                      {variety}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Incoming Orders Table */}
          {farmerStorageLinkId && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl">Incoming Orders</CardTitle>
                    <CardDescription>
                      {selectedCommodity
                        ? selectedVariety
                          ? `Showing orders for ${selectedCommodity} - ${selectedVariety}`
                          : `Showing orders for ${selectedCommodity}`
                        : 'Select a commodity to view orders by bag size'}
                    </CardDescription>
                  </div>
                  {selectedCommodity && bagSizes.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Columns className="h-4 w-4" />
                          Columns
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {bagSizes.map((size) => (
                          <DropdownMenuCheckboxItem
                            key={size}
                            checked={visibleColumns.has(size)}
                            onCheckedChange={() => handleColumnToggle(size)}
                          >
                            {size}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {farmerOrdersQuery.isLoading && (
                  <p className="text-sm text-muted-foreground">Loading orders...</p>
                )}
                {farmerOrdersQuery.isError && (
                  <p className="text-sm text-destructive">Error loading orders</p>
                )}
                {!farmerOrdersQuery.isLoading &&
                  !farmerOrdersQuery.isError &&
                  (!selectedCommodity || bagSizes.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      {!selectedCommodity
                        ? 'Please select a commodity to view orders'
                        : 'No bag sizes configured for this commodity'}
                    </p>
                  )}
                {!farmerOrdersQuery.isLoading &&
                  !farmerOrdersQuery.isError &&
                  selectedCommodity &&
                  bagSizes.length > 0 && (
                    <div className="overflow-x-auto">
                      {visibleBagSizes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p className="text-sm">
                            No columns selected. Use the Columns button to show columns.
                          </p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-[120px] font-medium text-foreground/80">
                                R. Voucher
                              </TableHead>
                              {visibleBagSizes.map((size) => (
                                <TableHead key={size} className="font-medium text-foreground/80">
                                  {size}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {incomingOrders.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={visibleBagSizes.length + 1}
                                  className="text-center text-muted-foreground/70 py-8"
                                >
                                  No incoming orders found
                                </TableCell>
                              </TableRow>
                            ) : (
                              incomingOrders.map((order) => (
                                <TableRow
                                  key={order.id}
                                  className="hover:bg-transparent border-border/40"
                                >
                                  <TableCell className="py-3">
                                    <div className="flex items-center gap-2.5">
                                      <Checkbox
                                        checked={selectedOrders.has(order.id)}
                                        onCheckedChange={() => handleOrderToggle(order.id)}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                      />
                                      <span className="font-medium text-foreground/90">
                                        #{order.gatePassNumber}
                                      </span>
                                    </div>
                                  </TableCell>
                                  {visibleBagSizes.map((size) => {
                                    const sizeData = getOrderSizeData(order, size);
                                    return (
                                      <TableCell key={size} className="py-2">
                                        {sizeData.length === 0 ? (
                                          <div className="h-20 bg-muted/30 rounded-lg border border-border/40" />
                                        ) : (
                                          <div className="space-y-2.5">
                                            {sizeData.map((data, idx) => {
                                              const cardKey = getCardKey(
                                                order.id,
                                                size,
                                                data.variety,
                                                data.location
                                              );
                                              const quantity = quantities.get(cardKey);
                                              return (
                                                <div
                                                  key={idx}
                                                  className={cn(
                                                    'group relative p-3 rounded-lg border cursor-pointer transition-all duration-200',
                                                    'hover:bg-muted/50 hover:border-muted-foreground/20 hover:shadow-sm',
                                                    selectedOrders.has(order.id)
                                                      ? 'bg-primary/5 border-primary/30 shadow-sm'
                                                      : 'bg-card/50 border-border/60'
                                                  )}
                                                  onClick={() =>
                                                    handleCardClick(
                                                      order.id,
                                                      size,
                                                      data.variety,
                                                      data.location,
                                                      data.quantityCurr
                                                    )
                                                  }
                                                >
                                                  {quantity !== undefined && (
                                                    <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-[10px] font-semibold shadow-lg ring-2 ring-background z-10">
                                                      {quantity.toFixed(1)}
                                                    </div>
                                                  )}
                                                  <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                      <p className="text-sm font-medium text-foreground/90 truncate mb-1.5">
                                                        {data.variety}
                                                      </p>
                                                      <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                                                        <p className="text-xs text-muted-foreground/80 truncate">
                                                          {data.location}
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                      <p className="text-lg font-semibold text-foreground leading-none">
                                                        {data.quantityCurr.toFixed(1)}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                                                        /{data.quantityInit.toFixed(1)}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      title: 'Summary',
      description: 'Summary and additional notes.',
      content: (
        <div className="space-y-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
              <CardDescription>Review the details before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Farmer Information */}
              {selectedFarmer && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Farmer</Label>
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-semibold">{selectedFarmer.name}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>📞 {selectedFarmer.mobileNumber}</span>
                      {selectedFarmer.address && (
                        <span className="truncate max-w-[300px]">📍 {selectedFarmer.address}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Commodity */}
              {selectedCommodity && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Commodity</Label>
                  <p className="text-base font-semibold">{selectedCommodity}</p>
                </div>
              )}

              {/* Variety */}
              {selectedVariety && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Variety</Label>
                  <p className="text-base font-semibold">{selectedVariety}</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  // Auto-focus on first input when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeStep === 0) {
        const farmerSearchButton = document.getElementById('farmer-search');
        if (farmerSearchButton) {
          farmerSearchButton.focus();
        }
      } else if (activeStep === 1) {
        const remarksField = document.getElementById('remarks');
        if (remarksField) {
          remarksField.focus();
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeStep]);

  return (
    <div className="flex w-full max-w-full flex-col gap-8 mx-auto px-4">
      <Tabs value={steps[activeStep].title}>
        {/* ---- Step Titles ---- */}
        <TabsList className={cn('grid w-full', `grid-cols-${steps.length}`)}>
          {steps.map((step, i) => (
            <TabsTrigger
              key={step.title}
              value={step.title}
              className={cn(
                activeStep === i ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              )}
              onClick={() => setActiveStep(i)}
            >
              {step.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ---- Step Content ---- */}
        {steps.map((step) => (
          <TabsContent key={step.title} value={step.title} className="mt-6">
            <Card>
              <CardHeader className="pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <OrderNumber
                      gatePassNumber={data?.data?.nextGatePassNumber}
                      type="Delivery"
                      name="Voucher"
                    />
                    <CardTitle className="text-2xl mt-2">{step.title}</CardTitle>
                    {step.description && (
                      <CardDescription className="text-base mt-1">
                        {step.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6">{step.content}</CardContent>

              <CardFooter className="flex justify-between items-center pt-6 border-t">
                <div>
                  {!isFirstStep && (
                    <Button variant="outline" onClick={() => setActiveStep((s) => s - 1)}>
                      Back
                    </Button>
                  )}
                </div>
                <div>
                  {isLastStep ? (
                    <Button onClick={handleSubmit} disabled={createIncomingOrderMutation.isPending}>
                      {createIncomingOrderMutation.isPending ? 'Submitting...' : 'Submit'}
                    </Button>
                  ) : (
                    <Button onClick={() => setActiveStep((s) => s + 1)}>Next</Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quantity Input Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Enter quantity to remove</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/80">
              Specify the amount you wish to remove from this item.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="quantity-input" className="text-sm font-medium text-foreground/90">
                  Quantity
                </label>
                {maxQuantity > 0 && (
                  <span className="text-xs text-muted-foreground/70">
                    Max: {maxQuantity.toFixed(1)}
                  </span>
                )}
              </div>
              <Input
                id="quantity-input"
                type="number"
                placeholder="0.0"
                value={quantityInput}
                onChange={(e) => handleQuantityInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!quantityError) {
                      handleQuantitySubmit();
                    }
                  }
                }}
                autoFocus
                min="0"
                max={maxQuantity}
                step="0.1"
                className={cn(
                  'text-base',
                  quantityError && 'border-destructive focus-visible:ring-destructive/20'
                )}
              />
              {quantityError && <p className="text-xs text-destructive mt-1">{quantityError}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleDialogClose} className="sm:min-w-[80px]">
              Cancel
            </Button>
            <Button
              onClick={handleQuantitySubmit}
              className="sm:min-w-[80px]"
              disabled={!!quantityError || !quantityInput || parseFloat(quantityInput) <= 0}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
