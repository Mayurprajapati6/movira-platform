import { CreateFacilityDTO, UpdateFacilityDTO, UpdateFacilityImagesDTO } from "../../dto/facility.dto";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utils/errors/app.error";
import { bulkDeleteFromCloudinary, deleteFromCloudinary, uploadImage } from "../../utils/helpers/cloudinary";
import { AmenityRepository } from "../amenity/amenity.repository";
import { FacilityPolicy } from "./facility.policy";
import { FacilityRepository } from "./facility.repository";
import { FacilityDiffView, toFacilityEntity } from "./facility.types";

export class FacilityService {

    static async create(ownerId: string, dto: CreateFacilityDTO, files: string[]) {
        if (files.length < 3 || files.length > 10) {
            throw new BadRequestError("Images must be between 3 and 10");
        }

        const amenities = await AmenityRepository.findByCategory(dto.category);
        const validAmenityIds = amenities.map((a) => a.id);

        const invalid = dto.amenityIds.filter((id) => !validAmenityIds.includes(id));

        if (invalid.length) {
            throw new BadRequestError("Invalid amenities selected for this category");
        }

        const facility = await FacilityRepository.create(ownerId, dto);

        const uploads = await Promise.all(
            files.map((file) => uploadImage(file, 'FACILITIES'))
        );

        const images = uploads.map((u, idx) => ({
            imageUrl: u.secure_url,
            publicId: u.public_id,
            thumbnailUrl: u.thumbnail_url,
            mediumUrl: u.medium_url,
            isPrimary: idx === 0,
            sortOrder: idx,
        }));

        await FacilityRepository.addImages(facility.id, images);
        await FacilityRepository.attachAmenities(facility.id, dto.amenityIds);
        await FacilityRepository.createHistorySnapshot(facility.id, "CREATED", ownerId);

        return { facilityId: facility.id };
    }

    static async submit(ownerId: string, facilityId: string) {
        const facility = await FacilityRepository.findById(facilityId);

        if (!facility) {
            throw new NotFoundError("Facility not found");
        }

        if (facility.ownerId !== ownerId) {
            throw new ForbiddenError("Not allowed");
        }

        const facilityEntity = toFacilityEntity(facility);
        FacilityPolicy.canSubmit(facilityEntity);

        await FacilityRepository.createHistorySnapshot(facilityId, "SUBMITTED", ownerId);
        await FacilityRepository.updateStatus(facilityId, "PENDING_REVIEW", "PENDING", false);
    }

    static async update(ownerId: string, facilityId: string, payload: UpdateFacilityDTO) {

        const facility = await FacilityRepository.findById(facilityId);

        if (!facility) {
            throw new NotFoundError("Facility not found");
        }

        const facilityEntity = toFacilityEntity(facility);
        FacilityPolicy.assertOwner(facilityEntity, ownerId);
        FacilityPolicy.assertDraft(facilityEntity);

        const amenities = await AmenityRepository.findByCategory(facility.category);
        const validAmenityIds = amenities.map((a) => a.id);

        const invalid = payload.amenityIds.filter((id) => !validAmenityIds.includes(id));

        if (invalid.length) {
            throw new BadRequestError("Invalid amenities selected for this category");
        }

        await FacilityRepository.updateDraft(facilityId, payload);
        await FacilityRepository.createHistorySnapshot(facilityId, "UPDATED", ownerId);
    }

    static async updateImages(
        ownerId: string,
        facilityId: string,
        payload: UpdateFacilityImagesDTO
    ) {
        const facility = await FacilityRepository.findById(facilityId);

        if (!facility) {
            throw new NotFoundError("Facility not found");
        }

        const facilityEntity = toFacilityEntity(facility);
        FacilityPolicy.assertOwner(facilityEntity, ownerId);
        FacilityPolicy.assertDraft(facilityEntity);

        const currentImageCount = await FacilityRepository.getFacilityImageCount(facilityId);
        const finalImageCount =
            currentImageCount - payload.imagesToRemove.length + payload.newImages.length;

        if (finalImageCount < 3 || finalImageCount > 10) {
            throw new BadRequestError(
                `Final image count must be between 3 and 10. Current: ${currentImageCount}, After changes: ${finalImageCount}`
            );
        }

        if (payload.imagesToRemove.length > 0) {
            const imagesToRemove = await FacilityRepository.getImagesByPublicIds(
                payload.imagesToRemove
            );

            const invalidImages = imagesToRemove.filter(
                (img) => img.facilityId !== facilityId
            );

            if (invalidImages.length > 0) {
                throw new BadRequestError("Some images don't belong to this facility");
            }
        }

       
        if (payload.imagesToRemove.length > 0) {
            await FacilityRepository.removeImages(payload.imagesToRemove);
            await bulkDeleteFromCloudinary(payload.imagesToRemove);
        }

        
        if (payload.newImages.length > 0) {
            const uploads = await Promise.all(
                payload.newImages.map((file) => uploadImage(file, 'FACILITIES'))
            );

            const images = uploads.map((u, idx) => ({
                imageUrl: u.secure_url,
                publicId: u.public_id,
                thumbnailUrl: u.thumbnail_url,
                mediumUrl: u.medium_url,
                isPrimary: currentImageCount === 0 && idx === 0, // First image if none exist
                sortOrder: currentImageCount + idx,
            }));

            await FacilityRepository.addImages(facilityId, images);
        }

        await FacilityRepository.createHistorySnapshot(
            facilityId,
            "IMAGES_UPDATED",
            ownerId
        );
    }

    static async moveToDraft(ownerId: string, facilityId: string) {
        const facility = await FacilityRepository.findById(facilityId);

        if (!facility) {
            throw new NotFoundError("Facility not found");
        }

        const facilityEntity = toFacilityEntity(facility);
        FacilityPolicy.assertOwner(facilityEntity, ownerId);
        FacilityPolicy.canMoveToDraft(facilityEntity);

        await FacilityRepository.moveToDraft(facilityId);
    }

    static async delete(ownerId: string, facilityId: string) {
        const facility = await FacilityRepository.findById(facilityId);

        if (!facility) {
            throw new NotFoundError("Facility not found");
        }

        const facilityEntity = toFacilityEntity(facility);
        FacilityPolicy.assertOwner(facilityEntity, ownerId);
        FacilityPolicy.canDelete(facilityEntity);

        const images = await FacilityRepository.deleteFacility(facilityId);
        const publicIds = images.map((img) => img.publicId).filter(Boolean);

        if (publicIds.length > 0) {
            await bulkDeleteFromCloudinary(publicIds);
        }
    }

    // admin operations
    static async listPending() {
        return FacilityRepository.listPendingApproval();
    }

    static async getFacilityChanges(facilityId: string): Promise<FacilityDiffView> {
        const { current, previous, isFirstSubmission } =
            await FacilityRepository.getFacilityWithChanges(facilityId);

        if (!current) {
            throw new NotFoundError("Facility not found");
        }

        if (current.approvalStatus !== "PENDING") {
            throw new BadRequestError("Facility is not pending approval");
        }

        if (isFirstSubmission) {
            return {
                facilityId: current.id,
                facilityName: current.name,
                owner: current.owner,
                submittedAt: current.updatedAt,
                isFirstSubmission: true,
                changes: [],
                currentData: current,
                previousData: null,
            };
        }

        const changes = this.generateDiff(previous, current);
        const imageChanges = this.generateImageDiff(previous, current);

        return {
            facilityId: current.id,
            facilityName: current.name,
            owner: current.owner,
            submittedAt: current.updatedAt,
            isFirstSubmission: false,
            changes,
            imageChanges,
            currentData: current,
            previousData: previous,
        };
    }

    private static generateDiff(oldData: any, newData: any) {
        const changes: FacilityDiffView['changes'] = [];

        const fieldsToCompare = [
            { key: 'name', label: 'Facility Name' },
            { key: 'description', label: 'Description' },
            { key: 'addressLine', label: 'Address' },
            { key: 'city', label: 'City' },
            { key: 'state', label: 'State' },
            { key: 'pincode', label: 'Pincode' },
            { key: 'latitude', label: 'Latitude' },
            { key: 'longitude', label: 'Longitude' },
            { key: 'totalCapacity', label: 'Total Capacity' },
            { key: 'workingDays', label: 'Working Days' },
        ];

        for (const field of fieldsToCompare) {
            const oldValue = oldData?.[field.key];
            const newValue = newData[field.key];

            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                let changeType: 'added' | 'modified' | 'removed';

                if (!oldValue && newValue) {
                    changeType = 'added';
                } else if (oldValue && !newValue) {
                    changeType = 'removed';
                } else {
                    changeType = 'modified';
                }

                changes.push({
                    field: field.key,             
                    label: field.label,
                    oldValue,
                    newValue,
                    changeType,
                });
            }
        }

        const oldAmenities = oldData?.amenities?.map((a: any) => a.amenity.name).sort() || [];
        const newAmenities = newData.amenities?.map((a: any) => a.amenity.name).sort() || [];

        if (JSON.stringify(oldAmenities) !== JSON.stringify(newAmenities)) {
            changes.push({
                field: 'amenities',
                label: 'Amenities',
                oldValue: oldAmenities,
                newValue: newAmenities,
                changeType: 'modified',
            });
        }

        return changes;
    }
    
    private static generateImageDiff(oldData: any, newData: any) {
        const oldImages = oldData?.images || [];
        const newImages = newData?.image || [];

        const oldPublicIds = new Set(oldImages.map((img: any) => img.publicId));
        const newPublicIds = new Set(newImages.map((img: any) => img.publicId));

        const added = newImages.filter((img: any) => !oldPublicIds.has(img.publicId));
        const removed = oldImages.filter((img: any) => !newPublicIds.has(img.publicId));

        if(added.length === 0 && removed.length === 0) {
            return undefined;
        } 

        return { added, removed };
    }
    
    static async approve(facilityId: string, adminId: string) {
        const facility = await FacilityRepository.findById(facilityId);

        if (!facility) {
            throw new NotFoundError("Facility not found");
        }

        if (facility.approvalStatus !== "PENDING") {
            throw new BadRequestError("Facility is not pending approval");
        }

        if (facility.lifecycleStatus !== "PENDING_REVIEW") {
            throw new BadRequestError("Facility is not in pending review status");
        }

        await FacilityRepository.approveFacility(facilityId, adminId);
    }

    static async reject(facilityId: string, reason: string, adminId: string) {
        if (!reason?.trim()) {
            throw new BadRequestError("Rejection reason is required");
        }

        const facility = await FacilityRepository.findById(facilityId);

        if (!facility) {
            throw new NotFoundError("Facility not found");
        }

        if (facility.approvalStatus !== "PENDING") {
            throw new BadRequestError("Facility is not pending approval");
        }

        if (facility.lifecycleStatus !== "PENDING_REVIEW") {
            throw new BadRequestError("Facility is not in pending review status");
        }

        await FacilityRepository.rejectFacility(facilityId, reason, adminId);
    }
}