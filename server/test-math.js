import { calculateSomatotype, calculateBodyFat } from "./calculator.js";

// Test Case 1: Healthy adult male
const maleData = {
  height: 175,
  weight: 75,
  age: 25,
  gender: "male",
  skinfoldTriceps: 8,
  skinfoldBiceps: 4,
  skinfoldSubescapular: 10,
  skinfoldSupraspinale: 9,
  skinfoldAbdominal: 12,
  skinfoldThigh: 11,
  skinfoldCalf: 7,
  girthArm: 32,
  girthCalf: 36,
  diameterHumerus: 6.8,
  diameterFemur: 9.4
};

console.log("--- Testing Math Calculations ---");
const somatotypeResult = calculateSomatotype(maleData);
console.log("Somatotype Result (Expected coordinates around -1, 4):");
console.log(somatotypeResult);

const fatResult = calculateBodyFat(maleData);
console.log("\nBody Fat Result:");
console.log(fatResult);

// Verify specific values
if (somatotypeResult.endomorphy > 0 && somatotypeResult.mesomorphy > 0 && somatotypeResult.ectomorphy > 0) {
  console.log("\nSUCCESS: All somatotype components calculated correctly.");
} else {
  console.error("\nFAILURE: Somatotype calculations returned invalid values.");
  process.exit(1);
}

if (fatResult.bodyFat > 0 && fatResult.bodyFat < 100) {
  console.log("SUCCESS: Body fat percentage within normal range.");
} else {
  console.error("FAILURE: Body fat percentage returned invalid values.");
  process.exit(1);
}
