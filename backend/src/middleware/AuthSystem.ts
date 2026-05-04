import { Request, Response, NextFunction } from "express"
import { sendUnauthorized } from "../utils/HttpResponses";
import { env } from "process";

export const authorizeSystem = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== env.MOBILE_API_KEY) return sendUnauthorized(res, "system key not valid");
    next();
};

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