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
      const val = parsed ? parsed.value : null;

      if (lowerLine.includes("pollo") || lowerLine.includes("chicken") || lowerLine.includes("pechuga")) {
        const qty = val !== null ? val : 150;
        const factor = qty / 150;
        calories += 240 * factor;
        protein += 30 * factor;
        fat += 5 * factor;
        sodium += 70 * factor;
        breakdownItems.push(`Pechuga de pollo cocida, ${qty}g`);
      } else if (lowerLine.includes("arroz") || lowerLine.includes("rice")) {
        const qty = val !== null ? val : 150;
        const factor = qty / 150;
        calories += 200 * factor;
        carbs += 45 * factor;
        protein += 4 * factor;
        sodium += 5 * factor;
        breakdownItems.push(`Arroz blanco cocido, ${qty}g`);
      } else if (lowerLine.includes("aguacate") || lowerLine.includes("avocado")) {
        const qty = val !== null ? val : 100;
        const factor = qty / 100;
        calories += 160 * factor;
        fat += 15 * factor;
        carbs += 8 * factor;
        protein += 2 * factor;
        sodium += 10 * factor;
        breakdownItems.push(`Aguacate fresco, ${qty}g`);
      } else if (lowerLine.includes("huevo") || lowerLine.includes("egg")) {
        const qty = val !== null ? val : 2;
        calories += 75 * qty;
        protein += 6 * qty;
        fat += 5 * qty;
        sodium += 140 * qty;
        breakdownItems.push(`Huevos enteros cocidos, ${qty} unidades`);
      } else if (lowerLine.includes("ensalada") || lowerLine.includes("salad") || lowerLine.includes("lechuga") || lowerLine.includes("tomate")) {
        const qty = val !== null ? val : 1;
        calories += 45 * qty;
        carbs += 8 * qty;
        protein += 1 * qty;
        sodium += 50 * qty;
        breakdownItems.push(`Ensalada mixta sin aderezo, ${qty} plato`);
      } else if (lowerLine.includes("aceite") || lowerLine.includes("oil")) {
        const qty = val !== null ? val : 1;
        calories += 120 * qty;
        fat += 14 * qty;
        breakdownItems.push(`Aceite de oliva, ${qty} cucharada`);
      } else if (lowerLine.includes("pan") || lowerLine.includes("bread") || lowerLine.includes("tostada")) {
        const qty = val !== null ? val : 2;
        const factor = qty / 2;
        calories += 160 * factor;
        carbs += 30 * factor;
        protein += 5 * factor;
        fat += 2 * factor;
        sugar += 4 * factor;
        sodium += 260 * factor;
        breakdownItems.push(`Pan integral, ${qty} rebanadas`);
      } else if (lowerLine.includes("carne") || lowerLine.includes("res") || lowerLine.includes("beef") || lowerLine.includes("bife") || lowerLine.includes("lomo")) {
        const qty = val !== null ? val : 150;
        const factor = qty / 150;
        calories += 320 * factor;
        protein += 28 * factor;
        fat += 18 * factor;
        sodium += 90 * factor;
        breakdownItems.push(`Carne de res a la plancha, ${qty}g`);
      } else if (lowerLine.includes("queso") || lowerLine.includes("cheese")) {
        const qty = val !== null ? val : 30;
        const factor = qty / 30;
        calories += 110 * factor;
        protein += 7 * factor;
        fat += 9 * factor;
        sugar += 1 * factor;
        sodium += 200 * factor;
        breakdownItems.push(`Queso fresco, ${qty}g`);
      } else if (lowerLine.includes("avena") || lowerLine.includes("oats")) {
        const qty = val !== null ? val : 40;
        const factor = qty / 40;
        calories += 150 * factor;
        carbs += 27 * factor;
        protein += 5 * factor;
        fat += 3 * factor;
        sugar += 1 * factor;
        sodium += 2 * factor;
        breakdownItems.push(`Avena en hojuelas, ${qty}g`);
      } else if (lowerLine.includes("leche") || lowerLine.includes("milk") || lowerLine.includes("yogur") || lowerLine.includes("yogurt")) {
        const qty = val !== null ? val : 1;
        calories += 120 * qty;
        carbs += 12 * qty;
        protein += 8 * qty;
        fat += 4 * qty;
        sugar += 11 * qty;
        sodium += 120 * qty;
        breakdownItems.push(`Leche descremada / yogur, ${qty} taza`);
      } else if (lowerLine.includes("platano") || lowerLine.includes("plátano") || lowerLine.includes("banana")) {
        const qty = val !== null ? val : 1;
        calories += 95 * qty;
        carbs += 23 * qty;
        protein += 1 * qty;
        sugar += 12 * qty;
        sodium += 1 * qty;
        breakdownItems.push(`Plátano mediano, ${qty} unidad`);
      } else if (lowerLine.includes("manzana") || lowerLine.includes("apple")) {
        const qty = val !== null ? val : 1;
        calories += 75 * qty;
        carbs += 18 * qty;
        sugar += 15 * qty;
        sodium += 1 * qty;
        breakdownItems.push(`Manzana mediana, ${qty} unidad`);
      } else if (parsed) {
        const qty = parsed.value;
        let factor = qty;
        if (!['g', 'gr', 'gramos'].includes(parsed.unit)) {
          factor = qty * 100;
        }
        calories += 1.5 * factor;
        protein += 0.08 * factor;
        carbs += 0.15 * factor;
        fat += 0.05 * factor;
        sugar += 0.02 * factor;
        sodium += 1.5 * factor;

        const cleanedName = line.replace(/[•\-\d,\.]/g, "").replace(/(?:gramos|gr|g|unidades|unidad|cucharadas|cucharada|tazas|taza|rebanadas|rebanada|platos|plato|ud|und|u)\b/gi, "").trim();
        breakdownItems.push(`${cleanedName || "Ingrediente adicional"}, ${qty}${parsed.unit || 'g'}`);
      }
    }
  } else {
    const textToScan = `${foodName} ${preparation}`.toLowerCase();
    if (textToScan.includes("pollo") || textToScan.includes("chicken") || textToScan.includes("pechuga")) {
      calories += 240;
      protein += 30;
      fat += 5;
      sodium += 70;
      breakdownItems.push("Pechuga de pollo cocida, 150g");
    }
    if (textToScan.includes("arroz") || textToScan.includes("rice")) {
      calories += 200;
      carbs += 45;
      protein += 4;
      sodium += 5;
      breakdownItems.push("Arroz blanco cocido, 150g");
    }
    if (textToScan.includes("aguacate") || textToScan.includes("avocado")) {
      calories += 160;
      fat += 15;
      carbs += 8;
      protein += 2;
      sodium += 10;
      breakdownItems.push("Aguacate fresco, 100g");
    }
    if (textToScan.includes("huevo") || textToScan.includes("egg")) {
      const count = (textToScan.match(/huevos/g) || []).length > 0 ? 3 : 2;
      calories += 75 * count;
      protein += 6 * count;
      fat += 5 * count;
      sodium += 140 * count;
      breakdownItems.push(`Huevos enteros cocidos, ${count} unidades`);
    }
    if (textToScan.includes("ensalada") || textToScan.includes("salad") || textToScan.includes("lechuga") || textToScan.includes("tomate")) {
      calories += 45;
      carbs += 8;
      protein += 1;
      sodium += 50;
      breakdownItems.push("Ensalada mixta sin aderezo, 1 plato");
    }
    if (textToScan.includes("aceite") || textToScan.includes("oil")) {
      calories += 120;
      fat += 14;
      breakdownItems.push("Aceite de oliva, 1 cucharada");
    }
    if (textToScan.includes("pan") || textToScan.includes("bread") || textToScan.includes("tostada")) {
      calories += 160;
      carbs += 30;
      protein += 5;
      fat += 2;
      sugar += 4;
      sodium += 260;
      breakdownItems.push("Pan integral, 2 rebanadas");
    }
    if (textToScan.includes("carne") || textToScan.includes("res") || textToScan.includes("beef") || textToScan.includes("bife") || textToScan.includes("lomo")) {
      calories += 320;
      protein += 28;
      fat += 18;
      sodium += 90;
      breakdownItems.push("Carne de res a la plancha, 150g");
    }
    if (textToScan.includes("queso") || textToScan.includes("cheese")) {
      calories += 110;
      protein += 7;
      fat += 9;
      sugar += 1;
      sodium += 200;
      breakdownItems.push("Queso fresco, 30g");
    }
    if (textToScan.includes("avena") || textToScan.includes("oats")) {
      calories += 150;
      carbs += 27;
      protein += 5;
      fat += 3;
      sugar += 1;
      sodium += 2;
      breakdownItems.push("Avena en hojuelas, 40g");
    }
    if (textToScan.includes("leche") || textToScan.includes("milk") || textToScan.includes("yogur") || textToScan.includes("yogurt")) {
      calories += 120;
      carbs += 12;
      protein += 8;
      fat += 4;
      sugar += 11;
      sodium += 120;
      breakdownItems.push("Leche descremada / yogur, 1 taza");
    }
    if (textToScan.includes("platano") || textToScan.includes("plátano") || textToScan.includes("banana")) {
      calories += 95;
      carbs += 23;
      protein += 1;
      sugar += 12;
      sodium += 1;
      breakdownItems.push("Plátano mediano, 1 unidad");
    }
    if (textToScan.includes("manzana") || textToScan.includes("apple")) {
      calories += 75;
      carbs += 18;
      sugar += 15;
      sodium += 1;
      breakdownItems.push("Manzana mediana, 1 unidad");
    }
  }

  if (calories === 0) {
    calories = 450;
    protein = 24;
    carbs = 50;
    fat = 14;
    sugar = 8;
    sodium = 450;
    if (breakdownItems.length === 0) {
      breakdownItems.push("Plato balanceado estándar, 1 unidad");
    }
  }

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
IMPORTANTE: Si el usuario proporciona un nombre de plato en el campo 'Plato' y no está vacío, debes usar exactamente ese nombre en la propiedad 'foodName' del JSON devuelto. Si el usuario proporciona una lista manual de ingredientes con cantidades en el campo 'Ingredientes', debes calcular los valores totales de 'calories', 'protein', 'carbs', 'fat', 'sugar' y 'sodium' basándote estrictamente en esa lista y en las cantidades indicadas. Si el usuario corrige, agrega, borra ingredientes o cambia las cantidades, recalcula la suma total de forma proporcional para reflejar con total precisión dichos cambios.`;

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
