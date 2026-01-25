import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/role.middleware';
import { validateRequestBody } from '../../validators';
import { createFacilitySchema, rejectFacilitySchema, updateFacilityImagesSchema, updateFacilitySchema } from '../../validators/facility.validator';
import { FacilityController } from './facility.controller';

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorizeRoles("OWNER"),
    validateRequestBody(createFacilitySchema),
    FacilityController.create
);

router.patch(
    "/:facilityId/submit",
    authenticate,
    authorizeRoles("OWNER"),
    FacilityController.submit
);

router.patch(
    "/:facilityId",
    authenticate,
    authorizeRoles("OWNER"),
    validateRequestBody(updateFacilitySchema),
    FacilityController.update
);

router.patch(
    "/:facilityId/images",
    authenticate,
    authorizeRoles("OWNER"),
    validateRequestBody(updateFacilityImagesSchema),
    FacilityController.updateImages
);

router.patch(
    "/:facilityId/move-to-draft",
    authenticate,
    authorizeRoles("OWNER"),
    FacilityController.moveToDraft
);

router.delete(
    "/:facilityId",
    authenticate,
    authorizeRoles("OWNER"),
    FacilityController.delete
);

// admin routes
router.get(
    "/admin/pending",
    authenticate,
    authorizeRoles("ADMIN"),
    FacilityController.listPending
);

router.get(
    "/admin/:facilityId/changes",
    authenticate,
    authorizeRoles("ADMIN"),
    FacilityController.getFacilityChanges
);

router.patch(
    "/admin/:facilityId/approve",
    authenticate,
    authorizeRoles("ADMIN"),
    FacilityController.approve
);

router.patch(
    "/admin/:facilityId/reject",
    authenticate,
    authorizeRoles("ADMIN"),
    validateRequestBody(rejectFacilitySchema),
    FacilityController.reject


);

export default router;