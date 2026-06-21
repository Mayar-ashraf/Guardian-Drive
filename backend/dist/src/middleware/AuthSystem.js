"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeSystem = void 0;
const HttpResponses_1 = require("../utils/HttpResponses");
const process_1 = require("process");
const authorizeSystem = (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== process_1.env.MOBILE_API_KEY)
        return (0, HttpResponses_1.sendUnauthorized)(res, "system key not valid");
    next();
};
exports.authorizeSystem = authorizeSystem;
// would add this in flutter
// services/device_auth.dart
/*
class DeviceAuth {
  static const _apiKey = "your-api-key-here";

  static Map<String, String> get headers => {
    "Content-Type": "application/json",
    "X-Api-Key":    _apiKey,
  };
}

// usage anywhere
await http.post(
  Uri.parse("$baseUrl/api/alerts"),
  headers: DeviceAuth.headers,
  body: jsonEncode(payload),
);
*/ 
