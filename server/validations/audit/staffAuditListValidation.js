import { staffAuditListQuerySchema } from "@molha/api-contract";

import { validateQueryZod } from "../../middlewares/validateQueryZod.js";

export const staffAuditListValidation = [validateQueryZod(staffAuditListQuerySchema)];
