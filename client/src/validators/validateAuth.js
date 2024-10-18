import { z } from "zod";

// Sign-Up Validator
export const signUpValidator = z.object({
    fullName: z.string(),
    email: z.string().email(),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[\W_]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// Login Validator
export const loginValidator = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
});


// DriverFull Registration Validator
export const driverFullRegistrationValidator = z.object({
    fullName: z.string(),
    email: z.string().email(),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[\W_]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
    licenseNumber: z.string(),
    licenseExpiry: z.string(),
    vehicleType: z.string(),
    vehicleModel: z.string(),
    vehiclePlate: z.string(),
    vehicleColor: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
});