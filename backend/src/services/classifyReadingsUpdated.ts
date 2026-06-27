// utils/classifyReadings.ts

import { MedicalInformation } from "../../generated/prisma/client";
import { ConditionSeverity, ConditionType } from "../../generated/prisma/enums";

interface ClassifiedCondition {
    condition: ConditionType;
    severity: ConditionSeverity;
}

const severityFromDeviation = (value: number, baseline: number): ConditionSeverity => {
    const deviation = Math.abs(value - baseline) / baseline;
    if (deviation > 0.25) return ConditionSeverity.CRITICAL;
    if (deviation > 0.10) return ConditionSeverity.MODERATE;
    return ConditionSeverity.MILD;
};

const classifyBound = (
    value: number,
    avg: number,
    min: number,
    max: number,
    lowType: ConditionType,
    highType?: ConditionType,
    results: ClassifiedCondition[] = [],
): void => {
    if (value < min) {
        results.push({ condition: lowType, severity: severityFromDeviation(value, avg) });
    } else if (highType && value > max) {
        results.push({ condition: highType, severity: severityFromDeviation(value, avg) });
    }
};

export const classifyReadings = (
    heartRate: number,
    spo2: number,
    temp: number,
    medical: MedicalInformation, // fetched from DB — same record used by createHealthEvent
): ClassifiedCondition[] => {
    const results: ClassifiedCondition[] = [];

    classifyBound(
        heartRate,
        medical.avgHeartRate,
        medical.minHeartRate,
        medical.maxHeartRate,
        ConditionType.LOW_HEART_RATE,
        ConditionType.HIGH_HEART_RATE,
        results,
    );

    classifyBound(
        spo2,
        medical.avgSpo2,
        medical.minSpo2,
        medical.maxSpo2,
        ConditionType.LOW_SPO2,
        undefined, // no HIGH_SPO2 — same reason as mobile
        results,
    );

    classifyBound(
        temp,
        medical.avgTemp,
        medical.minTemp,
        medical.maxTemp,
        ConditionType.LOW_TEMP,
        ConditionType.HIGH_TEMP,
        results,
    );

    return results;
};