import { FacilityCategory, WeekDay } from "../../generated/prisma/enums";

export interface CreateFacilityDTO {
  name: string;
  description?: string;
  category: FacilityCategory;

  addressLine: string;
  city: string;
  state: string;
  pincode: string;

  latitude: number;
  longitude: number;

  totalCapacity: number;
  workingDays: WeekDay[];

  amenityIds: string[];
}

export interface UpdateFacilityDTO {
  name: string;
  description?: string;
  
  addressLine: string;
  city: string;
  state: string;
  pincode: string;

  latitude: number;
  longitude: number;

  totalCapacity: number;
  workingDays: WeekDay[];
  
  amenityIds: string[];
}

export interface UpdateFacilityImagesDTO {
  imagesToRemove: string[];
  newImages: string[];
}

export type MoveToDraftDTO = {
  facilityId: string;
};