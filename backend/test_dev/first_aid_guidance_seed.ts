import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient();

const guidances = [
    // Heart Rate
    { condition: "HIGH_HEART_RATE", severity: "MILD", description: "Normal Range of driver's heart rate" },
    { condition: "HIGH_HEART_RATE", severity: "MODERATE", description: "High heart rate" },
    { condition: "HIGH_HEART_RATE", severity: "CRITICAL", description: "Dangerously high heart rate", specificAction: "Be ready to perform CPR." },
    { condition: "LOW_HEART_RATE", severity: "MILD", description: "Normal Range of driver's heart rate" },
    { condition: "LOW_HEART_RATE", severity: "MODERATE", description: "Low heart rate", },
    { condition: "LOW_HEART_RATE", severity: "CRITICAL", description: "Dangerously low heart rate" },

    // SPO2
    { condition: "LOW_SPO2", severity: "MILD", description: "Normal Range of oxygen" },
    { condition: "LOW_SPO2", severity: "MODERATE", description: "Low oxygen saturation", specificAction: "Place driver in recovery position." },
    { condition: "LOW_SPO2", severity: "CRITICAL", description: "Critically low oxygen", specificAction: "Begin rescue breathing if they lose consciousness." },

    // Temperature
    { condition: "HIGH_TEMP", severity: "MILD", description: "Normal Range of temperature" },
    { condition: "HIGH_TEMP", severity: "MODERATE", description: "Elevated fever a little" },
    { condition: "HIGH_TEMP", severity: "CRITICAL", description: "High fever", specificAction: "Cool driver aggressively with wet cloths" },
    { condition: "LOW_TEMP", severity: "MODERATE", description: "Mild hypothermia (35-36°C)", specificAction: "Give warm (not hot) drinks if conscious." },
    { condition: "LOW_TEMP", severity: "CRITICAL", description: "Hypothermia (below 35°C)", specificAction: " Warm driver gradually with blankets. Do not rub limbs. Remain still." },

];

async function main() {
    await prisma.firstAidGuidance.createMany({
        data: guidances,
    });

    console.log("Guidance seeded!");
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });

/*
const guidances = [
    // Heart Rate
    { condition: "HIGH_HEART_RATE", severity: "NORMAL", description: "Normal Range of heart rate" },
    { condition: "HIGH_HEART_RATE", severity: "CRITICAL", description: "High heart rate" },
    { condition: "HIGH_HEART_RATE", severity: "SEVERE", description: "Dangerously high heart rate", specificAction: "Be ready to perform CPR." },
    { condition: "LOW_HEART_RATE", severity: "NORMAL", description: "Low heart rate" },
    { condition: "LOW_HEART_RATE", severity: "CRITICAL", description: "Low heart rate", },
    { condition: "LOW_HEART_RATE", severity: "SEVERE", description: "Dangerously low heart rate " },

    // SPO2
    { condition: "LOW_SPO2", severity: "NORMAL", description: "Normal Range of oxygen" },
    { condition: "LOW_SPO2", severity: "CRITICAL", description: "Low oxygen saturation", specificAction: "Place driver in recovery position." },
    { condition: "LOW_SPO2", severity: "SEVERE", description: "Critically low oxygen", specificAction: "Begin rescue breathing if they lose consciousness." },

    // Temperature
    { condition: "HIGH_TEMP", severity: "NORMAL", description: "Normal Range of temperature" },
    { condition: "HIGH_TEMP", severity: "CRITICAL", description: "Elevated fever a little" },
    { condition: "HIGH_TEMP", severity: "SEVERE", description: "High fever", specificAction: "Cool driver aggressively with wet cloths" },
    { condition: "LOW_TEMP", severity: "CRITICAL", description: "Mild hypothermia", specificAction: "Give warm (not hot) drinks if conscious." },
    { condition: "LOW_TEMP", severity: "SEVERE", description: "Hypothermia", specificAction: " Warm driver gradually with blankets. Do not rub limbs. Remain still." },

];
*/

//await prisma.firstAidGuidance.createMany({ data: guidances });
