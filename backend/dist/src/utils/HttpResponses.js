"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConflict = exports.sendBadRequest = exports.sendValidationError = exports.sendUnauthorized = exports.sendForbidden = exports.sendNotFound = exports.sendError = exports.sendNoContent = exports.sendCreated = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
    res.status(statusCode).json({ message, data });
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, data, message = "Created successfully") => {
    (0, exports.sendSuccess)(res, data, message, 201);
};
exports.sendCreated = sendCreated;
const sendNoContent = (res) => {
    res.status(204).send();
};
exports.sendNoContent = sendNoContent;
// error responses
const sendError = (res, error = "Server Failed", statusCode = 500) => {
    res.status(statusCode).json({ error });
};
exports.sendError = sendError;
const sendNotFound = (res, error = "Object not found") => {
    (0, exports.sendError)(res, error, 404);
};
exports.sendNotFound = sendNotFound;
const sendForbidden = (res, error = "You are unauthorized to make this request") => {
    (0, exports.sendError)(res, error, 403);
};
exports.sendForbidden = sendForbidden;
const sendUnauthorized = (res, error = "Missing or invalid authentication token") => {
    (0, exports.sendError)(res, error, 401);
};
exports.sendUnauthorized = sendUnauthorized;
const sendValidationError = (res, errors) => {
    res.status(400).json({ message: "Validation failed", errors });
};
exports.sendValidationError = sendValidationError;
const sendBadRequest = (res, error = "Bad Request") => {
    (0, exports.sendError)(res, error, 400);
};
exports.sendBadRequest = sendBadRequest;
const sendConflict = (res, error = "Conflict") => {
    (0, exports.sendError)(res, error, 409);
};
exports.sendConflict = sendConflict;
