"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlertByIdSchema = void 0;
const zod_1 = require("zod");
exports.getAlertByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        alertId: zod_1.z.coerce.number().int().positive(),
    })
});
