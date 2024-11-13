// bioDataValidator.js
import { z } from 'zod';

export const beBioDataValidator = z.object({
    email: z.string().email(),
    fullName: z.string().min(1),
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/), // Basic regex for phone number without `react-phone-number-input`
    nextOfKin: z.string().min(1),
    nextOfKinRelationship: z.string().min(1),
    nextOfKinPhone: z.string().regex(/^\+[1-9]\d{1,14}$/),
    dob: z.string(),
    gender: z.enum(["Male", "Female", "Other"]),
});
