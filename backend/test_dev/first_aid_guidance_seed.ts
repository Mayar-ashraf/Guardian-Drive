// prisma/seed.ts
const guidances = [
    // Heart Rate
    { condition: "HIGH_HEART_RATE", severity: "MILD", description: "Elevated heart rate (100-120 bpm)" },
    { condition: "HIGH_HEART_RATE", severity: "MODERATE", description: "High heart rate (120-150 bpm)" },
    { condition: "HIGH_HEART_RATE", severity: "CRITICAL", description: "Dangerously high heart rate (150+ bpm)", specificAction: "Be ready to perform CPR." },
    { condition: "LOW_HEART_RATE", severity: "MILD", description: "Low heart rate (50-60 bpm)" },
    { condition: "LOW_HEART_RATE", severity: "MODERATE", description: "Low heart rate (40-50 bpm)", },
    { condition: "LOW_HEART_RATE", severity: "CRITICAL", description: "Dangerously low heart rate (below 40 bpm)" },

    // SPO2
    { condition: "LOW_SPO2", severity: "MILD", description: "Slightly low oxygen (92-95%)" },
    { condition: "LOW_SPO2", severity: "MODERATE", description: "Low oxygen saturation (88-92%)", specificAction: "Place driver in recovery position." },
    { condition: "LOW_SPO2", severity: "CRITICAL", description: "Critically low oxygen (below 88%)", specificAction: "Begin rescue breathing if they lose consciousness." },

    // Temperature
    { condition: "HIGH_TEMP", severity: "MILD", description: "Mild fever (37.5-38°C)" },
    { condition: "HIGH_TEMP", severity: "MODERATE", description: "Moderate fever (38-39.5°C)" },
    { condition: "HIGH_TEMP", severity: "CRITICAL", description: "High fever (above 39.5°C)", specificAction: "Cool driver aggressively with wet cloths" },
    { condition: "LOW_TEMP", severity: "MODERATE", description: "Mild hypothermia (35-36°C)", specificActions: "Give warm (not hot) drinks if conscious." },
    { condition: "LOW_TEMP", severity: "CRITICAL", description: "Hypothermia (below 35°C)", specificAction: " Warm driver gradually with blankets. Do not rub limbs. Remain still." },

];

//await prisma.firstAidGuidance.createMany({ data: guidances });
