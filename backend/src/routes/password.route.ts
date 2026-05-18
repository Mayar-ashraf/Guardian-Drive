import express from "express";
import { forgetPass, resetPass,validateToken } from "../controllers/password.controller";

const router = express.Router();

router.post("/forget-password", forgetPass);
router.post("/reset-password", resetPass);
router.post("/validate-reset-token", validateToken);

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


export default router;