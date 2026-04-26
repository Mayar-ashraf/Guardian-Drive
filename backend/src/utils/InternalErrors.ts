
export class HealthEventError extends Error {
    constructor(errorMessage: string) {
        super(errorMessage)
        this.name = "HealthEventError";
    }
}