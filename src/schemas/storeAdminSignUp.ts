import { z } from 'zod';

export const mobileNumberValidation = z
  .string()
  .regex(/^\d{10}$/, 'Mobile number must be 10 digits');

export const passwordValidation = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be at most 100 characters');
