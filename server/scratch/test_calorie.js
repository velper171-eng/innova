import { analyzeCalories } from "../calorieEngine.js";

process.env.GEMINI_API_KEY = "";

async function runTest(name, ingredients, prep) {
  try {
    console.log(`\n==================================================`);
    console.log(`Testing: ${name}`);
    const result = await analyzeCalories({
      imagePath: "",
      mimeType: "",
      foodName: name,
      ingredients: ingredients,
      preparation: prep
    });
    console.log("Result:", JSON.stringify(result, null, 2));

    const expectedCalories = Math.round(result.protein * 4 + result.carbs * 4 + result.fat * 9);
    const diff = Math.abs(result.calories - expectedCalories);
    
    if (diff <= 1) {
      console.log("VERDICT: SUCCESS (consistent)");
    } else {
      console.error(`VERDICT: FAILURE (diff is ${diff} kcal)`);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

async function runAll() {
  // Test 1: Lomo Saltado
  await runTest(
    "Lomo Saltado",
    "• Lomo de res, 200g\n• Papas fritas, 80g\n• Arroz blanco, 150g\n• Cebolla morada, 50g\n• Tomate, 50g",
    "Salteado"
  );

  // Test 2: Huevos con tostadas y aceite
  await runTest(
    "Desayuno",
    "• Huevo, 2 unidades\n• Pan integral, 2 rebanadas\n• Aceite de oliva, 1 cucharada",
    "Frito"
  );

  // Test 3: Unknown ingredients with fallback
  await runTest(
    "Comida rara",
    "• Ingrediente Misterioso, 120g\n• Pechuga de pollo, 100g",
    "Al horno"
  );

  // Test 4: Recipe Pre-population (Lomo Saltado with empty ingredients)
  await runTest(
    "Lomo Saltado",
    "",
    ""
  );

  // Test 5: Recipe Pre-population (Huevos con tostadas/Desayuno with empty ingredients)
  await runTest(
    "Huevos con Tostadas",
    "",
    ""
  );

  // Test 6: Custom edited ingredients list (verifying that it bases the calculations on the edits)
  await runTest(
    "Lomo Saltado",
    "• Carne de res a la plancha, 200g\n• Papas fritas, 200g\n• Arroz blanco cocido, 100g\n• Cebolla morada, 50g\n• Tomate fresco, 50g\n• Aceite de oliva, 2 cucharadas",
    "Salteado"
  );
}

runAll();

