// HELPER FUNCTIONS
// for fixed return guidance per condition

import { FirstAidGuidance } from "../../generated/prisma/client";
import { ConditionSeverity, ConditionType } from "../../generated/prisma/enums";

// severity priority order
export const SEVERITY_ORDER: ConditionSeverity[] = [
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

export const TranslateGuidanceConditions = (guidances: FirstAidGuidance[]) => {
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