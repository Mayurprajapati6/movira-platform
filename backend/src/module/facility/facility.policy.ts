import { BadRequestError, ForbiddenError } from "../../utils/errors/app.error";
import { FacilityEntity } from "./facility.types";

export class FacilityPolicy {

    static assertOwner(facility: FacilityEntity, ownerId: string) {
        if (facility.ownerId !== ownerId) {
            throw new ForbiddenError("Not your facility");
        }
    }

    static assertDraft(facility: FacilityEntity) {
        if (facility.lifecycleStatus !== "DRAFT") {
            throw new BadRequestError("Only draft facilities can be modified");
        }
    }

    static assertPending(facility: FacilityEntity) {
        if (facility.lifecycleStatus !== "PENDING_REVIEW") {
            throw new BadRequestError("Facility is not pending approval");
        }
    }

    static canMoveToDraft(facility: FacilityEntity) {
        if (facility.lifecycleStatus === "DRAFT") {
            throw new BadRequestError("Facility is already in draft");
        }

        if (facility.approvalStatus === "PENDING") {
            throw new BadRequestError("Cannot move to draft while pending admin review");
        }

        // Once active, owner can move back to draft for updates
        // This is allowed as per your workflow
    }

    static canDelete(facility: FacilityEntity) {
        // Only draft or rejected facilities can be deleted
        if (
            facility.lifecycleStatus !== "DRAFT" &&
            facility.approvalStatus !== "REJECTED"
        ) {
            throw new BadRequestError("Only draft or rejected facilities can be deleted");
        }
    }

    static canSubmit(facility: FacilityEntity) {
        if (facility.lifecycleStatus !== "DRAFT") {
            throw new BadRequestError("Only draft facilities can be submitted");
        }

        if (facility.approvalStatus === "PENDING") {
            throw new BadRequestError("Facility is already pending approval");
        }
    }

    // FUTURE (BOOKING AWARE)
    // static canUpdate(facility: FacilityEntity, hasActiveBookings: boolean) {
    //     if (hasActiveBookings) {
    //         throw new BadRequestError("Cannot update facility with active bookings");
    //     }
    // }
    
    // static canDelete(facility: FacilityEntity, bookingCount: number) {
    //     if (bookingCount > 0) {
    //         throw new BadRequestError("Facility with bookings cannot be deleted");
    //     }
    // }
}