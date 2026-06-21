"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyReadings = void 0;
const enums_1 = require("../../generated/prisma/enums");
// helper function to classify the vitals for the correct condition - and then - guidance
const classifyReadings = (heartRate, spo2, temp) => {
    const results = [];
    // Heart Rate
    if (heartRate > 150)
        results.push({ condition: enums_1.ConditionType.HIGH_HEART_RATE, severity: enums_1.ConditionSeverity.CRITICAL });
    else if (heartRate > 120)
        results.push({ condition: enums_1.ConditionType.HIGH_HEART_RATE, severity: enums_1.ConditionSeverity.MODERATE });
    else if (heartRate > 100)
        results.push({ condition: enums_1.ConditionType.HIGH_HEART_RATE, severity: enums_1.ConditionSeverity.MILD });
    else if (heartRate < 40)
        results.push({ condition: enums_1.ConditionType.LOW_HEART_RATE, severity: enums_1.ConditionSeverity.CRITICAL });
    else if (heartRate < 50)
        results.push({ condition: enums_1.ConditionType.LOW_HEART_RATE, severity: enums_1.ConditionSeverity.MODERATE });
    else if (heartRate < 60)
        results.push({ condition: enums_1.ConditionType.LOW_HEART_RATE, severity: enums_1.ConditionSeverity.MILD });
    // SPO2
    if (spo2 < 88)
        results.push({ condition: enums_1.ConditionType.LOW_SPO2, severity: enums_1.ConditionSeverity.CRITICAL });
    else if (spo2 < 92)
        results.push({ condition: enums_1.ConditionType.LOW_SPO2, severity: enums_1.ConditionSeverity.MODERATE });
    else if (spo2 < 95)
        results.push({ condition: enums_1.ConditionType.LOW_SPO2, severity: enums_1.ConditionSeverity.MILD });
    // Temperature
    if (temp > 39.5)
        results.push({ condition: enums_1.ConditionType.HIGH_TEMP, severity: enums_1.ConditionSeverity.CRITICAL });
    else if (temp > 38)
        results.push({ condition: enums_1.ConditionType.HIGH_TEMP, severity: enums_1.ConditionSeverity.MODERATE });
    else if (temp > 37.5)
        results.push({ condition: enums_1.ConditionType.HIGH_TEMP, severity: enums_1.ConditionSeverity.MILD });
    else if (temp < 35)
        results.push({ condition: enums_1.ConditionType.LOW_TEMP, severity: enums_1.ConditionSeverity.CRITICAL });
    else if (temp < 36)
        results.push({ condition: enums_1.ConditionType.LOW_TEMP, severity: enums_1.ConditionSeverity.MODERATE });
    // fallback — readings appear normal but alert was still triggered
    // can add General Type in conditionType and use it as fallback condition But for now let it be like that
    if (results.length === 0) {
        results.push({ condition: enums_1.ConditionType.HIGH_HEART_RATE, severity: enums_1.ConditionSeverity.MILD });
    }
    return results;
};
exports.classifyReadings = classifyReadings;
