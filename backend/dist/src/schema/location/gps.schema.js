"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gpsSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.gpsSchema = zod_1.default.object({
    latitude: zod_1.default.coerce.number("Latitude must be a valid number"),
    longitude: zod_1.default.coerce.number("Longitude must be a valid number"),
}).strict();
