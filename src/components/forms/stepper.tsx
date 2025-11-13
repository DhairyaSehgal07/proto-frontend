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
import { cn } from '@/lib/utils'; // optional utility for className merging
import { useState } from 'react';

interface Step {
  title: string;
  description?: string;
  content: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  onSubmit?: () => void;
}

export function Stepper({ steps, onSubmit }: StepperProps) {
  const [activeStep, setActiveStep] = useState(0);

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

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
                <CardTitle className="text-2xl">{step.title}</CardTitle>
                {step.description && (
                  <CardDescription className="text-base mt-2">{step.description}</CardDescription>
                )}
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
                    <Button onClick={onSubmit}>Submit</Button>
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
