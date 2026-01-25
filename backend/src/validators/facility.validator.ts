import { z } from "zod";
import { FacilityCategory, WeekDay } from "../../generated/prisma/enums";

export const createFacilitySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  category: z.nativeEnum(FacilityCategory),

  addressLine: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),

  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),

  totalCapacity: z.number().positive().int(),
  workingDays: z.array(z.nativeEnum(WeekDay)).min(1),

  amenityIds: z.array(z.string().cuid()).min(1),
  images: z.array(z.string()).min(3).max(10),
});

export const updateFacilitySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),

  addressLine: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),

  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),

  totalCapacity: z.number().positive().int(),
  workingDays: z.array(z.nativeEnum(WeekDay)).min(1),

  amenityIds: z.array(z.string().cuid()).min(1),
  
});

export const updateFacilityImagesSchema = z.object({
  imagesToRemove: z.array(z.string()).optional().default([]),
  newImages: z.array(z.string()).optional().default([]),
}).refine(
  (data) => {
    return data.imagesToRemove.length > 0 || data.newImages.length > 0;
  },
  {
    message: "Must specify images to remove or add",
  }
)

export const rejectFacilitySchema = z.object({
    reason: z.string().min(10, "Rejection reason must be at least 10 characters")
});