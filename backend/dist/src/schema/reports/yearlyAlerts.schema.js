"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.yearlyAlertsSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.yearlyAlertsSchema = zod_1.default.object({
    params: zod_1.default.object({}).strict(),
    body: zod_1.default.object({}).strict(),
    query: zod_1.default.object({
        fromYear: zod_1.default.coerce.number("'from' year must be a valid number").positive("'from' year must be positive").int("'from' year must be integer"),
        toYear: zod_1.default.coerce.number("'to' year must be a valid number").positive("'to' year must be positive").int("'to' year must be integer")
    }).refine((val) => val.fromYear <= val.toYear, {
        message: "'from' year must be before 'to' year",
        path: ["toYear"]
    }).strict()
});
