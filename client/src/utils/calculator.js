/**
 * Client-side Somatotype and Body Composition formulas
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
    girthArmContracted,
    girthCalf,
    diameterHumerus,
    diameterFemur,
  } = data;

  if (!height || !weight) return null;

  // 1. Endomorphy
  const sum3Skinfolds = (skinfoldTriceps || 0) + (skinfoldSubescapular || 0) + (skinfoldSupraspinale || 0);
  const heightCorrection = sum3Skinfolds * (170.18 / height);
  let endomorphy = -0.7182 + 0.1451 * heightCorrection - 0.00068 * Math.pow(heightCorrection, 2) + 0.0000014 * Math.pow(heightCorrection, 3);
  endomorphy = Math.max(0.1, Number(endomorphy.toFixed(2)));

  // 2. Mesomorphy
  const armGirth = girthArmContracted || girthArm || 0;
  const correctedArmGirth = armGirth - ((skinfoldTriceps || 0) / 10);
  const correctedCalfGirth = (girthCalf || 0) - ((skinfoldCalf || 0) / 10);
  let mesomorphy = (0.858 * (diameterHumerus || 0)) + (0.601 * (diameterFemur || 0)) + (0.188 * correctedArmGirth) + (0.161 * correctedCalfGirth) - (height * 0.131) + 4.50;
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

export function getSomatotypeCategory(endo, meso, ecto) {
  if (Math.abs(endo - meso) <= 1 && Math.abs(endo - ecto) <= 1 && Math.abs(meso - ecto) <= 1) {
    return "Central";
  }

  if (endo > meso && endo > ecto) {
    if (Math.abs(meso - ecto) <= 0.5) {
      return "Endomorfo Balanceado";
    } else if (meso > ecto) {
      return "Mesomorfo Endomorfo";
    } else {
      return "Ectomorfo Endomorfo";
    }
  }

  if (meso > endo && meso > ecto) {
    if (Math.abs(endo - ecto) <= 0.5) {
      return "Mesomorfo Balanceado";
    } else if (endo > ecto) {
      return "Endomorfo Mesomorfo";
    } else {
      return "Ectomorfo Mesomorfo";
    }
  }

  if (ecto > endo && ecto > meso) {
    if (Math.abs(endo - meso) <= 0.5) {
      return "Ectomorfo Balanceado";
    } else if (meso > endo) {
      return "Mesomorfo Ectomorfo";
    } else {
      return "Endomorfo Ectomorfo";
    }
  }

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
    if (age < 17) { c = 1.1369; m = 0.0598; }
    else if (age <= 19) { c = 1.1549; m = 0.0678; }
    else if (age <= 29) { c = 1.1599; m = 0.0717; }
    else if (age <= 39) { c = 1.1423; m = 0.0632; }
    else if (age <= 49) { c = 1.1333; m = 0.0612; }
    else { c = 1.1339; m = 0.0645; }
  }

  return c - (m * logSum);
}

export function calculateDensityJacksonPollock3(sum3, age, gender) {
  if (sum3 <= 0) return 0;
  if (gender === "male") {
    return 1.10938 - (0.0008267 * sum3) + (0.0000016 * Math.pow(sum3, 2)) - (0.0002574 * age);
  } else {
    return 1.0994921 - (0.0009929 * sum3) + (0.0000023 * Math.pow(sum3, 2)) - (0.0001392 * age);
  }
}

export function convertDensityToFatPercent(density) {
  if (density <= 0) return 0;
  const fatPercent = (4.95 / density - 4.50) * 100;
  return Math.max(0.1, Number(fatPercent.toFixed(2)));
}

export function calculateBodyFat(data) {
  const {
    age,
    gender,
    skinfoldTriceps,
    skinfoldBiceps,
    skinfoldSubescapular,
    skinfoldSupraspinale,
    skinfoldCrestaIliaca,
    skinfoldAbdominal,
    skinfoldThigh,
  } = data;

  if (!age) return null;

  let density = 0;
  let formulaUsed = "";
  let bodyFat = 0;

  const hasFaulkner = (skinfoldTriceps || 0) > 0 && (skinfoldSubescapular || 0) > 0 && (skinfoldSupraspinale || 0) > 0 && (skinfoldCrestaIliaca || 0) > 0;
  const hasDW = (skinfoldTriceps || 0) > 0 && (skinfoldBiceps || 0) > 0 && (skinfoldSubescapular || 0) > 0 && (skinfoldSupraspinale || 0) > 0;

  if (hasFaulkner) {
    const sum4 = (skinfoldTriceps || 0) + (skinfoldSubescapular || 0) + (skinfoldSupraspinale || 0) + (skinfoldCrestaIliaca || 0);
    bodyFat = Number((sum4 * 0.153 + 5.783).toFixed(2));
    formulaUsed = "Faulkner (4 Pliegues)";
    density = 4.95 / ((bodyFat / 100) + 4.50);
  } else if (hasDW) {
    const sum4 = skinfoldTriceps + skinfoldBiceps + skinfoldSubescapular + skinfoldSupraspinale;
    density = calculateDensityDurninWomersley(sum4, age, gender);
    bodyFat = convertDensityToFatPercent(density);
    formulaUsed = "Durnin-Womersley";
  } else {
    const hasJP3Women = gender === "female" && skinfoldTriceps > 0 && skinfoldSupraspinale > 0 && skinfoldThigh > 0;
    const hasJP3MenFallback = gender === "male" && skinfoldAbdominal > 0 && skinfoldThigh > 0 && skinfoldTriceps > 0;
    
    if (hasJP3Women) {
      const sum3 = skinfoldTriceps + skinfoldSupraspinale + skinfoldThigh;
      density = calculateDensityJacksonPollock3(sum3, age, gender);
      bodyFat = convertDensityToFatPercent(density);
      formulaUsed = "Jackson-Pollock 3P";
    } else if (hasJP3MenFallback) {
      const sum3 = skinfoldAbdominal + skinfoldThigh + skinfoldTriceps;
      density = calculateDensityJacksonPollock3(sum3, age, gender);
      bodyFat = convertDensityToFatPercent(density);
      formulaUsed = "Jackson-Pollock 3P (Est.)";
    }
  }

  if (bodyFat === 0 && density > 0) {
    bodyFat = convertDensityToFatPercent(density);
  }

  if (bodyFat === 0) return null;

  return {
    density,
    bodyFat,
    formulaUsed,
  };
}
