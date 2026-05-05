import express from "express"

const router = express.Router()

// 1. GET /first-aid-guidances
router.get("/",)

// 3. GET /api/alerts/:alertId/first-aid-guidance — get guidance for a specific alert
// present in alerts.route.ts


// 4. POST /first-aid-guidance
router.post("/")

// 5. PATCH /first-aid-guidance/:guidanceId
router.patch("/:guidanceId")

// 6. DELETE /first-aid-guidance/:guidanceId

router.delete('/:guidanceId')
