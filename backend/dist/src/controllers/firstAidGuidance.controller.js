"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGuidance = exports.updateGuidance = exports.createGuidance = exports.getAllGuidances = exports.getGuidance = exports.getGuidanceByAlertId = void 0;
const prisma_1 = require("../lib/prisma");
const HttpResponses = __importStar(require("../utils/HttpResponses"));
const InternalErrors_1 = require("../utils/InternalErrors");
const firstAidGuidance_service_1 = require("../services/firstAidGuidance.service");
const getGuidanceByAlertId = async (req, res) => {
    var _a;
    try {
        const alertId = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params.alertId;
        const response = await (0, exports.getGuidance)(alertId);
        if (!response)
            return HttpResponses.sendNotFound(res, "No guidances for this Alert");
        return HttpResponses.sendSuccess(res, { alertId, response });
    }
    catch (error) {
        if (error instanceof InternalErrors_1.HealthEventError) {
            return HttpResponses.sendError(res, error.message);
        }
        if (error instanceof Error) {
            return HttpResponses.sendError(res, error.message);
        }
        return HttpResponses.sendError(res);
    }
};
exports.getGuidanceByAlertId = getGuidanceByAlertId;
// this function isn't API service  - called from createHealthEvent at alert creation (CreateAlert)
const getGuidance = async (guidances) => {
    return (0, firstAidGuidance_service_1.TranslateGuidanceConditions)(guidances);
};
exports.getGuidance = getGuidance;
const getAllGuidances = async (req, res) => {
    try {
        const guidances = await prisma_1.prisma.firstAidGuidance.findMany({
            orderBy: [
                { severity: "asc" },
                { condition: "asc" },
            ]
        });
        const translatedGuidance = (0, firstAidGuidance_service_1.TranslateGuidanceConditions)(guidances);
        return HttpResponses.sendSuccess(res, translatedGuidance, "translated Guidances Fetch Succeeded");
    }
    catch (error) {
        return HttpResponses.sendError(res, "Fetching First Aid Guidances Failed");
    }
};
exports.getAllGuidances = getAllGuidances;
const createGuidance = async (req, res) => {
    var _a;
    try {
        const { condition, severity, description, specificAction } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.body;
        // check for duplicate
        const guidanceExists = await prisma_1.prisma.firstAidGuidance.findFirst({
            where: {
                condition, severity
            }
        });
        if (guidanceExists) {
            return HttpResponses.sendConflict(res, "This Guidance Conditions Already Exists , Update Conditions Instead");
        }
        const newGuidance = await prisma_1.prisma.firstAidGuidance.create({
            data: {
                condition,
                severity,
                description,
                specificAction,
            }
        });
        return HttpResponses.sendCreated(res, newGuidance, "Guidance Created Successfully");
    }
    catch (error) {
        return HttpResponses.sendError(res, "Creating First Aid Guidances Failed");
    }
};
exports.createGuidance = createGuidance;
const updateGuidance = async (req, res) => {
    var _a, _b;
    try {
        const guidanceId = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params.guidanceId;
        const guidance = await prisma_1.prisma.firstAidGuidance.findUnique({
            where: { guidanceId }
        });
        if (!guidance)
            return HttpResponses.sendNotFound(res, "Guidance Not found");
        const { description, specificAction } = (_b = req.validated) === null || _b === void 0 ? void 0 : _b.body;
        const updatedGuidance = await prisma_1.prisma.firstAidGuidance.update({
            where: { guidanceId },
            data: {
                description: description !== null && description !== void 0 ? description : guidance.description,
                specificAction: specificAction !== null && specificAction !== void 0 ? specificAction : guidance.specificAction,
            }
        });
        return HttpResponses.sendSuccess(res, updatedGuidance);
    }
    catch (error) {
        if (error instanceof Error)
            return HttpResponses.sendError(res, error.message);
        return HttpResponses.sendError(res, "Updating First Aid Guidance Failed");
    }
};
exports.updateGuidance = updateGuidance;
const deleteGuidance = async (req, res) => {
    var _a;
    try {
        const guidanceId = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params.guidanceId;
        const guidance = await prisma_1.prisma.firstAidGuidance.findUnique({
            where: { guidanceId }
        });
        if (!guidance)
            return HttpResponses.sendNotFound(res, "Guidance Not found");
        await prisma_1.prisma.firstAidGuidance.delete({
            where: { guidanceId }
        });
        return HttpResponses.sendNoContent(res);
    }
    catch (error) {
        if (error instanceof Error)
            return HttpResponses.sendError(res, error.message);
        return HttpResponses.sendError(res, "Deleting First Aid Guidance Failed");
    }
};
exports.deleteGuidance = deleteGuidance;
