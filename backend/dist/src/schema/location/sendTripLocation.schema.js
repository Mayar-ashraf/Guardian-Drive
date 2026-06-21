"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTripLocationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const tripIdParam_schema_1 = require("../trips/tripIdParam.schema");
const gps_schema_1 = require("./gps.schema");
exports.sendTripLocationSchema = zod_1.default.object({
    params: tripIdParam_schema_1.tripIdParamSchema,
    body: gps_schema_1.gpsSchema,
    query: zod_1.default.object({}).strict(),
}).strict();
