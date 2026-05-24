"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserbyIDschema = void 0;
const zod_1 = require("zod");
exports.getUserbyIDschema = zod_1.z.object({ params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "User ID must be a number"),
    }).strict(),
});
