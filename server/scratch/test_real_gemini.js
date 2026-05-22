import "../load-env.js";
import { analyzeCalories } from "../calorieEngine.js";

async function test() {
  console.log("Using GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Defined (length " + process.env.GEMINI_API_KEY.length + ")" : "Not defined");
  try {
    const result = await analyzeCalories({
      foodName: "Lomo Saltado",
      ingredients: "",
      preparation: ""
    });
    console.log("SUCCESS:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("FAILED:", err);
  }
}

test();
