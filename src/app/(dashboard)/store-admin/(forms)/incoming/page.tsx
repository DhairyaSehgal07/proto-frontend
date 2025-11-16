'use client';

import { AddFarmerModal, FarmerSearch, DatePicker } from '@/components/forms';
import { VarietyEntry } from '@/components/forms/variety-entry';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStore } from '@/store';
import { Plus } from 'lucide-react';
import OrderNumber from '@/components/forms/order-number';
import { CommoditySelector } from '@/components/forms/commodity-selector';

interface VarietyData {
  id: string;
  variety: string;
  quantities: Record<string, string>;
  customMarka: Record<string, string>;
  locations: Record<string, { chamber: string; floor: string; row: string }>;
}

interface SubmittedFormData {
  farmer: string;
  orderDate: string;
  remarks: string;
  varieties: Array<{
    variety: string;
    quantities: Record<string, string>;
    customMarka: Record<string, string>;
    locations: Record<string, { chamber: string; floor: string; row: string }>;
  }>;
}

export default function IncomingOrderPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [submittedData, setSubmittedData] = useState<SubmittedFormData | null>(null);
  const [isNullVoucher, setIsNullVoucher] = useState(false);
  const [showNullVoucherDialog, setShowNullVoucherDialog] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const remarksRef = useRef<HTMLTextAreaElement>(null);
  const varietyIdCounterRef = useRef(1);
  const { coldStorage } = useStore();

  // Get sizes based on selected commodity
  const sizes = useMemo(() => {
    if (!selectedCommodity) return [];
    return (
      coldStorage?.preferences?.commodities?.find((c) => c.name === selectedCommodity)?.sizes ?? []
    );
  }, [coldStorage?.preferences?.commodities, selectedCommodity]);

  // Get showCustomMarka preference
  const showCustomMarka = useMemo(() => {
    return coldStorage?.preferences?.incoming?.showCustomMarka ?? false;
  }, [coldStorage?.preferences?.incoming?.showCustomMarka]);

  // Get available varieties from preferences
  const availableVarieties = useMemo(() => {
    return coldStorage?.preferences?.varieties ?? [];
  }, [coldStorage?.preferences?.varieties]);

  // Generate a stable ID for variety entries
  const generateVarietyId = useCallback(() => {
    const id = `variety-${varietyIdCounterRef.current}`;
    varietyIdCounterRef.current += 1;
    return id;
  }, []);

  // State for managing multiple varieties
  const [varieties, setVarieties] = useState<VarietyData[]>(() => {
    // Initialize with one empty variety entry using a stable ID
    return [
      {
        id: 'variety-0',
        variety: '',
        quantities: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        customMarka: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        locations: sizes.reduce(
          (acc, size) => ({
            ...acc,
            [size]: { chamber: '', floor: '', row: '' },
          }),
          {}
        ),
      },
    ];
  });

  // Add a new variety entry
  const handleAddVariety = useCallback(() => {
    setVarieties((prev) => [
      ...prev,
      {
        id: generateVarietyId(),
        variety: '',
        quantities: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        customMarka: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        locations: sizes.reduce(
          (acc, size) => ({
            ...acc,
            [size]: { chamber: '', floor: '', row: '' },
          }),
          {}
        ),
      },
    ]);
  }, [sizes, generateVarietyId]);

  // Remove a variety entry
  const handleRemoveVariety = useCallback((id: string) => {
    setVarieties((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // Update variety selection
  const handleVarietyChange = useCallback((id: string, variety: string) => {
    setVarieties((prev) => prev.map((v) => (v.id === id ? { ...v, variety } : v)));
  }, []);

  // Update quantity for a specific variety and size
  const handleQuantityChange = useCallback((id: string, size: string, quantity: string) => {
    setVarieties((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, quantities: { ...v.quantities, [size]: quantity } } : v
      )
    );
  }, []);

  // Update custom marka for a specific variety and size
  const handleCustomMarkaChange = useCallback((id: string, size: string, customMarka: string) => {
    setVarieties((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, customMarka: { ...v.customMarka, [size]: customMarka } } : v
      )
    );
  }, []);

  // Update location for a specific variety and size
  const handleLocationChange = useCallback(
    (id: string, size: string, field: 'chamber' | 'floor' | 'row', value: string) => {
      setVarieties((prev) =>
        prev.map((v) =>
          v.id === id
            ? {
                ...v,
                locations: {
                  ...v.locations,
                  [size]: {
                    ...v.locations[size],
                    [field]: value,
                  },
                },
              }
            : v
        )
      );
    },
    []
  );

  // Handle commodity selection and reset varieties
  const handleCommodityChange = useCallback(
    (commodity: string) => {
      setSelectedCommodity(commodity);
      // Reset varieties when commodity changes
      const newSizes =
        coldStorage?.preferences?.commodities?.find((c) => c.name === commodity)?.sizes ?? [];
      setVarieties([
        {
          id: 'variety-0',
          variety: '',
          quantities: newSizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
          customMarka: newSizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
          locations: newSizes.reduce(
            (acc, size) => ({
              ...acc,
              [size]: { chamber: '', floor: '', row: '' },
            }),
            {}
          ),
        },
      ]);
      varietyIdCounterRef.current = 1;
    },
    [coldStorage?.preferences?.commodities]
  );

  // Handle Create Null Voucher confirmation
  const handleConfirmNullVoucher = useCallback(() => {
    // Reset all form values
    setVarieties([
      {
        id: 'variety-0',
        variety: '',
        quantities: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        customMarka: sizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
        locations: sizes.reduce(
          (acc, size) => ({
            ...acc,
            [size]: { chamber: '', floor: '', row: '' },
          }),
          {}
        ),
      },
    ]);

    // Clear commodity selection
    setSelectedCommodity('');

    // Clear farmer selection (if possible via DOM)
    const farmerSearchButton = document.getElementById('farmer-search');
    if (farmerSearchButton) {
      farmerSearchButton.textContent = 'Select farmer...';
    }

    // Clear date
    const dateInput = document.getElementById('date') as HTMLInputElement;
    if (dateInput) {
      dateInput.value = '';
    }

    // Set null voucher mode and navigate to Summary tab
    setIsNullVoucher(true);
    setActiveStep(1);
    setShowNullVoucherDialog(false);
  }, [sizes]);

  const handleSubmit = useCallback(() => {
    // Collect all form data
    const formData: SubmittedFormData = {
      farmer: '',
      orderDate: '',
      remarks: '',
      varieties: [],
    };

    // Get farmer selection
    const farmerSearchButton = document.getElementById('farmer-search');
    const selectedFarmer = farmerSearchButton?.textContent?.trim() || 'Not selected';

    // Get date
    const dateInput = document.getElementById('date') as HTMLInputElement;
    const orderDate = dateInput?.value || 'Not selected';

    // Get remarks
    const remarks = remarksRef.current?.value || '';

    // Compile all data with multiple varieties
    formData.farmer = selectedFarmer;
    formData.orderDate = orderDate;
    formData.remarks = remarks;
    formData.varieties = varieties.map((v) => ({
      variety: v.variety || 'Not selected',
      quantities: v.quantities,
      customMarka: v.customMarka,
      locations: v.locations,
    }));

    // Set submitted data to display
    setSubmittedData(formData);
  }, [varieties]);

  const steps = [
    {
      title: 'Info',
      description: 'Farmer details, varieties, quantities and location information.',
      content: (
        <div className={cn('space-y-8', isNullVoucher && 'pointer-events-none opacity-50')}>
          <CommoditySelector onSelect={handleCommodityChange} disabled={isNullVoucher} />
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
          <DatePicker />

          {/* Varieties Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Varieties</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Add one or more varieties with their quantities and locations
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariety}
                className="gap-2"
                disabled={isNullVoucher}
              >
                <Plus className="h-4 w-4" />
                Add Variety
              </Button>
            </div>
            <div className="space-y-6">
              {varieties.map((varietyData, index) => (
                <VarietyEntry
                  key={varietyData.id}
                  index={index}
                  varietyId={varietyData.id}
                  variety={varietyData.variety}
                  commodity={selectedCommodity}
                  sizes={sizes}
                  showCustomMarka={showCustomMarka}
                  varieties={availableVarieties}
                  onRemove={handleRemoveVariety}
                  onVarietyChange={handleVarietyChange}
                  onQuantityChange={handleQuantityChange}
                  onCustomMarkaChange={handleCustomMarkaChange}
                  onLocationChange={handleLocationChange}
                  quantities={varietyData.quantities}
                  customMarka={varietyData.customMarka}
                  locations={varietyData.locations}
                  onLastFieldEnter={() => {
                    // Move to next step when Enter is pressed on last field of last variety
                    if (index === varieties.length - 1) {
                      setActiveStep(1);
                    }
                  }}
                  canRemove={varieties.length > 1}
                  disabled={isNullVoucher}
                />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Summary',
      description: 'Summary and additional notes.',
      content: (
        <div className="space-y-8">
          {isNullVoucher && (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Caution: This voucher will be marked as null. Please add remarks or notes for
                    this voucher.
                  </p>
                </div>
              </div>
            </div>
          )}
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
    // Small delay to ensure DOM is ready after step change
    const timer = setTimeout(() => {
      if (activeStep === 0) {
        // Focus on farmer search button
        const farmerSearchButton = document.getElementById('farmer-search');
        if (farmerSearchButton) {
          farmerSearchButton.focus();
        }
      } else if (activeStep === 1) {
        // Focus on remarks field
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
              onClick={() => {
                if (!isNullVoucher || i === 1) {
                  setActiveStep(i);
                }
              }}
              disabled={isNullVoucher && i === 0}
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
                  {/* Left side: Order info */}
                  <div className="flex flex-col">
                    <OrderNumber type="Receipt" name="Voucher" />
                    <CardTitle className="text-2xl mt-2">{step.title}</CardTitle>
                    {step.description && (
                      <CardDescription className="text-base mt-1">
                        {step.description}
                      </CardDescription>
                    )}
                  </div>

                  {/* Right side: Action */}
                  {activeStep === 0 && (
                    <Button variant="secondary" onClick={() => setShowNullVoucherDialog(true)}>
                      Create Null Voucher
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6">{step.content}</CardContent>

              <CardFooter className="flex justify-between items-center pt-6 border-t">
                <div>
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveStep((s) => s - 1)}
                      disabled={isNullVoucher}
                    >
                      Back
                    </Button>
                  )}
                </div>
                <div>
                  {isLastStep ? (
                    <Button onClick={handleSubmit}>Submit</Button>
                  ) : (
                    <Button onClick={() => setActiveStep((s) => s + 1)} disabled={isNullVoucher}>
                      Next
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Display submitted data */}
      {submittedData && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Submitted Form Data</CardTitle>
            <CardDescription>All the details you entered:</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Null Voucher Confirmation Dialog */}
      <AlertDialog open={showNullVoucherDialog} onOpenChange={setShowNullVoucherDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Null Voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all form data and create a null voucher. All information fields will
              be disabled, and you will be redirected to the Summary tab to add remarks. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNullVoucher}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
