import fs from "fs";

/**
 * Heuristic simulator for calorie and macro estimation based on food description/ingredients.
 */
function simulateCalorieEstimation(foodName = "", ingredients = "", preparation = "") {
  const textToScan = `${foodName} ${ingredients} ${preparation}`.toLowerCase();
  
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  const breakdownItems = [];

  // Keyword-based analysis
  if (textToScan.includes("pollo") || textToScan.includes("chicken") || textToScan.includes("pechuga")) {
    calories += 240;
    protein += 30;
    fat += 5;
    breakdownItems.push("150g Pechuga de pollo cocida (~240 kcal, 30g Proteína, 5g Grasa)");
  }
  if (textToScan.includes("arroz") || textToScan.includes("rice")) {
    calories += 200;
    carbs += 45;
    protein += 4;
    breakdownItems.push("150g Arroz blanco cocido (~200 kcal, 45g Carbohidratos, 4g Proteína)");
  }
  if (textToScan.includes("aguacate") || textToScan.includes("avocado")) {
    calories += 160;
    fat += 15;
    carbs += 8;
    protein += 2;
    breakdownItems.push("100g Aguacate fresco (~160 kcal, 15g Grasa, 8g Carbohidratos)");
  }
  if (textToScan.includes("huevo") || textToScan.includes("egg")) {
    // Check if plural
    const count = (textToScan.match(/huevos/g) || []).length > 0 ? 3 : 2;
    calories += 75 * count;
    protein += 6 * count;
    fat += 5 * count;
    breakdownItems.push(`${count} Huevos enteros cocidos (~${75 * count} kcal, ${6 * count}g Proteína, ${5 * count}g Grasa)`);
  }
  if (textToScan.includes("ensalada") || textToScan.includes("salad") || textToScan.includes("lechuga") || textToScan.includes("tomate")) {
    calories += 45;
    carbs += 8;
    protein += 1;
    breakdownItems.push("Plato de ensalada mixta sin aderezo (~45 kcal, 8g Carbohidratos, 1g Proteína)");
  }
  if (textToScan.includes("aceite") || textToScan.includes("oil")) {
    calories += 120;
    fat += 14;
    breakdownItems.push("1 cucharada de aceite de oliva (~120 kcal, 14g Grasa)");
  }
  if (textToScan.includes("pan") || textToScan.includes("bread") || textToScan.includes("tostada")) {
    calories += 160;
    carbs += 30;
    protein += 5;
    fat += 2;
    breakdownItems.push("2 rebanadas de pan integral (~160 kcal, 30g Carbohidratos, 5g Proteína)");
  }
  if (textToScan.includes("carne") || textToScan.includes("res") || textToScan.includes("beef") || textToScan.includes("bife") || textToScan.includes("lomo")) {
    calories += 320;
    protein += 28;
    fat += 18;
    breakdownItems.push("150g Carne de res a la plancha (~320 kcal, 28g Proteína, 18g Grasa)");
  }
  if (textToScan.includes("queso") || textToScan.includes("cheese")) {
    calories += 110;
    protein += 7;
    fat += 9;
    breakdownItems.push("30g Queso fresco (~110 kcal, 7g Proteína, 9g Grasa)");
  }
  if (textToScan.includes("avena") || textToScan.includes("oats")) {
    calories += 150;
    carbs += 27;
    protein += 5;
    fat += 3;
    breakdownItems.push("40g Avena en hojuelas (~150 kcal, 27g Carbohidratos, 5g Proteína)");
  }
  if (textToScan.includes("leche") || textToScan.includes("milk") || textToScan.includes("yogur") || textToScan.includes("yogurt")) {
    calories += 120;
    carbs += 12;
    protein += 8;
    fat += 4;
    breakdownItems.push("1 taza de leche descremada / yogur (~120 kcal, 12g Carbohidratos, 8g Proteína)");
  }
  if (textToScan.includes("platano") || textToScan.includes("plátano") || textToScan.includes("banana")) {
    calories += 95;
    carbs += 23;
    protein += 1;
    breakdownItems.push("1 Plátano mediano (~95 kcal, 23g Carbohidratos)");
  }
  if (textToScan.includes("manzana") || textToScan.includes("apple")) {
    calories += 75;
    carbs += 18;
    breakdownItems.push("1 Manzana mediana (~75 kcal, 18g Carbohidratos)");
  }

  // Fallback default if no keywords matched
  if (calories === 0) {
    calories = 450;
    protein = 24;
    carbs = 50;
    fat = 14;
    breakdownItems.push("Estimación base: Plato balanceado estándar (~450 kcal)");
  }

  // Build simulated fields
  const detectedName = foodName || (textToScan.includes("pollo") && textToScan.includes("arroz") ? "Pollo con Arroz" : "Plato de Comida Saludable");
  const ingredientsDesc = breakdownItems.map(item => `• ${item}`).join("\n");
  const prepDesc = preparation || "Preparación casera, cocido a fuego medio con condimentos básicos.";

  return {
    foodName: detectedName,
    calories: Math.round(calories),
    protein: parseFloat(protein.toFixed(1)),
    carbs: parseFloat(carbs.toFixed(1)),
    fat: parseFloat(fat.toFixed(1)),
    ingredients: ingredientsDesc,
    preparation: prepDesc,
    simulated: true
  };
}

/**
 * Main function to analyze food and estimate calories.
 * Uses Google Gemini API if GEMINI_API_KEY is defined, otherwise falls back to local simulation.
 */
export async function analyzeCalories({ imagePath, mimeType, foodName, ingredients, preparation }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("Calorie Engine: GEMINI_API_KEY not found. Using local heuristic simulation...");
    return simulateCalorieEstimation(foodName, ingredients, preparation);
  }

  console.log("Calorie Engine: Querying Google Gemini 1.5 Flash API...");

  try {
    let imagePart = null;

    if (imagePath && fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBuffer.toString("base64")
        }
      };
    }

    const systemInstructions = `
You are an expert nutritional analyzer. Analyze the provided food image and/or text details to estimate the nutritional content.
IMPORTANT GUIDELINE: The user can provide exact portions, ingredients list, and preparation style. You must prioritize the manual text inputs for ingredients and portions (if provided) because they are much more exact than what can be seen visually in a photo. Use the photo to verify and supplement the information.

Estimate:
1. "foodName": A descriptive name for the food or dish in Spanish.
2. "calories": Total calories (integer).
3. "protein": Total protein in grams (number/integer).
4. "carbs": Total carbohydrates in grams (number/integer).
5. "fat": Total fat in grams (number/integer).
6. "ingredients": A bulleted markdown list of estimated ingredients, quantities, and their individual calorie/protein contributions in Spanish.
7. "preparation": A brief description of the assumed or verified preparation method in Spanish.

Provide the response in Spanish as a raw JSON object matching the following structure:
{
  "foodName": "...",
  "calories": 123,
  "protein": 12.3,
  "carbs": 45.6,
  "fat": 7.8,
  "ingredients": "...",
  "preparation": "..."
}
Do not include any markdown formatting like \`\`\`json. Return only the raw JSON.
`;

    const userPrompt = `
Analyze the food. Here are the user provided details:
- User's Plate/Product Name: ${foodName || "Not provided"}
- Exact Ingredients/Quantities list: ${ingredients || "Not provided"}
- Preparation details: ${preparation || "Not provided"}

Task: Provide the JSON estimate.
`;

    // Construct the API call payload
    const contentParts = [];
    contentParts.push({ text: userPrompt });
    
    if (imagePart) {
      contentParts.push(imagePart);
    }

    const payload = {
      contents: [{
        parts: contentParts
      }],
      systemInstruction: {
        parts: [{ text: systemInstructions }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    // Parse the JSON returned by Gemini
    const nutritionData = JSON.parse(responseText.trim());
    return {
      ...nutritionData,
      simulated: false
    };

  } catch (error) {
    console.error("Calorie Engine: Error calling Gemini API. Falling back to local simulation...", error);
    return {
      ...simulateCalorieEstimation(foodName, ingredients, preparation),
      error: error.message
    };
  }
}
