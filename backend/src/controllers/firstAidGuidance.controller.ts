import { Request, Response } from "express";
import { prisma } from "../lib/prisma"
import * as HttpResponses from "../utils/HttpResponses"
import { ConditionSeverity, ConditionType } from "../../generated/prisma/enums";
import { HealthEventError } from "../utils/InternalErrors";
import { FirstAidGuidance } from "../../generated/prisma/client";


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


// HELPER FUNCTIONS
// for fixed return guidance per condition

// severity priority order
const SEVERITY_ORDER: ConditionSeverity[] = [
    ConditionSeverity.CRITICAL,
    ConditionSeverity.MODERATE,
    ConditionSeverity.MILD,
];
/*
const getActionBySeverity = (severity: ConditionSeverity): string => {
    const actions: Record<ConditionSeverity, string> = {
        [ConditionSeverity.CRITICAL]: 
            "Call emergency services (911) immediately. Do not leave the driver alone. Keep the driver conscious and talking. Do not give food or water. Unlock the vehicle doors for emergency responders. Be ready to perform CPR if the driver loses consciousness.",
        
        [ConditionSeverity.MODERATE]: 
            "Pull over to a safe location immediately and turn on hazard lights. Keep the driver calm and still. Loosen any tight clothing around the neck and chest. Monitor vitals continuously. Call emergency services if there is no improvement within 3 minutes or if condition worsens.",
        
        [ConditionSeverity.MILD]: 
            "Pull over safely and turn off the engine. Ask the driver how they feel and keep them calm. Ensure fresh air circulation by opening windows. Give water if the driver is conscious and not nauseous. Monitor vitals every 2 minutes. Escalate to emergency services if symptoms worsen or do not improve within 10 minutes.",
    };
    return actions[severity];
};
*/

const getActionBySeverity = (severity: ConditionSeverity): string => {
    const actions: Record<ConditionSeverity, string> = {
        [ConditionSeverity.CRITICAL]: "Call emergency services immediately. Do not leave the driver alone.",
        [ConditionSeverity.MODERATE]: "Pull over immediately. Monitor the driver closely and call emergency if no improvement in 3 minutes.",
        [ConditionSeverity.MILD]: "Pull over and let the driver rest. Monitor vitals and escalate if symptoms worsen.",
    };
    return actions[severity];
};

const TranslateGuidanceConditions = (guidances: FirstAidGuidance[]) => {
    if (guidances.length === 0) return null

    // group by severity

    const grouped = guidances.reduce((acc, g) => {
        if (!acc[g.severity]) acc[g.severity] = [];
        acc[g.severity].push({
            condition: g.condition,
            description: g.description,
            specificAction: g.specificAction,
        });
        return acc;
    }, {} as Record<ConditionSeverity, { condition: ConditionType; description: string, specificAction: string | null }[]>);

    /*
        const grouped = guidances.reduce((acc, g) => {
            if (!acc[g.severity]) acc[g.severity] = [];
            acc[g.severity]!.push({
                condition: g.condition,
                description: g.description,
                specificAction: g.specificAction,
            });
            return acc;
        }, {} as Partial<Record<ConditionSeverity, { condition: ConditionType; description: string, specificAction: string | null }[]>>);
        // Partial used to not cause problems if a condition has no value - doesn't exist in the guidances
    */
    const response = SEVERITY_ORDER
        .filter(s => grouped[s])
        .map(severity => ({
            severity,
            // one shared action per severity level
            severityAction: getActionBySeverity(severity),
            conditions: grouped[severity]
            //conditions: grouped[severity]!, // ← ! removes undefined
        }));

    return response
}
