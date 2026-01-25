import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import { CreateFacilityDTO, UpdateFacilityDTO } from "../../dto/facility.dto";
import { FacilityImageInput, FacilityWithRelations } from "./facility.types";

export class FacilityRepository {
    static async create(ownerId: string, data: CreateFacilityDTO) {
        return prisma.facility.create({
            data: {
                ownerId,
                name: data.name,
                description: data.description,
                category: data.category,
                addressLine: data.addressLine,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                latitude: data.latitude,
                longitude: data.longitude,
                totalCapacity: data.totalCapacity,
                workingDays: data.workingDays,
                lifecycleStatus: "DRAFT",
                approvalStatus: "NOT_SUBMITTED",
                isPublished: false,
            },
        });
    }

    static async addImages(facilityId: string, images: FacilityImageInput[]) {
        await prisma.facilityImage.createMany({
            data: images.map((img, index) => ({
                facilityId,
                imageUrl: img.imageUrl,
                publicId: img.publicId,
                thumbnailUrl: img.thumbnailUrl,
                mediumUrl: img.mediumUrl,
                isPrimary: img.isPrimary,
                sortOrder: img.sortOrder ?? index,
            })),
        });
    }

    static async removeImages(publicIds: string[]) {
        return prisma.facilityImage.deleteMany({
            where: {
                publicId: {
                    in: publicIds,
                },
            },
        });
    }

    static async getImagesByPublicIds(publicIds: string[]) {
        return prisma.facilityImage.findMany({
            where: {
                publicId: {
                    in: publicIds,
                },
            },
            select: {
                publicId: true,
                facilityId: true,
            },
        });
    }

    static async getFacilityImageCount(facilityId: string): Promise<number> {
        return prisma.facilityImage.count({
            where: { facilityId },
        });
    }

    static async attachAmenities(facilityId: string, amenityIds: string[]) {
        await prisma.facilityAmenity.createMany({
            data: amenityIds.map((amenityId) => ({
                facilityId,
                amenityId,
            })),
            skipDuplicates: true,
        });
    }

    static findById(id: string): Promise<FacilityWithRelations | null> {
        return prisma.facility.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
                amenities: {
                    include: {
                        amenity: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }

    static findByOwner(ownerId: string) {
        return prisma.facility.findMany({
            where: { ownerId },
            include: {
                images: {
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    static async updateDraft(id: string, data: UpdateFacilityDTO) {
        const { amenityIds, ...rest } = data;

        return prisma.$transaction(async (tx) => {
            const updated = await tx.facility.update({
                where: { id },
                data: {
                    name: rest.name,
                    description: rest.description,
                    addressLine: rest.addressLine,
                    city: rest.city,
                    state: rest.state,
                    pincode: rest.pincode,
                    latitude: rest.latitude,
                    longitude: rest.longitude,
                    totalCapacity: rest.totalCapacity,
                    workingDays: rest.workingDays,
                },
            });

            if (amenityIds && Array.isArray(amenityIds)) {
                await tx.facilityAmenity.deleteMany({
                    where: { facilityId: id },
                });

                if (amenityIds.length) {
                    await tx.facilityAmenity.createMany({
                        data: amenityIds.map((amenityId: string) => ({
                            facilityId: id,
                            amenityId,
                        })),
                        skipDuplicates: true,
                    });
                }
            }

            return updated;
        });
    }

    static moveToDraft(id: string) {
        return prisma.facility.update({
            where: { id },
            data: {
                lifecycleStatus: "DRAFT",
                approvalStatus: "NOT_SUBMITTED",
                isPublished: false
            },
        });
    }

    static async deleteFacility(id: string) {
        const images = await prisma.facilityImage.findMany({
            where: { facilityId: id },
            select: { publicId: true },
        });

        await prisma.facility.delete({
            where: { id },
        });

        return images;
    }

    static async createHistorySnapshot(
        facilityId: string,
        changeType: string,
        changedBy: string,
        reason?: string
    ) {
        const facility = await prisma.facility.findUnique({
            where: { id: facilityId },
            include: {
                images: true,
                amenities: {
                    include: {
                        amenity: true,
                    },
                },
            },
        });

        if (!facility) return;

        await prisma.facilityHistory.create({
            data: {
                facilityId,
                snapshotData: facility as any, // This is OK - we're storing JSON
                changedBy,
                changeType,
                reason,
            },
        });
    }

    static async getLastApprovedSnapshot(facilityId: string) {
        return prisma.facilityHistory.findFirst({
            where: {
                facilityId,
                changeType: "APPROVED",
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    // admin operations
    static listPendingApproval() {
        return prisma.facility.findMany({
            where: {
                approvalStatus: "PENDING",
                lifecycleStatus: "PENDING_REVIEW",
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                images: {
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
                amenities: {
                    include: {
                        amenity: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'asc',
            },
        });
    }

    static async getFacilityWithChanges(facilityId: string) {
        const facility = await this.findById(facilityId);
        const lastApproved = await this.getLastApprovedSnapshot(facilityId);

        return {
            current: facility,
            previous: lastApproved?.snapshotData || null,
            isFirstSubmission: !lastApproved,
        };
    }

    static async approveFacility(id: string, adminId: string) {
        const facility = await prisma.facility.findUnique({
            where: { id },
            include: {
                images: true,
                amenities: {
                    include: {
                        amenity: true,
                    },
                },
            },
        });

        await this.createHistorySnapshot(id, "APPROVED", adminId);

        return prisma.facility.update({
            where: { id },
            data: {
                approvalStatus: "APPROVED",
                lifecycleStatus: "ACTIVE",
                isPublished: true,
                approvedAt: new Date(),
                approvalReason: null,
                approvedData: facility as any, // This is OK - storing JSON snapshot
            },
        });
    }

    static async rejectFacility(id: string, reason: string, adminId: string) {
        await this.createHistorySnapshot(id, "REJECTED", adminId, reason);

        return prisma.facility.update({
            where: { id },
            data: {
                approvalStatus: "REJECTED",
                lifecycleStatus: "DRAFT",
                isPublished: false,
                approvalReason: reason,
            },
        });
    }

    static updateStatus(
        id: string,
        lifecycleStatus: Prisma.FacilityUpdateInput['lifecycleStatus'],
        approvalStatus: Prisma.FacilityUpdateInput['approvalStatus'],
        isPublished: boolean
    ) {
        return prisma.facility.update({
            where: { id },
            data: {
                lifecycleStatus,
                approvalStatus,
                isPublished,
            },
        });
    }
}