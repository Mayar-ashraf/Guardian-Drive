# First aid Guidance logic :

## The Problem

When a `HEALTH_ABNORMAL` alert fires, the fleet manager needs to know **what to do right now**. The system must return actionable guidance instantly — no delays, no external dependencies.

---

## The Idea

Pre-seed a `FirstAidGuidance` table with one row per condition-severity combination. When an alert is created, classify the driver's vitals against fixed thresholds, match them to the seeded rows, and connect them to the `HealthEvent`. When the fleet manager fetches the alert, group the matched guidance by severity and return it.

No AI calls. No computation at read time. Just a lookup.

---

## Why Not AI-Generated Guidance?

An AI approach was considered and rejected because:
- A failed API call at alert creation time would block the entire alert — unacceptable for an emergency system
- Guidance must be consistent and auditable — the same vitals should always return the same instructions
- Latency matters in emergencies — a database lookup is instant, an AI call adds 1–3 seconds

---

## Schema

```prisma
model FirstAidGuidance {
  guidanceId     Int               @id @default(autoincrement())
  condition      ConditionType
  severity       ConditionSeverity
  description    String            // what is happening
  specificAction String?           // optional condition-specific step, null = use shared severity action only

  healthEvents HealthEvent[]       // many-to-many

  @@unique([condition, severity])  // one row per pair
}

enum ConditionType {
  HIGH_HEART_RATE
  LOW_HEART_RATE
  LOW_SPO2
  HIGH_TEMP
  LOW_TEMP
  GENERAL           // fallback when vitals appear normal but alert still triggered
}

enum ConditionSeverity {
  MILD
  MODERATE
  CRITICAL
}
```

`HealthEvent` links to `FirstAidGuidance` via many-to-many — a driver can have high heart rate **and** low SpO2 simultaneously, each needing its own guidance row.

---

## The Flow

```
HEALTH_ABNORMAL alert created
        ↓
classifyReadings(heartRate, spo2, temp)
  → returns list of { condition, severity } for every abnormal vital
        ↓
findMany guidance rows matching those pairs (OR query)
        ↓
healthEvent.create with connect to matched guidance rows
        ↓
Fleet manager GET /alerts/:alertId/first-aid-guidance
        ↓
Group matched rows by severity → return ordered response
```

---

## Classification Thresholds

All three vitals are evaluated independently — multiple conditions can fire at once.

| Vital | Range | Condition | Severity |
|---|---|---|---|
| Heart Rate | > 150 bpm | HIGH_HEART_RATE | CRITICAL |
| Heart Rate | 120–150 bpm | HIGH_HEART_RATE | MODERATE |
| Heart Rate | 100–120 bpm | HIGH_HEART_RATE | MILD |
| Heart Rate | < 40 bpm | LOW_HEART_RATE | CRITICAL |
| Heart Rate | 40–50 bpm | LOW_HEART_RATE | MODERATE |
| Heart Rate | 50–60 bpm | LOW_HEART_RATE | MILD |
| SpO2 | < 88% | LOW_SPO2 | CRITICAL |
| SpO2 | 88–92% | LOW_SPO2 | MODERATE |
| SpO2 | 92–95% | LOW_SPO2 | MILD |
| Temperature | > 39.5°C | HIGH_TEMP | CRITICAL |
| Temperature | 38–39.5°C | HIGH_TEMP | MODERATE |
| Temperature | 37.5–38°C | HIGH_TEMP | MILD |
| Temperature | < 35°C | LOW_TEMP | CRITICAL |
| Temperature | 35–36°C | LOW_TEMP | MODERATE |
| None triggered | — | GENERAL | MILD |

---

## The Duplication Problem and How It Was Solved

When multiple conditions are CRITICAL simultaneously, naively returning one card per condition would repeat "call emergency services" three times — bad UX.

**Solution:** group by severity in the controller. One shared action per severity group, all conditions listed underneath. The `specificAction` field on each guidance row allows a condition-specific step to be prepended when needed.

```
Response shape:
[
  {
    severity: "CRITICAL",
    severityAction: "Call emergency services immediately...",
    conditions: [
      { condition: "HIGH_HEART_RATE", description: "...", specificAction: null },
      { condition: "LOW_SPO2",        description: "...", specificAction: null }
    ]
  },
  {
    severity: "MODERATE",
    severityAction: "Pull over immediately...",
    conditions: [...]
  }
]
```

`severityAction` is a fixed function in the controller — not stored in the database — because it is deterministic and does not need to be editable without redeployment.

---

## Authorization

| Endpoint | Roles |
|---|---|
| `GET /first-aid-guidance` | ADMIN |
| `GET /alerts/:alertId/first-aid-guidance` | ADMIN, FLEET_MANAGER |
| `POST / PATCH / DELETE` | ADMIN only |

Drivers are excluded from reading specifi guidance — they guidance is returned when an alert is triggered with the alert and the health event created 

## Return of the alert created is 
1) alert info itself - exculding towing request and emergency request which is yet to be called/handled
2) the health event which references the medical-information table to connect the driver condition with his saved medical info
3) the guidance to his conditon
4) the condition type and severity which is a part of the guidance table-object 
