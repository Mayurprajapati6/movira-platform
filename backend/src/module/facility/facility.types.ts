import { Prisma } from "../../../generated/prisma/client";
import { FacilityApprovalStatus, FacilityCategory, FacilityLifecycleStatus, WeekDay } from "../../../generated/prisma/enums";

export type FacilityWithRelations = Prisma.FacilityGetPayload<{
  include: {
    images: true;
    amenities: {
      include: {
        amenity: true;
      };
    };
    owner: {
      select: {
        id: true;
        email: true;
        name: true;
      };
    };
  };
}>;

export type CreateFacilityInput = {
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
};

export type FacilityImageInput = {
  imageUrl: string;
  publicId: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  isPrimary: boolean;
  sortOrder?: number;
};

export type FacilityResponse = {
  id: string;
  name: string;
  category: FacilityCategory;
  lifecycleStatus: FacilityLifecycleStatus;
  isPublished: boolean;
};

export type FacilityEditableFields = {
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
};

export type FacilityEntity = {
  id: string;
  ownerId: string;
  category: FacilityCategory;
  lifecycleStatus: FacilityLifecycleStatus;
  approvalStatus: FacilityApprovalStatus;
  isPublished: boolean;
  approvedAt: Date | null;
};

export type FacilityChangeLog = {
  id: string;
  facilityId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: Date;
}

export type FacilityDiffView = {
  facilityId: string;
  facilityName: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  submittedAt: Date;
  isFirstSubmission: boolean;
  changes: {
    field: string;
    label: string;
    oldValue: any;
    newValue: any;
    changeType: 'added' | 'modified' | 'removed';
  }[];
  imageChanges?: {
    added: FacilityImageInput[];
    removed: FacilityImageInput[];
  };
  currentData: FacilityWithRelations;
  previousData: any;
};

export function toFacilityEntity(facility: FacilityWithRelations): FacilityEntity {
  return {
    id: facility.id,
    ownerId: facility.ownerId,
    category: facility.category,
    lifecycleStatus: facility.lifecycleStatus,
    approvalStatus: facility.approvalStatus,
    isPublished: facility.isPublished,
    approvedAt: (facility as any).approvedAt ?? null,
  };
}