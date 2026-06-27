import { z } from "zod";
import { ConditionSeverity, ConditionType } from "../../../generated/prisma/enums";

export const CreateGuidanceSchema = z.object({
    body: z.object({
        condition: z.enum(ConditionType),
        severity: z.enum(ConditionSeverity),
        description: z.string(),
        specificAction: z.string().optional()
    })
});
