import { z } from 'zod';
import { mobileNumberValidation, passwordValidation } from './storeAdminSignUp';

export const storeAdminSignInSchema = z.object({
  mobileNumber: mobileNumberValidation,
  password: passwordValidation,
});
