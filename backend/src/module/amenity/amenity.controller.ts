import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AmenityService } from "./amenity.service";
import { FacilityCategory } from "../../../generated/prisma/enums";


export class AmenityController {
  static async list(req: Request, res: Response) {
    const category = req.query.category as FacilityCategory;

    const amenities = await AmenityService.listByCategory(category);

    res.status(StatusCodes.OK).json({
      success: true,
      data: amenities,
    });
  }
}
