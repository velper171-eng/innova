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
  const p = { ...portions };

  // 1. PÉRDIDA DE GRASA / DEFINICIÓN (4 COMIDAS AL DÍA - Más saciante para déficit calórico)
  if (goal === "fat_loss") {
    // Desayuno
    const bLact = p.lacteos >= 1.5 ? 1 : 0;
    p.lacteos -= bLact;
    const bSust = Math.min(p.sustitutos, 2);
    p.sustitutos -= bSust;
    const bHar = Math.min(p.harinas, 2);
    p.harinas -= bHar;
    const bFr = p.frutas >= 1.5 ? 1 : 0.5;
    p.frutas -= bFr;
    const bVer = 1;
    p.verduras -= bVer;
    const bGr = p.grasas >= 2 ? 1 : 0.5;
    p.grasas -= bGr;

    // Almuerzo
    const lCar = Math.min(p.carnes, p.carnes >= 3 ? 2.5 : 2);
    p.carnes -= lCar;
    const lHar = Math.min(p.harinas, p.harinas >= 3 ? 2.5 : 2);
    p.harinas -= lHar;
    const lVer = Math.min(p.verduras, 2);
    p.verduras -= lVer;
    const lGr = p.grasas >= 2 ? 1 : 0.5;
    p.grasas -= lGr;

    // Media Tarde
    const mtCar = p.carnes >= 1 ? 1 : 0;
    p.carnes -= mtCar;
    const mtFr = p.frutas > 0 ? p.frutas : 0;
    p.frutas = 0;
    const mtNuece = p.nueces > 0 ? p.nueces : 0;
    p.nueces = 0;

    // Cena
    const dLact = p.lacteos > 0 ? p.lacteos : 0;
    p.lacteos = 0;
    const dSust = p.sustitutos > 0 ? p.sustitutos : 0;
    p.sustitutos = 0;
    const dCar = p.carnes > 0 ? p.carnes : 1;
    p.carnes = 0;
    const dHar = p.harinas > 0 ? p.harinas : 1;
    p.harinas = 0;
    const dVer = p.verduras > 0 ? p.verduras : 1;
    p.verduras = 0;
    const dGr = p.grasas > 0 ? p.grasas : 0.5;
    p.grasas = 0;

    return [
      {
        name: "Desayuno",
        time: "08:00 AM",
        portions: { lacteos: bLact, sustitutos: bSust, carnes: 0, harinas: bHar, frutas: bFr, verduras: bVer, nueces: 0, grasas: bGr },
        foods: `• 3 claras de huevo y 1 huevo entero revueltos con espinacas y tomate.
• ${bHar} tajadas de pan integral tostado o 1 arepa pequeña.
• ${bFr} taza de papaya picada o melón.
• Café tinto o infusión aromática sin azúcar.`
      },
      {
        name: "Almuerzo",
        time: "01:30 PM",
        portions: { lacteos: 0, sustitutos: 0, carnes: lCar, harinas: lHar, frutas: 0, verduras: lVer, nueces: 0, grasas: lGr },
        foods: `• ${Math.round(lCar * 80)}g de pechuga de pollo a la plancha o lomo de res magro.
• ${Math.round(lHar * 70)}g de arroz integral o quinua cocida.
• Ensalada fresca abundante (${Math.round(lVer * 150)}g) de lechuga, pepino y brócoli.
• Aderezo: 1 cucharadita de aceite de oliva y limón.`
      },
      {
        name: "Media Tarde",
        time: "05:00 PM",
        portions: { lacteos: 0, sustitutos: 0, carnes: mtCar, harinas: 0, frutas: mtFr, verduras: 0, nueces: mtNuece, grasas: 0 },
        foods: `• ${mtCar > 0 ? "1 batido de proteína en agua (1 scoop)." : "2 claras de huevo cocidas."}
• ${mtFr > 0 ? `${mtFr} taza de fresas picadas o manzana verde.` : ""}
• ${mtNuece > 0 ? `${Math.round(mtNuece * 10)}g de almendras tostadas.` : ""}`
      },
      {
        name: "Cena",
        time: "08:00 PM",
        portions: { lacteos: dLact, sustitutos: dSust, carnes: dCar, harinas: dHar, frutas: 0, verduras: dVer, nueces: 0, grasas: dGr },
        foods: `• ${Math.round(dCar * 80)}g de pescado blanco (tilapia o merluza) asado o pechuga de pollo.
• ${dHar > 0 ? `${Math.round(dHar * 70)}g de camote cocido.` : ""}
• Ensalada mixta templada de champiñones y espárragos al vapor.
• Aderezo: 1 cucharadita de aceite de oliva.`
      }
    ];
  }

  // 2. AUMENTO DE MASA MUSCULAR / HIPERTROFIA (6 COMIDAS AL DÍA - Estimulación constante de síntesis proteica)
  if (goal === "hypertrophy") {
    // Desayuno
    const bLact = p.lacteos >= 2 ? 1 : 0;
    p.lacteos -= bLact;
    const bSust = Math.min(p.sustitutos, 3);
    p.sustitutos -= bSust;
    const bHar = Math.min(p.harinas, p.harinas >= 8 ? 3 : 2);
    p.harinas -= bHar;
    const bFr = p.frutas >= 2 ? 1 : 0.5;
    p.frutas -= bFr;
    const bVer = 1;
    p.verduras -= bVer;
    const bGr = p.grasas >= 3 ? 1 : 0.5;
    p.grasas -= bGr;

    // Media Mañana
    const mmLact = p.lacteos >= 1 ? 1 : 0;
    p.lacteos -= mmLact;
    const mmHar = Math.min(p.harinas, 2);
    p.harinas -= mmHar;
    const mmFr = p.frutas >= 1 ? 1 : 0.5;
    p.frutas -= mmFr;

    // Almuerzo
    const lCar = Math.min(p.carnes, p.carnes >= 4 ? 2.5 : 2);
    p.carnes -= lCar;
    const lHar = Math.min(p.harinas, p.harinas >= 5 ? 3 : 2.5);
    p.harinas -= lHar;
    const lVer = Math.min(p.verduras, 2);
    p.verduras -= lVer;
    const lGr = p.grasas >= 2 ? 1 : 0.5;
    p.grasas -= lGr;

    // Media Tarde
    const mtCar = p.carnes >= 2 ? 1.5 : 1;
    p.carnes -= mtCar;
    const mtHar = Math.min(p.harinas, 2);
    p.harinas -= mtHar;
    const mtFr = p.frutas >= 1 ? 1 : 0;
    p.frutas -= mtFr;

    // Cena
    const dCar = Math.min(p.carnes, p.carnes > 0 ? p.carnes : 1);
    p.carnes -= dCar;
    const dHar = Math.min(p.harinas, p.harinas > 0 ? p.harinas : 1);
    p.harinas -= dHar;
    const dVer = Math.min(p.verduras, p.verduras > 0 ? p.verduras : 1);
    p.verduras -= dVer;
    const dGr = p.grasas >= 1.5 ? 1 : 0.5;
    p.grasas -= dGr;

    // Merienda Nocturna (Antes de Dormir)
    const nLact = p.lacteos > 0 ? p.lacteos : 0;
    p.lacteos = 0;
    const nSust = p.sustitutos > 0 ? p.sustitutos : 0;
    p.sustitutos = 0;
    const nCar = p.carnes > 0 ? p.carnes : 0;
    p.carnes = 0;
    const nHar = p.harinas > 0 ? p.harinas : 0;
    p.harinas = 0;
    const nFr = p.frutas > 0 ? p.frutas : 0;
    p.frutas = 0;
    const nVer = p.verduras > 0 ? p.verduras : 0;
    p.verduras = 0;
    const nNuece = p.nueces > 0 ? p.nueces : 1;
    p.nueces = 0;
    const nGr = p.grasas > 0 ? p.grasas : 0.5;
    p.grasas = 0;

    return [
      {
        name: "Desayuno",
        time: "07:00 AM",
        portions: { lacteos: bLact, sustitutos: bSust, carnes: 0, harinas: bHar, frutas: bFr, verduras: bVer, nueces: 0, grasas: bGr },
        foods: `• 3 huevos enteros revueltos con espinacas y cebolla.
• ${bHar} tajadas de pan integral o 1 arepa mediana.
• ${bFr} taza de papaya picada o piña.
• Café con leche descremada o yogurt.`
      },
      {
        name: "Media Mañana",
        time: "10:00 AM",
        portions: { lacteos: mmLact, sustitutos: 0, carnes: 0, harinas: mmHar, frutas: mmFr, verduras: 0, nueces: 0, grasas: 0 },
        foods: `• 200g de yogurt griego sin azúcar o kéfir.
• ${mmHar * 30}g de avena en hojuelas cocida con canela.
• ${mmFr} porción de fruta fresca picada (kiwi o melón).`
      },
      {
        name: "Almuerzo",
        time: "01:30 PM",
        portions: { lacteos: 0, sustitutos: 0, carnes: lCar, harinas: lHar, frutas: 0, verduras: lVer, nueces: 0, grasas: lGr },
        foods: `• ${Math.round(lCar * 80)}g de pechuga de pollo asada o carne magra.
• ${Math.round(lHar * 70)}g de arroz integral o pasta integral cocida.
• Porción generosa de ensalada mixta y brócoli al vapor.
• 1 cucharadita de aceite de oliva virgen extra.`
      },
      {
        name: "Media Tarde",
        time: "04:30 PM",
        portions: { lacteos: 0, sustitutos: 0, carnes: mtCar, harinas: mtHar, frutas: mtFr, verduras: 0, nueces: 0, grasas: 0 },
        foods: `• 1 scoop de proteína de suero (whey) en agua o bebida vegetal.
• ${mtHar} waffles saludables de avena o tostadas.
• ${mtFr > 0 ? "1 banano mediano en rodajas." : ""}`
      },
      {
        name: "Cena",
        time: "07:30 PM",
        portions: { lacteos: 0, sustitutos: 0, carnes: dCar, harinas: dHar, frutas: 0, verduras: dVer, nueces: 0, grasas: dGr },
        foods: `• ${Math.round(dCar * 80)}g de salmón, trucha o filete de pechuga.
• ${Math.round(dHar * 70)}g de puré de papa o yuca cocida.
• Vegetales salteados en ${dGr} cucharadita de aceite de oliva.`
      },
      {
        name: "Merienda Nocturna",
        time: "10:00 PM",
        portions: { lacteos: nLact, sustitutos: nSust, carnes: nCar, harinas: nHar, frutas: nFr, verduras: nVer, nueces: nNuece, grasas: nGr },
        foods: `• ${nSust > 0 ? `${Math.round(nSust * 30)}g de queso ricotta o mozzarella bajo en grasa.` : "2 claras de huevo cocidas."}
• ${nNuece * 10}g de almendras, nueces o crema de maní 100% natural.
• Té de manzanilla tibio antes de dormir.`
      }
    ];
  }

  // 3. MANTENIMIENTO O FALLBACK (5 COMIDAS AL DÍA - Excelente estándar metabólico)
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

  const mmLact = p.lacteos >= 1 ? 1 : 0;
  p.lacteos -= mmLact;
  const mmHar = Math.min(p.harinas, 2);
  p.harinas -= mmHar;
  const mmFr = p.frutas >= 1.5 ? 1 : 0.5;
  p.frutas -= mmFr;
  const mmNuece = Math.min(p.nueces, 0.5);
  p.nueces -= mmNuece;

  const lCar = Math.min(p.carnes, p.carnes >= 4 ? 2.5 : 2);
  p.carnes -= lCar;
  const lHar = Math.min(p.harinas, p.harinas >= 5 ? 3.5 : 2.5);
  p.harinas -= lHar;
  const lVer = Math.min(p.verduras, 2);
  p.verduras -= lVer;
  const lGr = p.grasas >= 2 ? 1 : 0.5;
  p.grasas -= lGr;

  const mtLact = p.lacteos > 0 ? p.lacteos : 0;
  p.lacteos = 0;
  const mtCar = p.carnes >= 2 ? 1 : 0;
  p.carnes -= mtCar;
  const mtHar = Math.min(p.harinas, 2);
  p.harinas -= mtHar;
  const mtFr = p.frutas > 0 ? p.frutas : 0;
  p.frutas = 0;
  const mtNuece = p.nueces > 0 ? p.nueces : 0;
  p.nueces = 0;

  const dSust = p.sustitutos > 0 ? p.sustitutos : 0;
  const dCar = p.carnes > 0 ? p.carnes : 1;
  const dHar = p.harinas > 0 ? p.harinas : 1;
  const dVer = p.verduras > 0 ? p.verduras : 1;
  const dGr = p.grasas > 0 ? p.grasas : 0.5;

  return [
    {
      name: "Desayuno",
      time: "07:00 AM",
      portions: { lacteos: bLact, sustitutos: bSust, carnes: 0, harinas: bHar, frutas: bFr, verduras: bVer, nueces: 0, grasas: bGr },
      foods: `• 3 huevos revueltos con espinacas y cebolla.
• ${bHar} tajadas de pan integral o 1 arepa mediana.
• ${bFr} taza de papaya picada.
• Café tinto o infusión caliente.`
    },
    {
      name: "Media Mañana",
      time: "10:00 AM",
      portions: { lacteos: mmLact, sustitutos: 0, carnes: 0, harinas: mmHar, frutas: mmFr, verduras: 0, nueces: mmNuece, grasas: 0 },
      foods: `• 200g de yogurt griego natural sin dulce.
• ${mmHar * 30}g de avena en hojuelas.
• ${mmFr} porción de fruta picada.
• ${mmNuece > 0 ? "5 almendras o 10g de maní sin sal." : ""}`
    },
    {
      name: "Almuerzo",
      time: "01:30 PM",
      portions: { lacteos: 0, sustitutos: 0, carnes: lCar, harinas: lHar, frutas: 0, verduras: lVer, nueces: 0, grasas: lGr },
      foods: `• ${Math.round(lCar * 80)}g de pechuga de pollo a la plancha.
• ${Math.round(lHar * 70)}g de arroz integral cocido.
• Ensalada fresca abundante de lechuga, pepino y zanahoria.
• 1 cucharadita de aceite de oliva y limón.`
    },
    {
      name: "Media Tarde",
      time: "04:30 PM",
      portions: { lacteos: mtLact, sustitutos: 0, carnes: mtCar, harinas: mtHar, frutas: mtFr, verduras: 0, nueces: mtNuece, grasas: 0 },
      foods: `• 1 batido de proteína en agua (1 scoop).
• ${mtHar} tostadas horneadas de maíz.
• ${mtFr > 0 ? "1 manzana mediana." : ""}
• ${mtNuece > 0 ? "5 almendras o semillas de chía." : ""}`
    },
    {
      name: "Cena",
      time: "07:30 PM",
      portions: { lacteos: 0, sustitutos: dSust, carnes: dCar, harinas: dHar, frutas: 0, verduras: dVer, nueces: 0, grasas: dGr },
      foods: `• ${Math.round(dCar * 80)}g de pechuga de pollo desmechada o filete de pescado asado.
• ${dSust > 0 ? `${Math.round(dSust * 30)}g de queso ricotta bajo en grasa.` : ""}
• ${Math.round(dHar * 70)}g de camote cocido o arepa de maíz delgada.
• Ensalada mixta templada con aguacate.`
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
