import express from "express";
import { validateQueryParams } from "../../validators";
import { listAmenitiesQuerySchema } from "../../validators/amenity.validator";
import { AmenityController } from "./amenity.controller";

const router = express.Router();

router.get("/",validateQueryParams(listAmenitiesQuerySchema),AmenityController.list);

export default router;