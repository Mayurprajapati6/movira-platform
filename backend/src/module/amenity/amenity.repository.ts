import { FacilityCategory } from "../../../generated/prisma/enums";
import { prisma } from "../../config/prisma";

export class AmenityRepository {
    static async findByCategory(category: FacilityCategory) {
        return prisma.amenity.findMany({
            where: { category },
            orderBy: { name: "asc"},
        });
    }
}