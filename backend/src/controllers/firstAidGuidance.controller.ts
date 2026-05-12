import { Request, Response } from "express";
import { prisma } from "../lib/prisma"
import * as HttpResponses from "../utils/HttpResponses"
import { HealthEventError } from "../utils/InternalErrors";
import { FirstAidGuidance } from "../../generated/prisma/client";
import { TranslateGuidanceConditions } from "../services/firstAidGuidance.service";


export const getGuidanceByAlertId = async (req: Request, res: Response) => {
    try {
        const alertId = req.validated?.params.alertId;

        const response = await getGuidance(alertId)

        if (!response) return HttpResponses.sendNotFound(res, "No guidances for this Alert")

        return HttpResponses.sendSuccess(res, { alertId, response });

    } catch (error) {
        if (error instanceof HealthEventError) {
            return HttpResponses.sendError(res, error.message)
        }
        if (error instanceof Error) {
            return HttpResponses.sendError(res, error.message)
        }
        return HttpResponses.sendError(res)
    }
};


// this function isn't API service  - called from createHealthEvent at alert creation (CreateAlert)
export const getGuidance = async (guidances: FirstAidGuidance[]) => {

    return TranslateGuidanceConditions(guidances)

}

export const getAllGuidances = async (res: Response) => {
    try {
        const guidances = await prisma.firstAidGuidance.findMany({
            orderBy: [
                { severity: "asc" },
                { condition: "asc" },
            ]
        });

        const translatedGuidance = TranslateGuidanceConditions(guidances)

        return HttpResponses.sendSuccess(res, translatedGuidance, "translated Guidances Fetch Succeeded")

    } catch (error) {
        return HttpResponses.sendError(res, "Fetching First Aid Guidances Failed");
    }

}

export const createGuidance = async (req: Request, res: Response) => {
    try {
        const { condition, severity, description, specificAction } = req.validated?.body
        // check for duplicate
        const guidanceExists = await prisma.firstAidGuidance.findFirst({
            where: {
                condition, severity
            }
        })

        if (guidanceExists) {
            return HttpResponses.sendConflict(res, "This Guidance Conditions Already Exists , Update Conditions Instead")
        }
        const newGuidance = await prisma.firstAidGuidance.create({
            data: {
                condition,
                severity,
                description,
                specificAction,
            }
        });

        return HttpResponses.sendCreated(res, newGuidance, "Guidance Created Successfully")

    } catch (error) {
        return HttpResponses.sendError(res, "Creating First Aid Guidances Failed");
    }

}
export const updateGuidance = async (req: Request, res: Response) => {
    try {
        const guidanceId = req.validated?.params.guidanceId

        const guidance = await prisma.firstAidGuidance.findUnique({
            where: { guidanceId }
        })
        if (!guidance) return HttpResponses.sendNotFound(res, "Guidance Not found")

        const { description, specificAction } = req.validated?.body

        const updatedGuidance = await prisma.firstAidGuidance.update({
            where: { guidanceId },
            data: {
                description: description ?? guidance.description,
                specificAction: specificAction ?? guidance.specificAction,
            }
        });

        return HttpResponses.sendSuccess(res, updatedGuidance)

    } catch (error) {
        if (error instanceof Error)
            return HttpResponses.sendError(res, error.message);
        return HttpResponses.sendError(res, "Updating First Aid Guidance Failed")
    }

}

export const deleteGuidance = async (req: Request, res: Response) => {
    try {
        const guidanceId = req.validated?.params.guidanceId

        const guidance = await prisma.firstAidGuidance.findUnique({
            where: { guidanceId }
        })
        if (!guidance) return HttpResponses.sendNotFound(res, "Guidance Not found")


        await prisma.firstAidGuidance.delete({
            where: { guidanceId }
        });

        return HttpResponses.sendNoContent(res)

    } catch (error) {
        if (error instanceof Error)
            return HttpResponses.sendError(res, error.message);
        return HttpResponses.sendError(res, "Deleting First Aid Guidance Failed")
    }
}



