import "./load-env.js";
import prisma from "./database.js";
import { generateTrainingPlanWithAI } from "./trainingEngine.js";

async function test() {
  try {
    console.log("Fetching first patient...");
    const patient = await prisma.patient.findFirst();
    if (!patient) {
      console.log("No patient found in database.");
      return;
    }
    console.log("Found patient:", patient.id, patient.name);

    console.log("Fetching latest evaluation...");
    const latestEval = await prisma.evaluation.findFirst({
      where: { patientId: patient.id },
      orderBy: { date: "desc" }
    });
    console.log("Latest evaluation:", latestEval);

    const patientInfo = {
      name: patient.name,
      gender: patient.gender,
      sport: patient.sport || "General fitness",
      weight: latestEval ? latestEval.weight : 70,
      bodyFat: latestEval ? latestEval.bodyFat : 15
    };

    console.log("Generating plan via AI/Simulator...");
    const generatedDays = await generateTrainingPlanWithAI({
      goal: "hypertrophy",
      planName: "Plan de Prueba AI",
      patientInfo
    });
    console.log("Generated plan days count:", generatedDays ? generatedDays.length : 0);
    console.log("Sample day:", JSON.stringify(generatedDays?.[0], null, 2));

    console.log("Inserting plan into database...");
    const daysCreateInput = (generatedDays || []).map((day) => ({
      dayIndex: day.dayIndex,
      name: day.name,
      muscleGroup: day.muscleGroup,
      exercises: {
        create: (day.exercises || []).map((ex, idx) => ({
          name: ex.name,
          sets: ex.sets || 3,
          reps: String(ex.reps || "8-12"),
          weight: ex.weight !== undefined && ex.weight !== null ? parseFloat(ex.weight) : null,
          muscleGroup: ex.muscleGroup || day.muscleGroup,
          order: idx
        }))
      }
    }));

    const plan = await prisma.trainingPlan.create({
      data: {
        patientId: patient.id,
        name: "Plan de Prueba AI",
        goal: "hypertrophy",
        daysPerWeek: 4,
        isActive: true,
        days: {
          create: daysCreateInput
        }
      },
      include: {
        days: {
          include: {
            exercises: true
          }
        }
      }
    });

    console.log("Plan created successfully in DB. ID:", plan.id);
    console.log("Days in created plan:", plan.days.length);
  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
