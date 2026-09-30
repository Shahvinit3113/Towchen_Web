import { z } from "zod";

export const dealerLoginSchema = z.object({
  email: z.string().email("Please enter a valid business email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type DealerLoginFormData = z.infer<typeof dealerLoginSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email("Please enter your admin email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export const vehicleRegistrationSchema = z.object({
  registrationNumber: z
    .string()
    .min(5, "Enter valid registration (e.g. DL01AB1234)")
    .max(15)
    .toUpperCase(),
  vinOrChassis: z.string().min(6, "VIN / Chassis number is required"),
  make: z.string().min(2, "Car make is required (e.g. Hyundai, Tata, Honda)"),
  model: z.string().min(1, "Car model is required (e.g. Creta, Nexon, City)"),
  year: z
    .number()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  category: z.enum(["sedan", "suv", "luxury", "commercial", "motorcycle", "ev"]),
  assignedPackageId: z.string().optional(),
});

export type VehicleRegistrationFormData = z.infer<typeof vehicleRegistrationSchema>;

export const payoutRequestSchema = z.object({
  amount: z
    .number()
    .min(500, "Minimum payout request is ₹500")
    .max(500000, "Maximum payout per request is ₹5,00,000"),
  accountHolderName: z.string().min(3, "Account holder name is required"),
  accountNumber: z.string().min(8, "Valid bank account number required"),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid 11-digit IFSC code"),
  bankName: z.string().min(2, "Bank name is required"),
});

export type PayoutRequestFormData = z.infer<typeof payoutRequestSchema>;
