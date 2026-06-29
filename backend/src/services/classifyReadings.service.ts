import { MedicalInformation } from "../../generated/prisma/client";
import { ConditionSeverity, ConditionType } from "../../generated/prisma/enums";

interface ClassifiedCondition {
    condition: ConditionType;
    severity: ConditionSeverity;
}

const classifyBound = (
    value: number,
    min: number,
    max: number,
    warningBuffer: number,
    lowType: ConditionType,
    highType: ConditionType | undefined,
    results: ClassifiedCondition[],
): void => {

    // Low side
    if (value < min) {
        results.push({
            condition: lowType,
            severity: ConditionSeverity.CRITICAL,
        });
    } else if (value <= min + warningBuffer) {
        results.push({
            condition: lowType,
            severity: ConditionSeverity.MODERATE,
        });
    }

    // High side
    if (highType) {
        if (value > max) {
            results.push({
                condition: highType,
                severity: ConditionSeverity.CRITICAL,
            });
        } else if (value >= max - warningBuffer) {
            results.push({
                condition: highType,
                severity: ConditionSeverity.MODERATE,
            });
        }
    }
};

export const classifyReadings = (
    heartRate: number,
    spo2: number,
    temp: number,
    medical: MedicalInformation,
): ClassifiedCondition[] => {

    const results: ClassifiedCondition[] = [];

    classifyBound(
        heartRate,
        medical.minHeartRate,
        medical.maxHeartRate,
        WARNING_BUFFER.heartRate,
        ConditionType.LOW_HEART_RATE,
        ConditionType.HIGH_HEART_RATE,
        results,
    );

    classifyBound(
        spo2,
        medical.minSpo2 - WARNING_BUFFER.spo2,
        medical.maxSpo2,
        0,
        ConditionType.LOW_SPO2,
        undefined,
        results,
    );

    classifyBound(
        temp,
        medical.minTemp,
        medical.maxTemp,
        WARNING_BUFFER.temp,
        ConditionType.LOW_TEMP,
        ConditionType.HIGH_TEMP,
        results,
    );

    // fallback on mild if no readings was classified
    if (results.length === 0) {
        results.push({
            condition: ConditionType.HIGH_HEART_RATE,
            severity: ConditionSeverity.MILD,
        });
    }

    return results;
};