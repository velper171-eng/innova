import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

function adjustExerciseVariables(goal, originalEx, aiEx = {}) {
  const result = {
    sets: aiEx.sets || originalEx.sets || 3,
    reps: aiEx.reps || originalEx.reps || "8-12",
    rest: originalEx.rest || "2'",
    rir: originalEx.rir || "2",
    notes: originalEx.notes || ""
  };

  const nameUpper = (originalEx.name || "").toUpperCase();
  const isCompound = 
    nameUpper.includes("PRESS") || 
    nameUpper.includes("HACK") || 
    nameUpper.includes("SQUAT") || 
    nameUpper.includes("REMO") || 
    nameUpper.includes("ROW") || 
    nameUpper.includes("JALÓN") || 
    nameUpper.includes("PULLDOWN") || 
    nameUpper.includes("FONDOS") || 
    nameUpper.includes("DEADLIFT") || 
    nameUpper.includes("MUERTO") ||
    nameUpper.includes("T-BAR");

  if (goal === "strength") {
    // Fuerza Máxima: 1-5 reps compound, 6-8 isolation. 3-5 min rests.
    if (isCompound) {
      result.sets = 5;
      result.reps = "1-5";
      result.rest = "3-5'";
      result.rir = "1-2";
    } else {
      result.sets = 3;
      result.reps = "6-8";
      result.rest = "2'";
      result.rir = "2";
    }
  } else if (goal === "endurance") {
    // Resistencia: 15-20 reps compound, 20-25 isolation. 30-60s rest.
    result.sets = 3;
    result.reps = isCompound ? "15-20" : "20-25";
    result.rest = isCompound ? "60s" : "30-45s";
    result.rir = "2-3";
  } else if (goal === "fat_loss" || goal === "definition") {
    // Definición / Pérdida de Grasa: reduced sets, heavy weights kept.
    if (isCompound) {
      result.sets = 3;
      result.reps = "6-8";
      result.rest = "2-3'";
      result.rir = "1-2";
    } else {
      result.sets = 2;
      result.reps = "10-12";
      result.rest = "1.5'";
      result.rir = "1-2";
    }
    result.notes = (result.notes ? result.notes + ". " : "") + "Intensidad alta para preservar tejido muscular.";
  } else {
    // Hypertrophy / Development (default)
    result.sets = aiEx.sets || originalEx.sets || 3;
    result.reps = aiEx.reps || originalEx.reps || "8-12";
    result.rest = originalEx.rest || "2-3'";
    result.rir = originalEx.rir || "2-3";
  }

  return result;
}

/**
 * Heuristic simulator for training plan generation based on goal.
 * Used as a fallback if GEMINI_API_KEY is not defined or fails.
 */
function simulateTrainingPlan(goal = "hypertrophy", planName = "") {
  console.log(`Training Engine: Simulating workout plan for goal: ${goal}`);
  
  const days = [];

  const addRestDay = (dayIndex, name) => {
    days.push({
      dayIndex,
      name,
      muscleGroup: "rest",
      exercises: []
    });
  };

  if (goal === "hypertrophy") {
    // 4-day Upper/Lower or Push/Pull/Legs/Arms split
    days.push({
      dayIndex: 0,
      name: "Día 1: Pecho y Hombros",
      muscleGroup: "chest",
      exercises: [
        { name: "Press de banca plano con barra", sets: 4, reps: "8-10", weight: 60.0, muscleGroup: "chest, shoulders, triceps" },
        { name: "Press inclinado con mancuernas", sets: 3, reps: "10-12", weight: 22.0, muscleGroup: "chest, shoulders, triceps" },
        { name: "Press militar de pie con barra", sets: 4, reps: "8-10", weight: 40.0, muscleGroup: "shoulders, triceps" },
        { name: "Elevaciones laterales con mancuernas", sets: 3, reps: "12-15", weight: 10.0, muscleGroup: "shoulders" },
        { name: "Cruce de poleas bajas para pecho", sets: 3, reps: "12-15", weight: 20.0, muscleGroup: "chest" }
      ]
    });

    days.push({
      dayIndex: 1,
      name: "Día 2: Espalda y Brazos",
      muscleGroup: "back",
      exercises: [
        { name: "Dominadas pronas (o Jalón al pecho)", sets: 4, reps: "8-12", weight: null, muscleGroup: "back, lats" },
        { name: "Remo con barra inclinado", sets: 4, reps: "8-10", weight: 50.0, muscleGroup: "back, lats, traps" },
        { name: "Pull-over en polea alta con cuerda", sets: 3, reps: "12-15", weight: 25.0, muscleGroup: "back, lats" },
        { name: "Curl de bíceps con barra Z", sets: 3, reps: "10-12", weight: 25.0, muscleGroup: "arms, biceps" },
        { name: "Extensión de tríceps en polea alta", sets: 3, reps: "10-12", weight: 20.0, muscleGroup: "arms, triceps" }
      ]
    });

    addRestDay(2, "Miércoles: Descanso Activo / Cardio Suave");

    days.push({
      dayIndex: 3,
      name: "Día 3: Piernas (Enfoque Cuádriceps)",
      muscleGroup: "legs",
      exercises: [
        { name: "Sentadilla trasera con barra libre", sets: 4, reps: "8-10", weight: 80.0, muscleGroup: "legs, quads, glutes" },
        { name: "Prensa de piernas inclinada 45°", sets: 4, reps: "10-12", weight: 140.0, muscleGroup: "legs, quads" },
        { name: "Peso muerto rumano con barra", sets: 4, reps: "8-10", weight: 70.0, muscleGroup: "legs, hamstrings, glutes" },
        { name: "Extensiones de cuádriceps en máquina", sets: 3, reps: "12-15", weight: 45.0, muscleGroup: "legs, quads" },
        { name: "Elevación de talones (gemelos) de pie", sets: 4, reps: "12-15", weight: 50.0, muscleGroup: "legs, calves" }
      ]
    });

    days.push({
      dayIndex: 4,
      name: "Día 4: Hombros, Brazos y Core",
      muscleGroup: "shoulders",
      exercises: [
        { name: "Press militar sentado con mancuernas", sets: 4, reps: "8-10", weight: 18.0, muscleGroup: "shoulders, triceps" },
        { name: "Elevaciones laterales con mancuernas", sets: 3, reps: "12-15", weight: 10.0, muscleGroup: "shoulders" },
        { name: "Pájaros sentado con mancuernas", sets: 3, reps: "12-15", weight: 8.0, muscleGroup: "shoulders, back, traps" },
        { name: "Curl de bíceps concentrado con mancuerna", sets: 3, reps: "10-12", weight: 12.0, muscleGroup: "arms, biceps" },
        { name: "Copa de tríceps a dos manos", sets: 3, reps: "10-12", weight: 20.0, muscleGroup: "arms, triceps" },
        { name: "Elevaciones de piernas suspendido (Core)", sets: 3, reps: "15", weight: null, muscleGroup: "core, abs" }
      ]
    });

    addRestDay(5, "Sábado: Descanso Total");
    addRestDay(6, "Domingo: Descanso Total");

  } else if (goal === "strength") {
    days.push({
      dayIndex: 0,
      name: "Día 1: Fuerza Empuje (Bench/Squat Focus)",
      muscleGroup: "chest",
      exercises: [
        { name: "Sentadilla trasera pesada", sets: 5, reps: "5", weight: 100.0, muscleGroup: "legs, quads, glutes" },
        { name: "Press de banca plano con barra", sets: 5, reps: "5", weight: 80.0, muscleGroup: "chest, triceps" },
        { name: "Press militar con barra de pie", sets: 4, reps: "6", weight: 45.0, muscleGroup: "shoulders, triceps" },
        { name: "Fondos en paralelas con lastre", sets: 3, reps: "8", weight: 10.0, muscleGroup: "chest, triceps" }
      ]
    });

    days.push({
      dayIndex: 1,
      name: "Día 2: Fuerza Tracción (Deadlift Focus)",
      muscleGroup: "back",
      exercises: [
        { name: "Peso muerto convencional con barra", sets: 5, reps: "5", weight: 120.0, muscleGroup: "legs, glutes, hamstrings, back, lower_back" },
        { name: "Remo con barra inclinado", sets: 4, reps: "6", weight: 65.0, muscleGroup: "back, lats, traps" },
        { name: "Dominadas con lastre", sets: 4, reps: "6", weight: 10.0, muscleGroup: "back, lats" },
        { name: "Curl de bíceps con barra pesada", sets: 3, reps: "8", weight: 35.0, muscleGroup: "arms, biceps" }
      ]
    });

    addRestDay(2, "Miércoles: Descanso");

    days.push({
      dayIndex: 3,
      name: "Día 3: Sentadillas & Press Auxiliar",
      muscleGroup: "legs",
      exercises: [
        { name: "Sentadilla frontal con barra", sets: 4, reps: "6", weight: 80.0, muscleGroup: "legs, quads, glutes" },
        { name: "Press de banca inclinado con barra", sets: 4, reps: "6", weight: 70.0, muscleGroup: "chest, triceps" },
        { name: "Prensa de piernas pesada", sets: 3, reps: "8", weight: 160.0, muscleGroup: "legs, quads" },
        { name: "Rompecráneos con barra Z (tríceps)", sets: 3, reps: "8", weight: 30.0, muscleGroup: "arms, triceps" }
      ]
    });

    addRestDay(4, "Viernes: Descanso");

    days.push({
      dayIndex: 5,
      name: "Día 4: Accesorios & Fuerza de Agarre",
      muscleGroup: "full_body",
      exercises: [
        { name: "Paseo del granjero (Farmer walks)", sets: 4, reps: "40m", weight: 32.0, muscleGroup: "full_body" },
        { name: "Pájaros con mancuernas", sets: 3, reps: "10", weight: 12.0, muscleGroup: "shoulders, back, traps" },
        { name: "Dominadas supinas agarre estrecho", sets: 3, reps: "8", weight: null, muscleGroup: "back, lats, biceps" },
        { name: "Abdominales Rueda (Ab wheel rollouts)", sets: 3, reps: "12", weight: null, muscleGroup: "core, abs" }
      ]
    });

    addRestDay(6, "Domingo: Descanso");

  } else if (goal === "endurance") {
    days.push({
      dayIndex: 0,
      name: "Día 1: Resistencia Fuerza Full Body",
      muscleGroup: "full_body",
      exercises: [
        { name: "Sentadilla goblet con mancuerna", sets: 3, reps: "15-20", weight: 20.0, muscleGroup: "legs, quads, glutes" },
        { name: "Flexiones de pecho (Push-ups)", sets: 3, reps: "20-25", weight: null, muscleGroup: "chest, triceps" },
        { name: "Remo con mancuernas en banco inclinado", sets: 3, reps: "15", weight: 16.0, muscleGroup: "back, lats" },
        { name: "Press de hombros con mancuernas de pie", sets: 3, reps: "15", weight: 12.0, muscleGroup: "shoulders, triceps" },
        { name: "Plancha abdominal estática", sets: 3, reps: "60s", weight: null, muscleGroup: "core, abs" }
      ]
    });

    addRestDay(1, "Martes: Descanso o Running 30-40 min");

    days.push({
      dayIndex: 2,
      name: "Día 2: Circuito Metabólico de Resistencia",
      muscleGroup: "full_body",
      exercises: [
        { name: "Zancadas alternas con mancuernas (lunges)", sets: 3, reps: "30", weight: 10.0, muscleGroup: "legs, quads, glutes" },
        { name: "Jalón al pecho con agarre ancho", sets: 3, reps: "15", weight: 40.0, muscleGroup: "back, lats" },
        { name: "Press de pecho con mancuernas", sets: 3, reps: "15", weight: 16.0, muscleGroup: "chest, triceps" },
        { name: "Elevaciones laterales con mancuernas", sets: 3, reps: "20", weight: 6.0, muscleGroup: "shoulders" },
        { name: "Kettlebell swings (Balanceo de pesa rusa)", sets: 3, reps: "20", weight: 16.0, muscleGroup: "legs, hamstrings, glutes" }
      ]
    });

    addRestDay(3, "Jueves: Descanso");

    days.push({
      dayIndex: 4,
      name: "Día 3: Resistencia de Pierna y Core",
      muscleGroup: "legs",
      exercises: [
        { name: "Prensa de piernas a altas repeticiones", sets: 3, reps: "20", weight: 80.0, muscleGroup: "legs, quads" },
        { name: "Extensiones de piernas en máquina", sets: 3, reps: "20", weight: 30.0, muscleGroup: "legs, quads" },
        { name: "Curl de piernas acostado", sets: 3, reps: "20", weight: 25.0, muscleGroup: "legs, hamstrings" },
        { name: "Burpees cardiovasculares", sets: 3, reps: "15", weight: null, muscleGroup: "full_body" },
        { name: "Abdominales bicicleta", sets: 3, reps: "30", weight: null, muscleGroup: "core, abs" }
      ]
    });

    addRestDay(5, "Sábado: Descanso");
    addRestDay(6, "Domingo: Running o Ciclismo regenerativo");

  } else {
    // fat_loss
    days.push({
      dayIndex: 0,
      name: "Día 1: Fuerza Empuje + HIIT",
      muscleGroup: "chest",
      exercises: [
        { name: "Press de banca plano con mancuernas", sets: 4, reps: "10-12", weight: 24.0, muscleGroup: "chest, triceps" },
        { name: "Press de hombros sentado con mancuernas", sets: 3, reps: "12", weight: 16.0, muscleGroup: "shoulders, triceps" },
        { name: "Aperturas con mancuernas en banco inclinado", sets: 3, reps: "12-15", weight: 12.0, muscleGroup: "chest" },
        { name: "Fondos en banco para tríceps", sets: 3, reps: "15", weight: null, muscleGroup: "arms, triceps" },
        { name: "Cinta de correr: Intervalos HIIT", sets: 1, reps: "15 min", weight: null, muscleGroup: "full_body" }
      ]
    });

    days.push({
      dayIndex: 1,
      name: "Día 2: Fuerza Tracción + Cardio LISS",
      muscleGroup: "back",
      exercises: [
        { name: "Jalón al pecho agarre cerrado", sets: 4, reps: "10-12", weight: 50.0, muscleGroup: "back, lats" },
        { name: "Remo sentado en polea baja", sets: 4, reps: "12", weight: 45.0, muscleGroup: "back, lats" },
        { name: "Face-pulls en polea (hombro posterior)", sets: 3, reps: "15", weight: 20.0, muscleGroup: "shoulders, back, traps" },
        { name: "Curl de bíceps alterno con mancuernas", sets: 3, reps: "12", weight: 12.5, muscleGroup: "arms, biceps" },
        { name: "Caminata inclinada constante (Cardio LISS)", sets: 1, reps: "25 min", weight: null, muscleGroup: "full_body" }
      ]
    });

    addRestDay(2, "Miércoles: Descanso Activo / Abdominales");

    days.push({
      dayIndex: 3,
      name: "Día 3: Piernas - Circuito de Quema Calórica",
      muscleGroup: "legs",
      exercises: [
        { name: "Sentadillas libres con barra", sets: 4, reps: "12", weight: 60.0, muscleGroup: "legs, quads, glutes" },
        { name: "Zancadas caminando con mancuernas", sets: 3, reps: "24 pasos", weight: 12.0, muscleGroup: "legs, quads, glutes" },
        { name: "Prensa de piernas 45°", sets: 3, reps: "15", weight: 100.0, muscleGroup: "legs, quads" },
        { name: "Hip Thrust con barra (Glúteos/Femoral)", sets: 4, reps: "12", weight: 60.0, muscleGroup: "legs, glutes, hamstrings" },
        { name: "Saltos a la comba (Cuerda)", sets: 4, reps: "60s", weight: null, muscleGroup: "full_body" }
      ]
    });

    days.push({
      dayIndex: 4,
      name: "Día 4: Full Body Cardio-Fuerza",
      muscleGroup: "full_body",
      exercises: [
        { name: "Sentadilla Goblet superseriada con Flexiones", sets: 3, reps: "12+15", weight: 20.0, muscleGroup: "full_body, legs, chest, triceps" },
        { name: "Remo con mancuerna a una mano", sets: 3, reps: "12", weight: 20.0, muscleGroup: "back, lats" },
        { name: "Thrusters con mancuernas (Sentadilla + Press)", sets: 3, reps: "12", weight: 10.0, muscleGroup: "full_body, legs, shoulders, triceps" },
        { name: "Mountain climbers (Escaladores)", sets: 3, reps: "45s", weight: null, muscleGroup: "core, abs" },
        { name: "Plancha abdominal con toques de hombro", sets: 3, reps: "15", weight: null, muscleGroup: "core, abs" }
      ]
    });

    addRestDay(5, "Sábado: Descanso Total");
    addRestDay(6, "Domingo: Descanso Total");
  }

  return days;
}

function simulateTrainingPlanFromTemplates(daysPerWeek, goal) {
  console.log(`Training Engine: Simulating workout plan from templates. Days per week: ${daysPerWeek}, Goal: ${goal}`);
  try {
    const templatesPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "trainingTemplates.json");
    const templateData = JSON.parse(fs.readFileSync(templatesPath, "utf-8"));
    const days = [];

    const addRestDay = (dayIndex, name) => {
      days.push({
        dayIndex,
        name,
        muscleGroup: "rest",
        exercises: []
      });
    };

    const getExercises = (key) => {
      return (templateData.days[key] || []).map((ex) => {
        const adjusted = adjustExerciseVariables(goal, ex, {});
        return {
          name: ex.name,
          sets: adjusted.sets,
          reps: adjusted.reps,
          weight: null,
          muscleGroup: ex.muscleGroup === "arms" ? "arms, triceps, biceps" : (ex.muscleGroup === "legs" ? "legs, quads, glutes" : ex.muscleGroup === "chest" ? "chest, triceps" : ex.muscleGroup === "back" ? "back, lats" : ex.muscleGroup),
          videoUrl: ex.videoUrl || "",
          technique: ex.technique || "",
          notes: adjusted.notes,
          rest: adjusted.rest,
          rir: adjusted.rir,
          alternatives: ex.alternatives || []
        };
      });
    };

    if (daysPerWeek === 6) {
      days.push({ dayIndex: 0, name: "Lunes: Empuje 1 (Pecho/Hombro/Tríceps)", muscleGroup: "chest", exercises: getExercises("push 1") });
      days.push({ dayIndex: 1, name: "Martes: Tracción 1 (Espalda/Bíceps)", muscleGroup: "back", exercises: getExercises("pull 1") });
      days.push({ dayIndex: 2, name: "Miércoles: Pierna 1 (Enfoque Cuádriceps)", muscleGroup: "legs", exercises: getExercises("legs 1") });
      days.push({ dayIndex: 3, name: "Jueves: Empuje 2 (Pecho/Hombro/Tríceps)", muscleGroup: "chest", exercises: getExercises("push 2") });
      days.push({ dayIndex: 4, name: "Viernes: Tracción 2 (Espalda/Bíceps)", muscleGroup: "back", exercises: getExercises("pull 2") });
      days.push({ dayIndex: 5, name: "Sábado: Pierna 2 (Enfoque Cadena Posterior)", muscleGroup: "legs", exercises: getExercises("legs 2") });
      addRestDay(6, "Domingo: Descanso");
    } else if (daysPerWeek === 3) {
      days.push({ dayIndex: 0, name: "Lunes: Empuje (Pecho/Hombro/Tríceps)", muscleGroup: "chest", exercises: getExercises("push 1") });
      addRestDay(1, "Martes: Descanso");
      days.push({ dayIndex: 2, name: "Miércoles: Tracción (Espalda/Bíceps)", muscleGroup: "back", exercises: getExercises("pull 1") });
      addRestDay(3, "Jueves: Descanso");
      days.push({ dayIndex: 4, name: "Viernes: Pierna (Enfoque Cuádriceps)", muscleGroup: "legs", exercises: getExercises("legs 1") });
      addRestDay(5, "Sábado: Descanso");
      addRestDay(6, "Domingo: Descanso");
    } else if (daysPerWeek === 5) {
      days.push({ dayIndex: 0, name: "Lunes: Empuje 1 (Pecho/Hombro/Tríceps)", muscleGroup: "chest", exercises: getExercises("push 1") });
      days.push({ dayIndex: 1, name: "Martes: Tracción 1 (Espalda/Bíceps)", muscleGroup: "back", exercises: getExercises("pull 1") });
      days.push({ dayIndex: 2, name: "Miércoles: Pierna 1 (Enfoque Cuádriceps)", muscleGroup: "legs", exercises: getExercises("legs 1") });
      addRestDay(3, "Jueves: Descanso");
      days.push({ dayIndex: 4, name: "Viernes: Empuje 2 (Pecho/Hombro/Tríceps)", muscleGroup: "chest", exercises: getExercises("push 2") });
      days.push({ dayIndex: 5, name: "Sábado: Tracción 2 (Espalda/Bíceps)", muscleGroup: "back", exercises: getExercises("pull 2") });
      addRestDay(6, "Domingo: Descanso");
    } else {
      // 4 days (default)
      days.push({ dayIndex: 0, name: "Lunes: Empuje 1 (Pecho/Hombro/Tríceps)", muscleGroup: "chest", exercises: getExercises("push 1") });
      days.push({ dayIndex: 1, name: "Martes: Tracción 1 (Espalda/Bíceps)", muscleGroup: "back", exercises: getExercises("pull 1") });
      addRestDay(2, "Miércoles: Descanso");
      days.push({ dayIndex: 3, name: "Jueves: Pierna 1 (Enfoque Cuádriceps)", muscleGroup: "legs", exercises: getExercises("legs 1") });
      days.push({ dayIndex: 4, name: "Viernes: Empuje 2 (Pecho/Hombro/Tríceps)", muscleGroup: "chest", exercises: getExercises("push 2") });
      addRestDay(5, "Sábado: Descanso");
      addRestDay(6, "Domingo: Descanso");
    }
    return days;
  } catch (error) {
    console.error("Error in simulateTrainingPlanFromTemplates:", error);
    return simulateTrainingPlan(goal, "");
  }
}

/**
 * Generates a full 7-day training plan utilizing Google Gemini API, with fallback to simulation.
 */
export async function generateTrainingPlanWithAI({ goal, planName, patientInfo, daysPerWeek }) {
  const targetDays = daysPerWeek ? parseInt(daysPerWeek) : 4;
  const apiKey = process.env.GEMINI_API_KEY;

  if (targetDays === 6) {
    console.log("Training Engine: 6 days per week requested. Bypassing Gemini to use Excel template directly.");
    return simulateTrainingPlanFromTemplates(6, goal);
  }

  if (!apiKey) {
    console.log("Training Engine: GEMINI_API_KEY not found. Using template-based simulator...");
    return simulateTrainingPlanFromTemplates(targetDays, goal);
  }

  console.log(`Training Engine: Querying Google Gemini API for ${targetDays}-day plan...`);

  try {
    const templatesPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "trainingTemplates.json");
    const templateData = JSON.parse(fs.readFileSync(templatesPath, "utf-8"));

    // Flatten all template exercises to present them to Gemini
    const exerciseList = [];
    for (const dayKey of Object.keys(templateData.days)) {
      for (const ex of templateData.days[dayKey]) {
        exerciseList.push({
          name: ex.name,
          muscleGroup: ex.muscleGroup
        });
      }
    }
    
    // Deduplicate exercise list by name
    const uniqueExercises = [];
    const seenNames = new Set();
    for (const ex of exerciseList) {
      const norm = ex.name.trim().toUpperCase();
      if (!seenNames.has(norm)) {
        seenNames.add(norm);
        uniqueExercises.push(ex);
      }
    }

    const exercisesPromptText = uniqueExercises.map(ex => `- ${ex.name} (Primary muscle group: ${ex.muscleGroup})`).join("\n");

    const systemInstructions = `
You are a professional strength and conditioning coach.
Create a customized 7-day workout routine (Monday to Sunday) for an athlete based on their goal, user info, and days per week requested.

The user wants to train EXACTLY ${targetDays} active days per week. The remaining ${7 - targetDays} days must be rest days (muscleGroup: "rest", exercises: []).

You MUST choose exercises ONLY from the following list of professional exercises (do NOT invent new names):
${exercisesPromptText}

Goals:
- "hypertrophy" (muscle growth, reps 6-12, balanced PPL/split)
- "strength" (powerlifting style, heavy compound, reps 1-6)
- "endurance" (cardio & endurance, reps 15-20)
- "fat_loss" (calorie burn, high volume, combination of strength and conditioning)

For each active day, assign 4 to 6 exercises from the list above. Ensure they represent a logical, professional training split.

Return a JSON array of 7 items representing the days of the week, starting from Monday (dayIndex 0) to Sunday (dayIndex 6).
For active days, set muscleGroup to one of: "legs", "chest", "back", "shoulders", "arms", "full_body".
Each active day must have a list of exercises with:
- "name": The exact name of the exercise from the provided list.
- "sets": Integer (e.g. 3 or 4)
- "reps": String representing reps or time (e.g. "6-10", "10-15")
- "weight": null
- "muscleGroup": The target zone (e.g. "chest", "back", "legs", "shoulders", "arms", "full_body").

Return only the raw JSON array matching this structure exactly (No markdown formatting or code blocks):
[
  {
    "dayIndex": 0,
    "name": "Día 1: Empuje (Pecho/Hombro/Tríceps)",
    "muscleGroup": "chest",
    "exercises": [
      {
        "name": "CHEST PRESS INCLINADO CONVERGENTE",
        "sets": 3,
        "reps": "6-10",
        "weight": null,
        "muscleGroup": "chest"
      }
    ]
  },
  ...
]
`;

    const userPrompt = `
Generate a 7-day workout schedule with EXACTLY ${targetDays} training days for:
- Plan Name: ${planName || "Plan de Entrenamiento Personalizado"}
- Goal: ${goal}
- Athlete Info:
  - Name: ${patientInfo?.name || "Athlete"}
  - Gender: ${patientInfo?.gender || "Not specified"}
  - Sport/Activity: ${patientInfo?.sport || "General fitness"}
  - Latest Weight: ${patientInfo?.weight || "70"} kg
  - Latest Body Fat: ${patientInfo?.bodyFat || "15"}%
`;

    const payload = {
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      systemInstruction: {
        parts: [{ text: systemInstructions }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const planDays = JSON.parse(responseText.trim());
    
    if (Array.isArray(planDays) && planDays.length > 0) {
      // Map and enrich parsed exercises with full metadata from trainingTemplates.json
      const templateExercisesMap = new Map();
      for (const dayKey of Object.keys(templateData.days)) {
        for (const ex of templateData.days[dayKey]) {
          templateExercisesMap.set(ex.name.trim().toUpperCase(), ex);
        }
      }

      for (const day of planDays) {
        if (day.exercises && Array.isArray(day.exercises)) {
          day.exercises = day.exercises.map((ex) => {
            const match = templateExercisesMap.get(ex.name.trim().toUpperCase());
            if (match) {
              const adjusted = adjustExerciseVariables(goal, match, ex);
              return {
                name: match.name,
                sets: adjusted.sets,
                reps: adjusted.reps,
                weight: null,
                muscleGroup: match.muscleGroup === "arms" ? "arms, triceps, biceps" : (match.muscleGroup === "legs" ? "legs, quads, glutes" : match.muscleGroup === "chest" ? "chest, triceps" : match.muscleGroup === "back" ? "back, lats" : match.muscleGroup),
                videoUrl: match.videoUrl || "",
                technique: match.technique || "",
                notes: adjusted.notes,
                rest: adjusted.rest,
                rir: adjusted.rir,
                alternatives: match.alternatives || []
              };
            } else {
              return {
                name: ex.name,
                sets: ex.sets || 3,
                reps: ex.reps || "8-12",
                weight: null,
                muscleGroup: ex.muscleGroup || "full_body",
                videoUrl: "",
                technique: "",
                notes: "",
                rest: "",
                rir: "",
                alternatives: []
              };
            }
          });
        }
      }
      return planDays;
    }
    
    throw new Error("Invalid output format returned by AI");

  } catch (error) {
    console.error("Training Engine: Error calling Gemini API. Falling back to simulation...", error);
    return simulateTrainingPlanFromTemplates(targetDays, goal);
  }
}

