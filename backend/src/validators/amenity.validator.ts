import { z } from "zod";
import { FacilityCategory } from "../../generated/prisma/enums";

export const listAmenitiesQuerySchema = z.object({
    category: z.nativeEnum(FacilityCategory),
});