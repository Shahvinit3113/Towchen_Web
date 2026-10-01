import { z } from "zod";

export const towingEstimateSchema = z.object({
  pickupLocation: z
    .string()
    .min(2, "Please enter a valid pickup address or intersection")
    .max(250),
  dropLocation: z
    .string()
    .min(2, "Please enter a valid drop destination or workshop")
    .max(250),
  vehicleCategory: z
    .enum(["sedan", "suv", "luxury", "commercial", "motorcycle", "ev"])
    .optional(),
  serviceType: z.string().optional(),
  requiresSpecialFlatbed: z.boolean().optional(),

});

export type TowingEstimateFormData = z.infer<typeof towingEstimateSchema>;

export const bookingSubmissionSchema = z.object({
  customerName: z.string().min(2, "Please enter full name").max(80),
  customerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  pickupLocation: z.string().min(3, "Pickup location is required"),
  dropLocation: z.string().min(3, "Drop location is required"),
  vehicleCategory: z.enum([
    "sedan",
    "suv",
    "luxury",
    "commercial",
    "motorcycle",
    "ev",
  ]),
  serviceType: z.enum([
    "flatbed_towing",
    "wheel_lift_towing",
    "accident_recovery",
    "ev_towing",
    "jumpstart",
    "flat_tire",
    "fuel_delivery",
    "lockout",
    "winch_out",
  ]),
  vehicleModel: z.string().optional(),
  registrationNumber: z.string().optional(),
  notes: z.string().max(400).optional(),
});

export type BookingSubmissionFormData = z.infer<typeof bookingSubmissionSchema>;
