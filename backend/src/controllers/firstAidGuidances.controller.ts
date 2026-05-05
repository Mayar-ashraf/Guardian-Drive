import { Request, Response } from "express";
import { prisma } from "../lib/prisma"
import * as HttpResponses from "../utils/HttpResponses"
import { ConditionSeverity, ConditionType } from "../../generated/prisma/enums";


// severity priority order
const SEVERITY_ORDER: ConditionSeverity[] = [
    ConditionSeverity.CRITICAL,
    ConditionSeverity.MODERATE,
    ConditionSeverity.MILD,
];

// helper function for fixed return guidance per condition
const getActionBySeverity = (severity: ConditionSeverity): string => {
    const actions: Record<ConditionSeverity, string> = {
        [ConditionSeverity.CRITICAL]: "Call emergency services immediately. Do not leave the driver alone.",
        [ConditionSeverity.MODERATE]: "Pull over immediately. Monitor the driver closely and call emergency if no improvement in 3 minutes.",
        [ConditionSeverity.MILD]: "Pull over and let the driver rest. Monitor vitals and escalate if symptoms worsen.",
    };
    return actions[severity];
};

export const getAlertGuidance = async (req: Request, res: Response) => {
    try {
        const alertId = req.validated?.params;

        const response = getGuidance(alertId)

        if (!response) return HttpResponses.sendNotFound(res, "No guidances for this Alert")

        return HttpResponses.sendSuccess(res, { alertId, response });

    } catch (error) {
        if (error instanceof Error) {
            return HttpResponses.sendError(res, error.message)
        }
        return HttpResponses.sendError(res)
    }
};



export const getGuidance = async (alertId: number) => {

    const healthEvent = await prisma.healthEvent.findUnique({
        where: { alertId },
        include: {
            guidances: true
        }
    });

    if (!healthEvent) return null
    if (healthEvent.guidances.length === 0) return null

    // group by severity
    const grouped = healthEvent.guidances.reduce((acc, g) => {
        if (!acc[g.severity]) acc[g.severity] = [];
        acc[g.severity].push({
            condition: g.condition,
            description: g.description,
            specificAction: g.specificAction,
        });
        return acc;
    }, {} as Record<ConditionSeverity, { condition: ConditionType; description: string, specificAction: string | null }[]>);

    /*
    // if previous caused problems use this with Partial to identify that not all values ay exist
    const grouped = healthEvent.guidances.reduce((acc, g) => {
        if (!acc[g.severity]) acc[g.severity] = [];
        acc[g.severity]!.push({ condition: g.condition, description: g.description });
        return acc;
    }, {} as Partial<Record<ConditionSeverity, { condition: ConditionType; description: string }[]>>);
 
    */
    const response = SEVERITY_ORDER
        .filter(s => grouped[s])
        .map(severity => ({
            severity,
            // one shared action per severity level
            severityAction: getActionBySeverity(severity),
            conditions: grouped[severity],
        }));

    return response
}
