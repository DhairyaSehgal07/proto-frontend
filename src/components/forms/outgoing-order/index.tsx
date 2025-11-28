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
import { CommoditySelector } from '@/components/forms/commodity-selector';
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
import { MapPin } from 'lucide-react';

export default function OutgoingOrderPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [farmerStorageLinkId, setFarmerStorageLinkId] = useState<string>('');
  const [selectedVariety, setSelectedVariety] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const { coldStorage } = useStore();

  const { data } = useGetGatePassNumber((selectedCommodity as Commodity) || undefined, 'outgoing');
  const createIncomingOrderMutation = useCreateIncomingOrder();
  const farmersQuery = useGetAllFarmers();
  const farmerOrdersQuery = useGetOrdersOfFarmer({
    farmerStorageLinkId,
    type: 'incoming',
    enabled: !!farmerStorageLinkId,
  });

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
    setSelectedCommodity(commodity);
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
                  }}
                />
              </div>
            </div>
          </div>

          <CommoditySelector onSelect={handleCommodityChange} />

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
                <CardTitle className="text-xl">Incoming Orders</CardTitle>
                <CardDescription>
                  {selectedCommodity
                    ? selectedVariety
                      ? `Showing orders for ${selectedCommodity} - ${selectedVariety}`
                      : `Showing orders for ${selectedCommodity}`
                    : 'Select a commodity to view orders by bag size'}
                </CardDescription>
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">R. Voucher</TableHead>
                            {bagSizes.map((size) => (
                              <TableHead key={size}>{size}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {incomingOrders.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={bagSizes.length + 1}
                                className="text-center text-muted-foreground"
                              >
                                No incoming orders found
                              </TableCell>
                            </TableRow>
                          ) : (
                            incomingOrders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={selectedOrders.has(order.id)}
                                      onCheckedChange={() => handleOrderToggle(order.id)}
                                    />
                                    <span className="font-semibold">#{order.gatePassNumber}</span>
                                  </div>
                                </TableCell>
                                {bagSizes.map((size) => {
                                  const sizeData = getOrderSizeData(order, size);
                                  return (
                                    <TableCell key={size}>
                                      {sizeData.length === 0 ? (
                                        <div className="h-16 bg-muted rounded-md border border-border" />
                                      ) : (
                                        <div className="space-y-2">
                                          {sizeData.map((data, idx) => (
                                            <div
                                              key={idx}
                                              className={cn(
                                                'p-2 rounded-md border',
                                                selectedOrders.has(order.id)
                                                  ? 'bg-primary/10 border-primary'
                                                  : 'bg-card border-border'
                                              )}
                                            >
                                              <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-xs text-muted-foreground truncate">
                                                    {data.variety}
                                                  </p>
                                                  <div className="flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3 text-destructive shrink-0" />
                                                    <p className="text-xs text-muted-foreground truncate">
                                                      {data.location}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                  <p className="text-base font-bold">
                                                    {data.quantityCurr.toFixed(1)}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    /{data.quantityInit.toFixed(1)}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
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
    <div className="flex w-full max-w-3xl flex-col gap-8 mx-auto px-4">
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
    </div>
  );
}
