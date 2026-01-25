import { Response } from "express";
import { AuthRequest } from "../../middlewares/types";
import { FacilityService } from "./facility.service";
import { StatusCodes } from "http-status-codes";

export class FacilityController {

    static async create(req: AuthRequest, res: Response) {
        const result = await FacilityService.create(
            req.user!.userId,
            req.body,
            req.body.images
        );

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Facility created successfully",
            data: result,
        });
    }

    static async submit(req: AuthRequest, res: Response) {
        await FacilityService.submit(
            req.user!.userId,
            req.params.facilityId
        );

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Facility submitted for approval",
        });
    }

    static async update(req: AuthRequest, res: Response) {
        await FacilityService.update(
            req.user!.userId,
            req.params.facilityId,
            req.body
        );

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Facility updated successfully",
        });
    }

    static async updateImages(req: AuthRequest, res: Response) {
        await FacilityService.updateImages(
            req.user!.userId,
            req.params.facilityId,
            req.body
        );

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Facility images updated successfully",
        });
    }

    static async moveToDraft(req: AuthRequest, res: Response) {
        await FacilityService.moveToDraft(
            req.user!.userId,
            req.params.facilityId
        );

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Facility moved to draft. You can now make changes.",
        });
    }

    static async delete(req: AuthRequest, res: Response) {
        await FacilityService.delete(
            req.user!.userId,
            req.params.facilityId
        );

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Facility deleted successfully",
        });
    }

    // admin operations

    static async listPending(req: AuthRequest, res: Response) {
        const facilities = await FacilityService.listPending();

        res.status(StatusCodes.OK).json({
            success: true,
            count: facilities.length,
            data: facilities,
        });
    }

    static async getFacilityChanges(req: AuthRequest, res: Response) {
        const diff = await FacilityService.getFacilityChanges(
            req.params.facilityId
        );

        res.status(StatusCodes.OK).json({
            success: true,
            data: diff,
        });
    }

    static async approve(req: AuthRequest, res: Response) {
        await FacilityService.approve(req.params.facilityId, req.user!.userId);

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Facility approved and published successfully",
        });
    }

    static async reject(req: AuthRequest, res: Response) {
        await FacilityService.reject(
            req.params.facilityId,
            req.body.reason,
            req.user!.userId
        );

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Facility rejected and moved to draft",
        });
    }

}