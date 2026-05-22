import fs from "fs";

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

/**
 * Generates a full 7-day training plan utilizing Google Gemini API, with fallback to simulation.
 */
export async function generateTrainingPlanWithAI({ goal, planName, patientInfo }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("Training Engine: GEMINI_API_KEY not found. Using local simulation...");
    return simulateTrainingPlan(goal, planName);
  }

  console.log("Training Engine: Querying Google Gemini API for plan generation...");

  try {
    const systemInstructions = `
You are a professional strength and conditioning coach and personal trainer.
Create a customized 7-day workout routine (Monday to Sunday) for an athlete based on their goal and user information.

Goals can be:
- "hypertrophy" (focused on muscle growth, typical reps 8-12, balanced muscle group division)
- "strength" (focused on maximum strength powerlifting style, typical reps 1-6, compound lifts)
- "endurance" (focused on muscular endurance and cardiovascular capacity, typical reps 15-20)
- "fat_loss" (focused on fat definition/calorie burn, combination of strength, high volume, and cardio segments)

Return a JSON array of 7 items representing the days of the week, starting from Monday (dayIndex 0) to Sunday (dayIndex 6).
Every single day must be listed (if it is a rest day, set muscleGroup to "rest" and exercises to an empty array).
For active days, set muscleGroup to one of: "legs", "chest", "back", "shoulders", "arms", "full_body".
Each active day must have a list of 4-6 exercises with:
- "name": Spanish descriptive name of the exercise.
- "sets": Integer (e.g. 3 or 4).
- "reps": String representing reps or time (e.g. "8-12", "5x5", "30s", "15").
- "weight": A realistic starting weight in kg (Float/Number) or null if it's bodyweight.
- "muscleGroup": The exact target zones worked. It MUST be a comma-separated string containing the primary category (one of: 'legs', 'chest', 'back', 'shoulders', 'arms', 'core', 'full_body') AND any specific target muscles/zones worked (such as 'quads', 'hamstrings', 'glutes', 'calves', 'biceps', 'triceps', 'lats', 'traps', 'lower_back', 'abs'). For example: 'legs, quads, glutes' or 'back, lats, traps' or 'arms, biceps' or 'chest, triceps' or 'legs, calves'.

Return only the raw JSON array matching this structure exactly (No markdown formatting or code blocks):
[
  {
    "dayIndex": 0,
    "name": "Día 1: Pecho e Hombros",
    "muscleGroup": "chest",
    "exercises": [
      {
        "name": "Press de banca plano con barra",
        "sets": 4,
        "reps": "8-10",
        "weight": 60.0,
        "muscleGroup": "chest, triceps, shoulders"
      }
    ]
  },
  ...
]
`;

    const userPrompt = `
Generate a 7-day workout schedule for:
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
    
    // Quick validation to ensure it is an array and has days
    if (Array.isArray(planDays) && planDays.length > 0) {
      return planDays;
    }
    
    throw new Error("Invalid output format returned by AI");

  } catch (error) {
    console.error("Training Engine: Error calling Gemini API. Falling back to simulation...", error);
    return simulateTrainingPlan(goal, planName);
  }
}
