import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import { listStaffAuditLogController } from "../controllers/index.js";
import { staffAuditListValidation } from "../validations/index.js";
import { checkAuthMW, checkAdminMW } from "../middlewares/index.js";

const router = createAsyncRouter();

// путь в createApp начинается с /audit
router.get(
  "/staff-log",
  checkAuthMW,
  checkAdminMW,
  staffAuditListValidation,
  listStaffAuditLogController,
);

export { router as auditRouter };
