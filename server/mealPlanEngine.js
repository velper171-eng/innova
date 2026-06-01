/**
 * Advanced Metabolic and Meal Plan Generator Engine
 */

/**
 * Calculates BMR (Basal Metabolic Rate) based on various scientific formulas
 */
export function calculateBMR({ weight, height, age, gender, formula = "mifflin_st_jeor", bodyFat }) {
  const w = parseFloat(weight) || 70;
  const h = parseFloat(height) || 170;
  const a = parseInt(age, 10) || 30;
  const g = gender === "female" ? "female" : "male";
  const bf = parseFloat(bodyFat);

  // 1. Katch-McArdle (most accurate for athletes if body fat is available)
  if (formula === "katch_mcardle" && !isNaN(bf) && bf > 0) {
    const lbm = w * (1 - bf / 100);
    const bmr = 370 + (21.6 * lbm);
    return { bmr: Math.round(bmr), formulaUsed: "Katch-McArdle (Masa Magra)" };
  }

  // 2. Harris-Benedict Revised (1984)
  if (formula === "harris_benedict") {
    if (g === "male") {
      const bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
      return { bmr: Math.round(bmr), formulaUsed: "Harris-Benedict Revisada (1984)" };
    } else {
      const bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
      return { bmr: Math.round(bmr), formulaUsed: "Harris-Benedict Revisada (1984)" };
    }
  }

  // 3. Mifflin-St Jeor (1990) - Default fallback
  if (g === "male") {
    const bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    return { bmr: Math.round(bmr), formulaUsed: "Mifflin-St Jeor (1990)" };
  } else {
    const bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    return { bmr: Math.round(bmr), formulaUsed: "Mifflin-St Jeor (1990)" };
  }
}

/**
 * Calculates GET (Gasto Energético Total / TDEE)
 */
export function calculateTDEE(bmr, activityLevel = 1.55) {
  const multiplier = parseFloat(activityLevel) || 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * Calculates custom target calories and macronutrients based on objective and factors
 */
export function calculateTargetMacros({ weight, tdee, goal, proteinFactor = 2.2, fatFactor = 0.8 }) {
  const w = parseFloat(weight) || 70;
  const targetTdee = parseFloat(tdee) || 2000;
  const pFactor = parseFloat(proteinFactor) || 2.2;
  const fFactor = parseFloat(fatFactor) || 0.8;

  let calories = targetTdee;

  // Apply deficit or surplus
  if (goal === "fat_loss") {
    calories = Math.round(targetTdee * 0.82); // 18% deficit
  } else if (goal === "hypertrophy") {
    calories = Math.round(targetTdee * 1.12); // 12% surplus
  }

  // Cap minimum calories safely
  calories = Math.max(1200, calories);

  // Macros calculations
  const proteinG = Math.round(w * pFactor);
  const proteinKcal = proteinG * 4;

  const fatG = Math.round(w * fFactor);
  const fatKcal = fatG * 9;

  const carbKcal = Math.max(0, calories - proteinKcal - fatKcal);
  const carbG = Math.round(carbKcal / 4);

  return {
    calories,
    protein: proteinG,
    carbs: carbG,
    fat: fatG
  };
}

/**
 * Generates portion-exchange meal structure matching the target macros
 */
export function generateExchangePortions(macros) {
  const { calories, protein, carbs, fat } = macros;

  // Exchange nutritional values constants
  // Lacteo, Sustituto, Carne, Harina, Fruta, Verdura, Nueces, Grasas
  const values = {
    lacteos: { kcal: 75, prot: 10.0, carbs: 3.9, fat: 1.9 },
    sustitutos: { kcal: 75, prot: 6.5, carbs: 0.8, fat: 5.0 },
    carnes: { kcal: 85, prot: 18.5, carbs: 0.0, fat: 1.0 },
    harinas: { kcal: 95, prot: 2.0, carbs: 20.0, fat: 0.5 },
    frutas: { kcal: 60, prot: 0.8, carbs: 15.0, fat: 0.2 },
    verduras: { kcal: 25, prot: 1.0, carbs: 5.0, fat: 0.1 },
    nueces: { kcal: 58, prot: 1.5, carbs: 2.2, fat: 4.8 },
    grasas: { kcal: 48, prot: 0.0, carbs: 0.0, fat: 5.0 }
  };

  // Base setup depending on calories level
  let lacteos = 1;
  let sustitutos = 3;
  let carnes = 2;
  let harinas = 4;
  let frutas = 2;
  let verduras = 4;
  let nueces = 1;
  let grasas = 2;

  if (calories >= 2200) {
    lacteos = 2;
    sustitutos = 4;
    carnes = 3.5;
    harinas = 8;
    frutas = 3;
    verduras = 5;
    nueces = 2;
    grasas = 3;
  } else if (calories < 1600) {
    lacteos = 1;
    sustitutos = 2;
    carnes = 2;
    harinas = 3;
    frutas = 1.5;
    verduras = 3;
    nueces = 0.5;
    grasas = 1.5;
  }

  // Iterative heuristics to optimize portion distribution to match macro targets
  for (let iter = 0; iter < 3; iter++) {
    // 1. Optimize protein via carnes
    const currentProt = (lacteos * values.lacteos.prot) + (sustitutos * values.sustitutos.prot) + (carnes * values.carnes.prot) + (harinas * values.harinas.prot) + (frutas * values.frutas.prot) + (verduras * values.verduras.prot) + (nueces * values.nueces.prot);
    const protDiff = protein - currentProt;
    carnes = Math.max(1, parseFloat((carnes + (protDiff / values.carnes.prot)).toFixed(1)));

    // 2. Optimize fat via grasas
    const currentFat = (lacteos * values.lacteos.fat) + (sustitutos * values.sustitutos.fat) + (carnes * values.carnes.fat) + (harinas * values.harinas.fat) + (frutas * values.frutas.fat) + (verduras * values.verduras.fat) + (nueces * values.nueces.fat) + (grasas * values.grasas.fat);
    const fatDiff = fat - currentFat;
    grasas = Math.max(1, parseFloat((grasas + (fatDiff / values.grasas.fat)).toFixed(1)));

    // 3. Optimize carbs via harinas
    const currentCarbs = (lacteos * values.lacteos.carbs) + (sustitutos * values.sustitutos.carbs) + (carnes * values.carnes.carbs) + (harinas * values.harinas.carbs) + (frutas * values.frutas.carbs) + (verduras * values.verduras.carbs) + (nueces * values.nueces.carbs) + (grasas * values.grasas.carbs);
    const carbsDiff = carbs - currentCarbs;
    harinas = Math.max(2, parseFloat((harinas + (carbsDiff / values.harinas.carbs)).toFixed(1)));
  }

  return {
    lacteos: Math.round(lacteos * 2) / 2, // round to nearest 0.5
    sustitutos: Math.round(sustitutos * 2) / 2,
    carnes: Math.round(carnes * 2) / 2,
    harinas: Math.round(harinas * 2) / 2,
    frutas: Math.round(frutas * 2) / 2,
    verduras: Math.round(verduras * 2) / 2,
    nueces: Math.round(nueces * 2) / 2,
    grasas: Math.round(grasas * 2) / 2
  };
}

/**
 * Distributes portion exchanges and assigns meals with recipes / suggestions
 */
export function buildMealPlanSchedule(portions, goal) {
  // We distribute portions into 5 meals
  const p = { ...portions };
  
  // Desayuno (Breakfast)
  const bLact = p.lacteos >= 2 ? 1 : 0;
  const bSust = Math.min(p.sustitutos, 3);
  p.sustitutos -= bSust;
  const bHar = Math.min(p.harinas, p.harinas >= 8 ? 3 : 2);
  p.harinas -= bHar;
  const bFr = p.frutas >= 2 ? 1 : 0.5;
  p.frutas -= bFr;
  const bVer = 1;
  p.verduras -= 1;
  const bGr = p.grasas >= 3 ? 1 : 0;
  p.grasas -= bGr;

  // Media Mañana (Mid-Morning Snack)
  const mmLact = p.lacteos >= 1 ? 1 : 0;
  p.lacteos -= mmLact;
  const mmHar = Math.min(p.harinas, 2);
  p.harinas -= mmHar;
  const mmFr = p.frutas >= 1.5 ? 1 : 0.5;
  p.frutas -= mmFr;
  const mmNuece = Math.min(p.nueces, 0.5);
  p.nueces -= mmNuece;

  // Almuerzo (Lunch)
  const lCar = Math.min(p.carnes, p.carnes >= 4 ? 2.5 : 2);
  p.carnes -= lCar;
  const lHar = Math.min(p.harinas, p.harinas >= 5 ? 3.5 : 2.5);
  p.harinas -= lHar;
  const lVer = Math.min(p.verduras, 2);
  p.verduras -= lVer;
  const lGr = p.grasas >= 2 ? 1 : 0.5;
  p.grasas -= lGr;

  // Media Tarde (Mid-Afternoon Snack)
  const mtLact = p.lacteos > 0 ? p.lacteos : 0;
  p.lacteos = 0;
  const mtCar = p.carnes >= 2 ? 1 : 0; // standard 1 scoop whey/protein
  p.carnes -= mtCar;
  const mtHar = Math.min(p.harinas, 2);
  p.harinas -= mtHar;
  const mtFr = p.frutas > 0 ? p.frutas : 0;
  p.frutas = 0;
  const mtNuece = p.nueces > 0 ? p.nueces : 0;
  p.nueces = 0;

  // Cena (Dinner)
  const dSust = p.sustitutos > 0 ? p.sustitutos : 0;
  const dCar = p.carnes > 0 ? p.carnes : 1;
  const dHar = p.harinas > 0 ? p.harinas : 1;
  const dVer = p.verduras > 0 ? p.verduras : 1;
  const dGr = p.grasas > 0 ? p.grasas : 0.5;

  return [
    {
      name: "Desayuno",
      time: "07:00 AM",
      portions: {
        lacteos: bLact,
        sustitutos: bSust,
        carnes: 0,
        harinas: bHar,
        frutas: bFr,
        verduras: bVer,
        nueces: 0,
        grasas: bGr
      },
      foods: `• 3 huevos enteros revueltos con vegetales (espinacas, champiñones o tomate/cebolla).
• ${bHar} tajadas de pan integral tostado o 1 arepa de maíz blanco mediana.
• ${bFr} taza de fresas picadas o melón.
• Café tinto o infusión aromática caliente endulzada con Stevia.`
    },
    {
      name: "Media Mañana",
      time: "10:00 AM",
      portions: {
        lacteos: mmLact,
        sustitutos: 0,
        carnes: 0,
        harinas: mmHar,
        frutas: mmFr,
        verduras: 0,
        nueces: mmNuece,
        grasas: 0
      },
      foods: `• 200g de yogurt griego natural sin dulce o 1 vaso de kéfir.
• ${mmHar * 30}g de avena en hojuelas (aproximadamente 4 cucharadas soperas) remojada.
• ${mmFr} porción de fruta picada (ej: manzana verde o kiwi).
• ${mmNuece > 0 ? "5 almendras o 10g de maní sin sal." : ""}`
    },
    {
      name: "Almuerzo",
      time: "01:30 PM",
      portions: {
        lacteos: 0,
        sustitutos: 0,
        carnes: lCar,
        harinas: lHar,
        frutas: 0,
        verduras: lVer,
        nueces: 0,
        grasas: lGr
      },
      foods: `• ${Math.round(lCar * 80)}g de pechuga de pollo a la plancha (o lomo de res magro).
• ${Math.round(lHar * 70)}g de arroz integral o puré de papa criolla/común.
• Ensalada fresca abundante (${Math.round(lVer * 150)}g) de lechuga, pepino, zanahoria y brócoli.
• Aderezo: 1 cucharadita de aceite de oliva y limón.
• Bebida: Vaso de agua saborizada fría o infusión helada.`
    },
    {
      name: "Media Tarde",
      time: "04:30 PM",
      portions: {
        lacteos: mtLact,
        sustitutos: 0,
        carnes: mtCar,
        harinas: mtHar,
        frutas: mtFr,
        verduras: 0,
        nueces: mtNuece,
        grasas: 0
      },
      foods: `• 1 batido de proteína en agua (1 scoop / ${Math.round(mtCar * 30 || 30)}g de proteína en polvo).
• ${mtHar} tostadas horneadas de arroz o maíz soplado.
• ${mtFr > 0 ? `1 manzana mediana picada o porción de piña.` : "1 porción pequeña de fruta."}
• ${mtNuece > 0 ? "5 almendras tostadas o semillas de chía espolvoreadas." : ""}`
    },
    {
      name: "Cena",
      time: "07:30 PM",
      portions: {
        lacteos: 0,
        sustitutos: dSust,
        carnes: dCar,
        harinas: dHar,
        frutas: 0,
        verduras: dVer,
        nueces: 0,
        grasas: dGr
      },
      foods: `• ${Math.round(dCar * 80)}g de pechuga de pollo desmechada o filete de pescado blanco asado.
• ${dSust > 0 ? `${Math.round(dSust * 30)}g de queso ricotta o mozzarella bajo en grasa.` : ""}
• ${Math.round(dHar * 70)}g de camote (batata) o arepa de maíz delgada.
• Ensalada mixta templada (rúgula, tomate cherry y espárragos al vapor) con aguacate.
• Bebida: Infusión tibia de manzanilla o diente de león antes de dormir.`
    }
  ];
}

/**
 * Main function to generate a complete meal plan
 */
export function generateMealPlan(data) {
  const { weight, height, age, gender, goal, activityLevel, formula, bodyFat, proteinFactor, fatFactor } = data;

  const { bmr, formulaUsed } = calculateBMR({ weight, height, age, gender, formula, bodyFat });
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetMacros = calculateTargetMacros({ weight, tdee, goal, proteinFactor, fatFactor });
  const portions = generateExchangePortions(targetMacros);
  const meals = buildMealPlanSchedule(portions, goal);

  return {
    bmr,
    formulaUsed,
    tdee,
    targetMacros,
    portions,
    meals
  };
}
