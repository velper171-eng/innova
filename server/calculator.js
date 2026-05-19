/**
 * Heath-Carter Somatotype and Body Composition Calculator
 */

/**
 * Calculates Heath-Carter Somatotype components and coordinates
 * @param {Object} data
 * @param {number} data.height - in cm
 * @param {number} data.weight - in kg
 * @param {number} data.skinfoldTriceps - in mm
 * @param {number} data.skinfoldSubescapular - in mm
 * @param {number} data.skinfoldSupraspinale - in mm
 * @param {number} data.skinfoldCalf - in mm (medial calf)
 * @param {number} data.girthArm - flexed arm girth in cm
 * @param {number} data.girthCalf - medial calf girth in cm
 * @param {number} data.diameterHumerus - biacromial humerus breadth in cm
 * @param {number} data.diameterFemur - biepicondylar femur breadth in cm
 * @returns {Object} { endomorphy, mesomorphy, ectomorphy, xCoord, yCoord, category }
 */
export function calculateSomatotype(data) {
  const {
    height,
    weight,
    skinfoldTriceps,
    skinfoldSubescapular,
    skinfoldSupraspinale,
    skinfoldCalf,
    girthArm,
    girthCalf,
    diameterHumerus,
    diameterFemur,
  } = data;

  // 1. Endomorphy
  const sum3Skinfolds = skinfoldTriceps + skinfoldSubescapular + skinfoldSupraspinale;
  const heightCorrection = sum3Skinfolds * (170.18 / height);
  let endomorphy = -0.7182 + 0.1451 * heightCorrection - 0.00068 * Math.pow(heightCorrection, 2) + 0.0000014 * Math.pow(heightCorrection, 3);
  endomorphy = Math.max(0.1, Number(endomorphy.toFixed(2)));

  // 2. Mesomorphy
  const correctedArmGirth = girthArm - (skinfoldTriceps / 10);
  const correctedCalfGirth = girthCalf - (skinfoldCalf / 10);
  let mesomorphy = (0.858 * diameterHumerus) + (0.601 * diameterFemur) + (0.188 * correctedArmGirth) + (0.161 * correctedCalfGirth) - (height * 0.131) + 4.50;
  mesomorphy = Math.max(0.1, Number(mesomorphy.toFixed(2)));

  // 3. Ectomorphy
  const hwr = height / Math.pow(weight, 1 / 3);
  let ectomorphy = 0.1;
  if (hwr >= 40.75) {
    ectomorphy = 0.732 * hwr - 28.58;
  } else if (hwr > 38.25) {
    ectomorphy = 0.463 * hwr - 17.63;
  } else {
    ectomorphy = 0.1;
  }
  ectomorphy = Math.max(0.1, Number(ectomorphy.toFixed(2)));

  // Coordinates
  const xCoord = Number((ectomorphy - endomorphy).toFixed(2));
  const yCoord = Number((2 * mesomorphy - (endomorphy + ectomorphy)).toFixed(2));

  // Categorization
  const category = getSomatotypeCategory(endomorphy, mesomorphy, ectomorphy);

  return {
    endomorphy,
    mesomorphy,
    ectomorphy,
    xCoord,
    yCoord,
    category,
  };
}

/**
 * Categorizes a somatotype based on Endomorphy, Mesomorphy, and Ectomorphy
 */
export function getSomatotypeCategory(endo, meso, ecto) {
  // Check Central
  if (Math.abs(endo - meso) <= 1 && Math.abs(endo - ecto) <= 1 && Math.abs(meso - ecto) <= 1) {
    return "Central";
  }

  // Endomorph dominant
  if (endo > meso && endo > ecto) {
    if (Math.abs(meso - ecto) <= 0.5) {
      return "Endomorfo Balanceado";
    } else if (meso > ecto) {
      return "Mesomorfo Endomorfo";
    } else {
      return "Ectomorfo Endomorfo";
    }
  }

  // Mesomorph dominant
  if (meso > endo && meso > ecto) {
    if (Math.abs(endo - ecto) <= 0.5) {
      return "Mesomorfo Balanceado";
    } else if (endo > ecto) {
      return "Endomorfo Mesomorfo";
    } else {
      return "Ectomorfo Mesomorfo";
    }
  }

  // Ectomorph dominant
  if (ecto > endo && ecto > meso) {
    if (Math.abs(endo - meso) <= 0.5) {
      return "Ectomorfo Balanceado";
    } else if (meso > endo) {
      return "Mesomorfo Ectomorfo";
    } else {
      return "Endomorfo Ectomorfo";
    }
  }

  // Semi-dominant cases (two equal components greater than the third)
  if (Math.abs(endo - meso) <= 0.5 && endo > ecto) {
    return "Mesomorfo-Endomorfo";
  }
  if (Math.abs(meso - ecto) <= 0.5 && meso > endo) {
    return "Mesomorfo-Ectomorfo";
  }
  if (Math.abs(endo - ecto) <= 0.5 && endo > meso) {
    return "Endomorfo-Ectomorfo";
  }

  return "Indeterminado";
}

/**
 * Calculates Body Density using Durnin-Womersley 4-site method
 */
export function calculateDensityDurninWomersley(sum4, age, gender) {
  if (sum4 <= 0) return 0;
  const logSum = Math.log10(sum4);
  let c = 0;
  let m = 0;

  if (gender === "male") {
    if (age < 17) { c = 1.1533; m = 0.0643; }
    else if (age <= 19) { c = 1.1620; m = 0.0630; }
    else if (age <= 29) { c = 1.1631; m = 0.0632; }
    else if (age <= 39) { c = 1.1422; m = 0.0544; }
    else if (age <= 49) { c = 1.1620; m = 0.0700; }
    else { c = 1.1715; m = 0.0779; }
  } else {
    // female
    if (age < 17) { c = 1.1369; m = 0.0598; }
    else if (age <= 19) { c = 1.1549; m = 0.0678; }
    else if (age <= 29) { c = 1.1599; m = 0.0717; }
    else if (age <= 39) { c = 1.1423; m = 0.0632; }
    else if (age <= 49) { c = 1.1333; m = 0.0612; }
    else { c = 1.1339; m = 0.0645; }
  }

  return c - (m * logSum);
}

/**
 * Calculates Body Density using Jackson-Pollock 3-site method
 */
export function calculateDensityJacksonPollock3(sum3, age, gender) {
  if (sum3 <= 0) return 0;
  if (gender === "male") {
    return 1.10938 - (0.0008267 * sum3) + (0.0000016 * Math.pow(sum3, 2)) - (0.0002574 * age);
  } else {
    return 1.0994921 - (0.0009929 * sum3) + (0.0000023 * Math.pow(sum3, 2)) - (0.0001392 * age);
  }
}

/**
 * Calculates Body Density using Jackson-Pollock 7-site method
 */
export function calculateDensityJacksonPollock7(sum7, age, gender) {
  if (sum7 <= 0) return 0;
  if (gender === "male") {
    return 1.112 - (0.00043499 * sum7) + (0.00000055 * Math.pow(sum7, 2)) - (0.00028826 * age);
  } else {
    return 1.097 - (0.00046971 * sum7) + (0.00000056 * Math.pow(sum7, 2)) - (0.00012828 * age);
  }
}

/**
 * Converts density to body fat % using the Siri equation
 */
export function convertDensityToFatPercent(density) {
  if (density <= 0) return 0;
  const fatPercent = (4.95 / density - 4.50) * 100;
  return Math.max(0.1, Number(fatPercent.toFixed(2)));
}

/**
 * Automatically chooses the best density formula based on available skinfolds and returns the body fat percentage
 * @param {Object} data 
 * @returns {Object} { density, bodyFat, formulaUsed }
 */
export function calculateBodyFat(data) {
  const {
    age,
    gender,
    skinfoldTriceps,
    skinfoldBiceps,
    skinfoldSubescapular,
    skinfoldSupraspinale, // can act as suprailiac
    skinfoldAbdominal,
    skinfoldThigh,
    skinfoldCalf, // midaxillary can be mapped here or we can check J-P 3
  } = data;

  let density = 0;
  let formulaUsed = "";

  // 1. Check if we have J-P 3-site for Men: Chest, Abdominal, Thigh (Wait, we need Chest skinfold, let's assume it's supplied or check women)
  // Let's implement a fallback. Since our DB has:
  // Triceps, Biceps, Subscapular, Supraspinale, Abdominal, Thigh, Calf.
  // We can calculate Durnin-Womersley 4-site since we have Triceps, Biceps, Subscapular, Supraspinale (used as suprailiac).
  // Or we can calculate Jackson-Pollock 3-site (using Triceps, Supraspinale, Thigh for women; and check if we can approximate for men).
  // Let's use Durnin-Womersley 4-Site as the primary default because it uses the exact 4 limbs/torso skinfolds we have and is highly robust.
  
  const hasDW = skinfoldTriceps > 0 && skinfoldBiceps > 0 && skinfoldSubescapular > 0 && skinfoldSupraspinale > 0;
  
  if (hasDW) {
    const sum4 = skinfoldTriceps + skinfoldBiceps + skinfoldSubescapular + skinfoldSupraspinale;
    density = calculateDensityDurninWomersley(sum4, age, gender);
    formulaUsed = "Durnin-Womersley (4 Pliegues)";
  } else {
    // Fallback: JP 3-site for Women if we have Triceps, Supraspinale, Thigh
    const hasJP3Women = gender === "female" && skinfoldTriceps > 0 && skinfoldSupraspinale > 0 && skinfoldThigh > 0;
    // For Men, JP 3-site uses Chest, Abdominal, Thigh. If we don't have Chest, let's fall back to another approximation.
    // If we have Abdominal, Thigh, and Triceps, we can estimate.
    const hasJP3MenFallback = gender === "male" && skinfoldAbdominal > 0 && skinfoldThigh > 0 && skinfoldTriceps > 0;
    
    if (hasJP3Women) {
      const sum3 = skinfoldTriceps + skinfoldSupraspinale + skinfoldThigh;
      density = calculateDensityJacksonPollock3(sum3, age, gender);
      formulaUsed = "Jackson-Pollock (3 Pliegues)";
    } else if (hasJP3MenFallback) {
      // Approximate Chest with Triceps for calculation purposes or Abdominal + Thigh + Supraspinale
      const sum3 = skinfoldAbdominal + skinfoldThigh + skinfoldTriceps;
      density = calculateDensityJacksonPollock3(sum3, age, gender);
      formulaUsed = "Jackson-Pollock (3 Pliegues - Estimación)";
    } else {
      // Minimal fallback: if we have at least 3 skinfolds, sum them and apply general average
      const sumAny = [skinfoldTriceps, skinfoldBiceps, skinfoldSubescapular, skinfoldSupraspinale, skinfoldAbdominal, skinfoldThigh, skinfoldCalf]
        .filter(v => v > 0);
      if (sumAny.length >= 3) {
        const sum3 = sumAny.slice(0, 3).reduce((a, b) => a + b, 0);
        density = calculateDensityJacksonPollock3(sum3, age, gender);
        formulaUsed = "Jackson-Pollock Generalizado";
      }
    }
  }

  const bodyFat = convertDensityToFatPercent(density);

  return {
    density: Number(density.toFixed(5)),
    bodyFat,
    formulaUsed,
  };
}
