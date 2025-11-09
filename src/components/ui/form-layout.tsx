'use client';
import { ReactNode } from 'react';
import Link from 'next/link';

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showSignInLink?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const FormLayout = ({
  title,
  subtitle,
  children,
  showSignInLink = true,
  maxWidth = 'md',
  className = '',
}: FormLayoutProps) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-green-50/30 dark:bg-gray-900 relative overflow-hidden px-4 sm:px-0">
      {/* Background pattern elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-green-500/5 dark:bg-green-400/5"></div>
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-green-500/5 dark:bg-green-400/5"></div>
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-green-500/5 dark:bg-green-400/5"></div>
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full bg-green-500/10 dark:bg-green-400/10"></div>

        {/* Additional subtle pattern elements */}
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-green-500/5 dark:bg-green-400/5"></div>
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 rounded-full bg-green-500/5 dark:bg-green-400/5"></div>
        <div className="absolute top-1/3 right-1/5 w-24 h-24 rounded-full bg-green-500/5 dark:bg-green-400/5"></div>

        {/* Decorative lines */}
        <div className="absolute top-20 left-1/2 w-[300px] h-[1px] bg-green-500/10 dark:bg-green-400/10 -rotate-45"></div>
        <div className="absolute bottom-20 right-1/2 w-[300px] h-[1px] bg-green-500/10 dark:bg-green-400/10 -rotate-45"></div>
      </div>

      <div className={`w-full ${maxWidthClasses[maxWidth]} ${className} relative z-10`}>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-600/80 dark:text-gray-300/80">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div className="space-y-6">{children}</div>

          {/* Sign In Link */}
          {showSignInLink && (
            <div className="text-center mt-8 pt-6 border-t border-green-200/50 dark:border-gray-600/50">
              <p className="text-sm text-gray-600/80 dark:text-gray-300/80">
                Already have an account?{' '}
                <Link
                  href="/sign-in"
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors duration-200 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const FormSection = ({ title, description, children, className = '' }: FormSectionProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{ step: number; label: string }>;
}

export const ProgressIndicator = ({ currentStep, totalSteps, steps }: ProgressIndicatorProps) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-2 sm:space-x-4">
        {steps.map(({ step, label }, index) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step <= currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {step}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300 mt-1 hidden sm:block">
              {label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 mt-2 transition-colors ${
                  step < currentStep ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface FormNavigationProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: (() => void) | ((e?: React.FormEvent) => void);
  isSubmitting?: boolean;
  currentStep: number;
  totalSteps: number;
  previousLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  isNextDisabled?: boolean;
}

export const FormNavigation = ({
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting = false,
  currentStep,
  totalSteps,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  submitLabel = 'Submit',
  isNextDisabled = false,
}: FormNavigationProps) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPrevious?.();
        }}
        disabled={isFirstStep}
        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
          isFirstStep
            ? 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {previousLabel}
      </button>

      {isLastStep ? (
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSubmit?.(e);
          }}
          disabled={isSubmitting || isNextDisabled}
          className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              {submitLabel}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNext?.();
          }}
          disabled={isNextDisabled}
          className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {nextLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};
