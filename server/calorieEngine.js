import fs from "fs";

/**
 * Heuristic simulator for calorie and macro estimation based on food description/ingredients.
 */
function parseQuantity(line) {
  const match = line.match(/(\d+(?:\.\d+)?)\s*(g|gr|gramos|unidad|unidades|cucharada|cucharadas|taza|tazas|rebanada|rebanadas|plato|platos|ud|und|u\b)?/i);
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2] ? match[2].toLowerCase() : 'g'
    };
  }
  return null;
}

/**
 * Heuristic simulator for calorie and macro estimation based on food description/ingredients.
 */
const FOOD_DATABASE = [
  {
    keywords: ["pechuga de pollo", "pechuga pollo", "pollo", "chicken", "pechuga"],
    name: "Pechuga de pollo cocida",
    defaultQty: 150,
    defaultUnit: "g",
    density: { protein: 25.0, carbs: 0.0, fat: 3.0, sodium: 70.0, sugar: 0.0 },
    unitWeights: { u: 150, unidad: 150, unidades: 150, plato: 150 }
  },
  {
    keywords: ["arroz blanco", "arroz", "rice"],
    name: "Arroz blanco cocido",
    defaultQty: 150,
    defaultUnit: "g",
    density: { protein: 2.7, carbs: 28.0, fat: 0.3, sodium: 1.0, sugar: 0.1 },
    unitWeights: { taza: 150, tazas: 150, plato: 200 }
  },
  {
    keywords: ["aguacate", "avocado", "palta"],
    name: "Aguacate fresco",
    defaultQty: 100,
    defaultUnit: "g",
    density: { protein: 2.0, carbs: 8.5, fat: 15.0, sodium: 7.0, sugar: 0.7 },
    unitWeights: { u: 150, unidad: 150, unidades: 150, und: 150 }
  },
  {
    keywords: ["huevo", "egg"],
    name: "Huevos enteros cocidos",
    defaultQty: 2,
    defaultUnit: "unidades",
    density: { protein: 12.6, carbs: 0.7, fat: 9.5, sodium: 124.0, sugar: 0.4 },
    unitWeights: { u: 50, unidad: 50, unidades: 50, und: 50, ud: 50 }
  },
  {
    keywords: ["papas fritas", "papa frita", "patatas fritas", "patata frita"],
    name: "Papas fritas",
    defaultQty: 80,
    defaultUnit: "g",
    density: { protein: 3.5, carbs: 38.0, fat: 15.0, sodium: 210.0, sugar: 0.3 },
    unitWeights: { plato: 150, unidad: 15, unidades: 15 }
  },
  {
    keywords: ["papa", "patata"],
    name: "Papa cocida",
    defaultQty: 150,
    defaultUnit: "g",
    density: { protein: 2.0, carbs: 20.0, fat: 0.1, sodium: 5.0, sugar: 0.8 },
    unitWeights: { u: 150, unidad: 150, unidades: 150, und: 150, plato: 200 }
  },
  {
    keywords: ["cebolla"],
    name: "Cebolla morada",
    defaultQty: 50,
    defaultUnit: "g",
    density: { protein: 1.1, carbs: 9.3, fat: 0.1, sodium: 4.0, sugar: 4.2 },
    unitWeights: { u: 100, unidad: 100, unidades: 100, und: 100 }
  },
  {
    keywords: ["tomate"],
    name: "Tomate fresco",
    defaultQty: 50,
    defaultUnit: "g",
    density: { protein: 0.9, carbs: 3.9, fat: 0.2, sodium: 5.0, sugar: 2.6 },
    unitWeights: { u: 120, unidad: 120, unidades: 120, und: 120 }
  },
  {
    keywords: ["ensalada", "salad", "lechuga"],
    name: "Ensalada mixta sin aderezo",
    defaultQty: 1,
    defaultUnit: "plato",
    density: { protein: 1.2, carbs: 5.0, fat: 0.2, sodium: 30.0, sugar: 2.0 },
    unitWeights: { plato: 150, platos: 150, taza: 75, tazas: 75 }
  },
  {
    keywords: ["aceite de oliva", "aceite", "oil"],
    name: "Aceite de oliva",
    defaultQty: 1,
    defaultUnit: "cucharada",
    density: { protein: 0.0, carbs: 0.0, fat: 100.0, sodium: 2.0, sugar: 0.0 },
    unitWeights: { cucharada: 14, cucharadas: 14, cucharadita: 5, cucharaditas: 5, u: 14, unidad: 14 }
  },
  {
    keywords: ["pan integral", "pan", "bread", "tostada"],
    name: "Pan integral",
    defaultQty: 2,
    defaultUnit: "rebanadas",
    density: { protein: 9.0, carbs: 49.0, fat: 3.0, sodium: 400.0, sugar: 5.0 },
    unitWeights: { rebanada: 30, rebanadas: 30, slice: 30, slices: 30, u: 30, unidad: 30 }
  },
  {
    keywords: ["lomo de res", "lomo", "carne de res", "carne", "res", "beef", "bife"],
    name: "Carne de res a la plancha",
    defaultQty: 150,
    defaultUnit: "g",
    density: { protein: 22.0, carbs: 0.0, fat: 12.0, sodium: 60.0, sugar: 0.0 },
    unitWeights: { u: 150, unidad: 150, unidades: 150, und: 150, bife: 150 }
  },
  {
    keywords: ["queso", "cheese"],
    name: "Queso fresco",
    defaultQty: 30,
    defaultUnit: "g",
    density: { protein: 20.0, carbs: 2.0, fat: 25.0, sodium: 600.0, sugar: 1.0 },
    unitWeights: { rebanada: 30, rebanadas: 30, slice: 30, slices: 30, u: 30, unidad: 30 }
  },
  {
    keywords: ["avena", "oats"],
    name: "Avena en hojuelas",
    defaultQty: 40,
    defaultUnit: "g",
    density: { protein: 13.0, carbs: 68.0, fat: 7.0, sodium: 2.0, sugar: 1.0 },
    unitWeights: { taza: 40, tazas: 40 }
  },
  {
    keywords: ["leche", "milk"],
    name: "Leche descremada",
    defaultQty: 1,
    defaultUnit: "taza",
    density: { protein: 3.3, carbs: 4.8, fat: 1.5, sodium: 40.0, sugar: 4.8 },
    unitWeights: { taza: 240, tazas: 240, vaso: 240, vasos: 240 }
  },
  {
    keywords: ["yogur", "yogurt"],
    name: "Yogur natural",
    defaultQty: 1,
    defaultUnit: "taza",
    density: { protein: 4.0, carbs: 5.0, fat: 1.5, sodium: 50.0, sugar: 4.0 },
    unitWeights: { taza: 200, tazas: 200, vaso: 200, vasos: 200, pote: 125, potes: 125 }
  },
  {
    keywords: ["platano", "plátano", "banana"],
    name: "Plátano mediano",
    defaultQty: 1,
    defaultUnit: "unidad",
    density: { protein: 1.1, carbs: 22.8, fat: 0.3, sodium: 1.0, sugar: 12.2 },
    unitWeights: { u: 120, unidad: 120, unidades: 120, und: 120 }
  },
  {
    keywords: ["manzana", "apple"],
    name: "Manzana mediana",
    defaultQty: 1,
    defaultUnit: "unidad",
    density: { protein: 0.3, carbs: 13.8, fat: 0.2, sodium: 1.0, sugar: 10.4 },
    unitWeights: { u: 150, unidad: 150, unidades: 150, und: 150 }
  }
];

function simulateCalorieEstimation(foodName = "", ingredients = "", preparation = "") {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let sugar = 0;
  let sodium = 0;
  const breakdownItems = [];

  const lines = ingredients ? ingredients.split("\n").map(l => l.trim()).filter(l => l.length > 0) : [];

  if (lines.length > 0) {
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      const parsed = parseQuantity(line);

      // Find matching food in database
      let matchedFood = null;
      for (const food of FOOD_DATABASE) {
        if (food.keywords.some(keyword => lowerLine.includes(keyword))) {
          // Prioritize more specific keywords (e.g. "papas fritas" over "papa")
          if (!matchedFood || food.keywords[0].length > matchedFood.keywords[0].length) {
            matchedFood = food;
          }
        }
      }

      let finalQtyGrams = 0;
      let labelQty = "";
      let foodItemName = "";
      let itemProtein = 0;
      let itemCarbs = 0;
      let itemFat = 0;
      let itemSugar = 0;
      let itemSodium = 0;

      if (matchedFood) {
        foodItemName = matchedFood.name;
        let qty = parsed ? parsed.value : matchedFood.defaultQty;
        let unit = parsed && parsed.unit ? parsed.unit : matchedFood.defaultUnit;

        if (['g', 'gr', 'gramos'].includes(unit)) {
          finalQtyGrams = qty;
          labelQty = `${qty}g`;
        } else {
          const weightPerUnit = matchedFood.unitWeights[unit] || matchedFood.unitWeights['unidad'] || 100;
          finalQtyGrams = qty * weightPerUnit;
          labelQty = `${qty} ${unit}`;
        }

        const ratio = finalQtyGrams / 100;
        itemProtein = matchedFood.density.protein * ratio;
        itemCarbs = matchedFood.density.carbs * ratio;
        itemFat = matchedFood.density.fat * ratio;
        itemSugar = matchedFood.density.sugar * ratio;
        itemSodium = matchedFood.density.sodium * ratio;
      } else {
        // Unrecognized food fallback
        let qty = 100;
        let unit = 'g';
        if (parsed) {
          qty = parsed.value;
          unit = parsed.unit || 'g';
        }

        if (['g', 'gr', 'gramos'].includes(unit)) {
          finalQtyGrams = qty;
          labelQty = `${qty}g`;
        } else {
          finalQtyGrams = qty * 100; // default to 100g per unit
          labelQty = `${qty} ${unit}`;
        }

        const ratio = finalQtyGrams / 100;
        itemProtein = 2.0 * ratio;
        itemCarbs = 15.0 * ratio;
        itemFat = 3.0 * ratio;
        itemSugar = 2.0 * ratio;
        itemSodium = 150.0 * ratio;

        const cleanedName = line
          .replace(/[•\-\d,\.]/g, "")
          .replace(/(?:gramos|gr|g|unidades|unidad|cucharadas|cucharada|tazas|taza|rebanadas|rebanada|platos|plato|ud|und|u)\b/gi, "")
          .trim();
        foodItemName = cleanedName ? cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1) : "Ingrediente adicional";
      }

      protein += itemProtein;
      carbs += itemCarbs;
      fat += itemFat;
      sugar += itemSugar;
      sodium += itemSodium;

      breakdownItems.push(`${foodItemName}, ${labelQty}`);
    }
  } else {
    // When ingredients list is empty, scan foodName and preparation
    const textToScan = `${foodName} ${preparation}`.toLowerCase();
    const matchedFoods = [];

    for (const food of FOOD_DATABASE) {
      if (food.keywords.some(keyword => textToScan.includes(keyword))) {
        matchedFoods.push(food);
      }
    }

    // Filter subsets (e.g. keep "papas fritas" and filter out "papa")
    const finalFoods = [];
    for (const food of matchedFoods) {
      const isSubsetOfAnother = matchedFoods.some(other => 
        other !== food && other.keywords[0].includes(food.keywords[0]) && other.keywords[0] !== food.keywords[0]
      );
      if (!isSubsetOfAnother) {
        finalFoods.push(food);
      }
    }

    for (const food of finalFoods) {
      const qty = food.defaultQty;
      const unit = food.defaultUnit;
      let finalQtyGrams = 0;
      let labelQty = "";

      if (['g', 'gr', 'gramos'].includes(unit)) {
        finalQtyGrams = qty;
        labelQty = `${qty}g`;
      } else {
        const weightPerUnit = food.unitWeights[unit] || food.unitWeights['unidad'] || 100;
        finalQtyGrams = qty * weightPerUnit;
        labelQty = `${qty} ${unit}`;
      }

      const ratio = finalQtyGrams / 100;
      protein += food.density.protein * ratio;
      carbs += food.density.carbs * ratio;
      fat += food.density.fat * ratio;
      sugar += food.density.sugar * ratio;
      sodium += food.density.sodium * ratio;

      breakdownItems.push(`${food.name}, ${labelQty}`);
    }
  }

  // General fallback if nothing matched and ingredients list is empty or sums to 0
  if (protein === 0 && carbs === 0 && fat === 0) {
    protein = 24;
    carbs = 50;
    fat = 14;
    sugar = 8;
    sodium = 450;
    if (breakdownItems.length === 0) {
      breakdownItems.push("Plato balanceado estándar, 1 unidad");
    }
  }

  // Calculate calories using 4/4/9 formula to guarantee mathematical consistency
  calories = protein * 4 + carbs * 4 + fat * 9;

  const detectedName = foodName || "Plato de Comida Saludable";
  const ingredientsDesc = breakdownItems.map(item => `• ${item}`).join("\n");
  const prepDesc = preparation || "Preparación casera.";

  return {
    foodName: detectedName,
    calories: Math.round(calories),
    protein: parseFloat(protein.toFixed(1)),
    carbs: parseFloat(carbs.toFixed(1)),
    fat: parseFloat(fat.toFixed(1)),
    sugar: parseFloat(sugar.toFixed(1)),
    sodium: Math.round(sodium),
    ingredients: ingredientsDesc || ingredients,
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

  const systemInstructions = `Nutriólogo experto. Devuelve JSON en español:
{
  "foodName": "Nombre del plato (ej. Lomo Saltado)",
  "calories": 650,
  "protein": 35.0,
  "carbs": 55.0,
  "fat": 25.0,
  "sugar": 5.0,
  "sodium": 800,
  "ingredients": "• Lomo de res, 150g\\n• Papas fritas, 100g\\n• Arroz blanco, 150g\\n• Cebolla morada, 50g\\n• Tomate, 50g",
  "preparation": "Salteado en sartén a fuego alto con cebolla, tomate y un toque de sillao."
}
Reglas para la propiedad 'ingredients': Genera una lista de los ingredientes estimados con su nombre y cantidad aproximada (ej. '• Pechuga de pollo, 150g' o '• Huevo, 2 unidades'), uno por línea. Queda estrictamente PROHIBIDO incluir calorías, proteínas o cualquier valor nutricional individual en esta lista. Solo pon el nombre y la cantidad.
IMPORTANTE:
1. Si el usuario proporciona un nombre de plato en el campo 'Plato' y no está vacío, debes usar exactamente ese nombre en la propiedad 'foodName' del JSON devuelto.
2. Si el usuario proporciona una lista manual/editada de ingredientes con cantidades en el campo 'Ingredientes', debes calcular los valores nutricionales totales (calories, protein, carbs, fat, sugar, sodium) basándote ÚNICA y ESTRICTAMENTE en esa lista de ingredientes y en las cantidades indicadas en ella.
3. REGLA CRÍTICA DE CORRECCIÓN: Si el usuario corrige, edita, cambia las cantidades, agrega o elimina ingredientes de la lista, debes tratar la nueva lista como la lista FINAL y ABSOLUTA de ingredientes. NO sumes los gramos o cantidades anteriores con las nuevas cantidades corregidas (por ejemplo, si antes eran 150g y ahora el texto dice 200g, el ingrediente es de 200g en total, NO 350g). Tampoco sumes calorías por defecto del nombre del plato a los ingredientes. Los valores nutricionales deben corresponder exactamente a las cantidades escritas en la lista en ese momento.`;

  const userPrompt = `Plato: ${foodName || ""}
Ingredientes: ${ingredients || ""}
Preparación: ${preparation || ""}`;

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

  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`Calorie Engine: Querying Google Gemini API with model ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API model ${model} returned status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error(`Empty response from model ${model}`);
      }

      let cleanText = responseText.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      // Safe JSON parse by escaping literal control characters (raw newlines) inside double quotes
      let processedText = "";
      let inString = false;
      let escape = false;
      for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        if (char === '"' && !escape) {
          inString = !inString;
        }
        if (char === '\\' && !escape) {
          escape = true;
        } else {
          escape = false;
        }
        if (inString && (char === '\n' || char === '\r')) {
          processedText += '\\n';
        } else {
          processedText += char;
        }
      }

      let nutritionData = JSON.parse(processedText);

      // Normalize ingredients array to string format with bullet points if returned as array
      if (Array.isArray(nutritionData.ingredients)) {
        nutritionData.ingredients = nutritionData.ingredients
          .map(item => item.trim())
          .filter(item => item.length > 0)
          .map(item => item.startsWith("•") ? item : `• ${item}`)
          .join("\n");
      }

      console.log(`Calorie Engine: Successfully obtained response using model ${model}`);
      return {
        ...nutritionData,
        simulated: false
      };
    } catch (error) {
      console.warn(`Calorie Engine: Model ${model} failed:`, error.message);
      lastError = error;
    }
  }

  console.error("Calorie Engine: All Gemini models failed. Falling back to local simulation. Last error:", lastError?.message);
  return {
    ...simulateCalorieEstimation(foodName, ingredients, preparation),
    error: lastError ? lastError.message : "All Gemini API models failed"
  };
}
