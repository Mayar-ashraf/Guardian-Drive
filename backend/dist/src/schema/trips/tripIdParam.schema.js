"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripIdParamSchema = void 0;
const zod_1 = require("zod");
exports.tripIdParamSchema = zod_1.z.object({
    tripId: zod_1.z.coerce.number("Trip Id must be a valid number")
        .int("Trip Id must be an integer")
        .positive("Trip Id must be positive")
}).strict();
