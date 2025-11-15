import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Cookies from 'js-cookie';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get cookie value by name (client-side only)
 * Uses js-cookie for robust cookie handling with proper URL decoding
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(name) || null;
}

export const capitalizeFirstLetter = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};
