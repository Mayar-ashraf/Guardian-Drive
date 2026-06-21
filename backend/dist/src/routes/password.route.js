"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const password_controller_1 = require("../controllers/password.controller");
const router = express_1.default.Router();
router.post("/forget-password", password_controller_1.forgetPass);
router.post("/reset-password", password_controller_1.resetPass);
router.post("/validate-reset-token", password_controller_1.validateToken);
router.get("/reset-password", (req, res) => {
    const token = req.query.token;
    const appLink = `guardiandrive://reset-password?token=${token}`;
    res.send(`
    <html>
      <body>
        <script>
          window.location.href = "${appLink}";
        </script>

        <p>Redirecting to app...</p>
      </body>
    </html>
  `);
});
exports.default = router;
