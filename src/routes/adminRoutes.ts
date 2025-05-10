import express from "express";
import { authenticate, isAdmin } from "../middleware/authMiddleware";
import { getUsersController, getUserController, updateUserController, createUserController, deleteUserController } from "../controllers/AdminController";
import { getBranchesController, getBranchController, updateBranchController, createBranchController, deleteBranchController } from "../controllers/BranchController";
import { getMerchantProfilesController, getMerchantProfileController, updateMerchantProfileController, createMerchantProfileController, deleteMerchantProfileController } from "../controllers/MerchantProfileController";
import { handleValidationErrors ,handleValidationErrorsForUploads} from "../middleware/handleValidationErrors";
import { validateCreatBranch ,validateUpdateBranch} from "../middleware/branchMiddleware";
import { validateRegisterForAdmin,validateUpdateForAdmin ,validateUpdateMerchantProfile,validateCreateMerchantProfile ,uploadMerchantProfileFiles,validateUploadedFiles} from "../middleware/adminDashboardValidation";
const router = express.Router();

// Protect all admin routes with JWT

router.use(authenticate);
router.use(isAdmin);

router.get("/users", getUsersController);
router.get("/user/:id", getUserController);
router.put("/update-user/:id", updateUserController,validateUpdateForAdmin, handleValidationErrors);
router.post("/user/create", createUserController,validateRegisterForAdmin, handleValidationErrors);
router.delete("/delete-user/:id", deleteUserController);

router.get("/branches",getBranchesController);
router.get("/branch/:id",getBranchController);
router.put("/update-branch/:id",validateUpdateBranch,handleValidationErrorsForUploads,updateBranchController);
router.post("/branch/create",validateCreatBranch,handleValidationErrorsForUploads,createBranchController);
router.delete("/delete-branch/:id",deleteBranchController);

router.get("/merchantProfiles",getMerchantProfilesController);
router.get("/merchantProfile/:id",getMerchantProfileController);
router.put("/update-merchantProfile/:id",
  uploadMerchantProfileFiles,
  validateUploadedFiles,
  validateUpdateMerchantProfile,
  handleValidationErrorsForUploads,
  updateMerchantProfileController);
router.post(
    "/merchantProfile/create",
    uploadMerchantProfileFiles,
    validateUploadedFiles,
    validateCreateMerchantProfile,
    handleValidationErrorsForUploads,
    createMerchantProfileController
  );
router.delete("/delete-merchantProfile/:id",deleteMerchantProfileController);

export default router;
