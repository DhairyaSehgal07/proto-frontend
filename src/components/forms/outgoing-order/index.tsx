'use client';

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
import { useEffect } from 'react';
import OrderNumber from '@/components/forms/order-number';
import { useOutgoingOrder } from './useOutgoingOrder';
import { StepInfo } from './step-info';
import { StepSummary } from './step-summary';
import { QuantityDialog } from './quantity-dialog';

export default function OutgoingOrderPage() {
  const {
    // State
    activeStep,
    setActiveStep,
    selectedCommodity,
    farmerStorageLinkId,
    selectedVariety,
    setSelectedVariety,
    selectedOrders,
    visibleColumns,
    quantities,
    dialogOpen,
    selectedCardKey,
    quantityInput,
    maxQuantity,
    quantityError,
    remarksRef,

    // Data
    data,
    createIncomingOrderMutation,
    farmerOrdersQuery,
    availableCommodities,
    availableVarieties,
    selectedFarmer,
    incomingOrders,
    bagSizes,
    visibleBagSizes,

    // Handlers
    handleCommodityChange,
    handleFarmerSelect,
    handleSubmit,
    handleColumnToggle,
    getOrderSizeData,
    handleOrderToggle,
    getCardKey,
    handleCardClick,
    handleQuantityInputChange,
    handleQuantitySubmit,
    handleQuantityRemove,
    handleQuickRemove,
    handleDialogClose,
  } = useOutgoingOrder();

  const steps = [
    {
      title: 'Info',
      description: 'Select farmer, commodity, and variety.',
      content: (
        <StepInfo
          farmerStorageLinkId={farmerStorageLinkId}
          selectedCommodity={selectedCommodity}
          selectedVariety={selectedVariety}
          selectedOrders={selectedOrders}
          visibleBagSizes={visibleBagSizes}
          bagSizes={bagSizes}
          visibleColumns={visibleColumns}
          quantities={quantities}
          farmerOrdersQuery={farmerOrdersQuery}
          availableCommodities={availableCommodities}
          availableVarieties={availableVarieties}
          incomingOrders={incomingOrders}
          onFarmerSelect={handleFarmerSelect}
          onCommodityChange={handleCommodityChange}
          onVarietyChange={setSelectedVariety}
          onColumnToggle={handleColumnToggle}
          onOrderToggle={handleOrderToggle}
          onCardClick={handleCardClick}
          onQuickRemove={handleQuickRemove}
          getOrderSizeData={getOrderSizeData}
          getCardKey={getCardKey}
        />
      ),
    },
    {
      title: 'Summary',
      description: 'Summary and additional notes.',
      content: (
        <StepSummary
          selectedFarmer={selectedFarmer}
          selectedCommodity={selectedCommodity}
          selectedVariety={selectedVariety}
          remarksRef={remarksRef}
          onSubmit={handleSubmit}
        />
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
      <QuantityDialog
        open={dialogOpen}
        quantityInput={quantityInput}
        quantityError={quantityError}
        maxQuantity={maxQuantity}
        selectedCardKey={selectedCardKey}
        quantities={quantities}
        onQuantityInputChange={handleQuantityInputChange}
        onQuantitySubmit={handleQuantitySubmit}
        onQuantityRemove={handleQuantityRemove}
        onClose={handleDialogClose}
      />
    </div>
  );
}
