import { AmenityRepository } from "./amenity.repository";
import { BadRequestError } from "../../utils/errors/app.error";
import { AmenityResponse } from "./amenity.types";
import { FacilityCategory } from "../../../generated/prisma/enums";

export class AmenityService {
  static async listByCategory(category: FacilityCategory): Promise<AmenityResponse[]> {
    if (!category) {
      throw new BadRequestError("Category is required");
    }

    const amenities = await AmenityRepository.findByCategory(category);

    return amenities.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
    }));
  }
}
