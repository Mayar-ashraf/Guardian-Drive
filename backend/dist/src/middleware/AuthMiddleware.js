"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.authorize = void 0;
const jwt_1 = require("../utils/jwt");
const HttpResponses_1 = require("../utils/HttpResponses");
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, HttpResponses_1.sendUnauthorized)(res);
            return;
        }
        if (!roles.includes(req.user.role)) { // check the user role with all the roles that are authorized and see if he is included
            (0, HttpResponses_1.sendForbidden)(res);
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        (0, HttpResponses_1.sendUnauthorized)(res);
        return;
    }
    const token = authHeader.split(" ")[1]; // to get the JWT token itself
    try {
        req.user = (0, jwt_1.verifyAccessToken)(token); // i am storing the decoded token here instead of cracking it everytime i want token or user id
        next();
    }
    catch (_a) {
        (0, HttpResponses_1.sendUnauthorized)(res, "Invalid or expired token");
    }
};
exports.authenticate = authenticate;
