import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input';

export const setBioDataValidator = z.object({
  // Required fields
  email: z.string()
    .email('Invalid email')
    .min(1, 'Email is required'),
  
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Name is too long'),
  
    phoneNumber: z.string()
    .nullable()
    .refine((value) => {
      if (!value) return true; // Allow null/empty
      return isValidPhoneNumber(value);
    }, { message: 'Invalid phone number' }),

  
  nextOfKin: z.string()
    .min(1, 'Next of kin name is required')
    .max(100, 'Name is too long')
    .nullable(),
  
  nextOfKinRelationship: z.enum([
    'Father',
    'Mother',
    'Brother',
    'Sister',
    'Son',
    'Daughter',
    'Spouse',
    'Wife',
    'Husband',
    'Uncle',
    'Aunt',
    'Cousin',
    'Nephew',
    'Niece',
    'Grandfather',
    'Grandmother',
    'Others',
  ], { 
    errorMap: () => ({ message: 'Please select a valid relationship' }) 
  })
  .nullable(),
  
  nextOfKinPhone: z.string()
  .nullable()
  .refine((value) => {
    if (!value) return true; // Allow null/empty
    return isValidPhoneNumber(value);
  }, { message: 'Invalid phone number' }),

  
  dob: z.string().nullable(),
  
  gender: z.enum(['Male', 'Female'], {
    errorMap: () => ({ message: 'Select a valid gender' })
  })
  .nullable(),
});



