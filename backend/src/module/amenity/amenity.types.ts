import { FacilityCategory } from "../../../generated/prisma/enums";

export type AmenityResponse = {
  id: string;
  name: string;
  category: FacilityCategory;
};
