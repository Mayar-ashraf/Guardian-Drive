"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthEventError = void 0;
class HealthEventError extends Error {
    constructor(errorMessage) {
        super(errorMessage);
        this.name = "HealthEventError";
    }
}
exports.HealthEventError = HealthEventError;
