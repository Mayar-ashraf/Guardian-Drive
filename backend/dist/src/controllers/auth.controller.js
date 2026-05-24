"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const HttpResponses_1 = require("../utils/HttpResponses");
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email }
        });
        if (!user)
            return (0, HttpResponses_1.sendUnauthorized)(res, "Invalid email or password");
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch)
            return (0, HttpResponses_1.sendUnauthorized)(res);
        // token generated from user id and role for later JWT Authorization
        const accessToken = (0, jwt_1.signAccessToken)({ userId: user.id, role: user.role });
        const { password: _ } = user, safeUser = __rest(user, ["password"]); // to not return user password with response
        (0, HttpResponses_1.sendSuccess)(res, { user: safeUser, accessToken }, "Login successful");
    }
    catch (error) {
        console.error("FULL ERROR:", error);
        return (0, HttpResponses_1.sendError)(res); // can add ,error to send error too but thats not needed
    }
}
