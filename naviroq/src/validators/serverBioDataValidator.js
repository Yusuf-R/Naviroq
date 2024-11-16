// bioDataValidator.js
import { z } from 'zod';

export const clientBioDataValidator = z.object({
    email: z.string().email(),
    fullName: z.string().min(1),
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/), // Basic regex for phone number without `react-phone-number-input`
    nextOfKin: z.string().min(1),
    nextOfKinRelationship: z.string().min(1),
    nextOfKinPhone: z.string().regex(/^\+[1-9]\d{1,14}$/),
    dob: z.string(),
    gender: z.enum(["Male", "Female", "Other"]),
});


export const driverBioDataValidator = z.object({
    email: z.string().email(),
    fullName: z.string().min(1),
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/), // Basic regex for phone number without `react-phone-number-input`
    nextOfKin: z.string().min(1),
    nextOfKinRelationship: z.string().min(1),
    nextOfKinPhone: z.string().regex(/^\+[1-9]\d{1,14}$/),
    dob: z.string(),
    gender: z.enum(["Male", "Female", "Other"]),
    // Vehicle Details
    vehicleType: z.enum(['Bus', 'Keke-Napep', 'Car', 'Others']).optional(),
    vehiclePlateNumber: z.string().optional(),
    driverLicenseNumber: z.string().optional(),
    vehicleModel: z.string().optional(),

    vehicleColor: z.enum([
        'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Silver', 'Grey', 'Others'
    ]).optional(),
    customVehicleColor: z.string().optional(),
    vehicleYear: z.string().optional(),
    vehicleCondition: z.enum(['New', 'Good', 'Fair', 'Needs Maintenance']).optional(),
    vehicleImage: z.array(z.string().url('Invalid URL format')).optional(),

    // Insurance Details
    insuranceNumber: z.string().optional(),
    insuranceExpiryDate: z.date().optional(),

    // Availability and Current Location
    availabilityStatus: z.enum(['Online', 'Busy', 'Offline']).default('Offline'),
    currentLocation: z.object({
        latitude: z.number().nullable(),
        longitude: z.number().nullable(),
    }).optional(),
    lastActive: z.date().optional(),
    workingHours: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
    }).optional(),

    // Profile Verification and Reviews
    profileVerificationStatus: z.enum(['Pending', 'Verified', 'Rejected']).default('Pending'),
    documents: z.array(z.object({
        name: z.string().min(1, 'Document name is required'),
        url: z.string().url('Invalid URL format'),
        verified: z.boolean().optional().default(false),
    })).optional(),

    ratings: z.number().min(0).max(5).optional(),
    reviews: z.array(z.object({
        text: z.string().min(1, 'Review text is required'),
        rating: z.number().min(1).max(5),
        date: z.date().optional(),
    })).optional(),

    // Payment and Ride Completion Details
    ridesCompleted: z.number().nonnegative().optional(),
    bankAccount: z.object({
        accName: z.string().optional(),
        bankName: z.string().optional(),
        accountNumber: z.string().optional(),
    }).optional(),
    paymentStatus: z.enum(['Pending', 'Paid', 'Hold']).default('Pending'),
})
    .superRefine((data, context) => {
        // Ensure custom color is provided if 'Others' is selected for vehicleColor
        if (data.vehicleColor === 'Others' && (!data.customVehicleColor || data.customVehicleColor.trim() === "")) {
            context.addIssue({
                path: ['customVehicleColor'],
                message: "Custom vehicle color is required when 'Others' is selected."
            });
        }
    });
