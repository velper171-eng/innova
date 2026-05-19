/**
 * Supplement Protocol and Inventory Engine
 */

/**
 * Creates preset phases for supplement cycles
 * @param {string} presetName - "creatine_loading" | "creatine_standard" | "whey_protein" | "pre_workout"
 * @param {number} weight - Patient weight in kg (for scaling loading dose)
 * @returns {Array} List of phases to create
 */
export function getSupplementPresetPhases(presetName, weight = 70) {
  const parsedWeight = parseFloat(weight) || 70;
  
  if (presetName === "creatine_loading") {
    // Creatine loading phase: 0.3g per kg or flat 20g. Let's scale based on weight.
    const loadingDose = Math.round(parsedWeight * 0.3); // e.g. 75kg * 0.3 = 22.5g -> 23g
    const finalLoadingDose = Math.min(25, Math.max(15, loadingDose)); // clamp between 15g and 25g
    
    return [
      {
        name: "Fase de Carga",
        durationDays: 7,
        dailyDose: finalLoadingDose,
        timingType: "custom", // Split dose typically: Morning, Pre, Post, Night
        customTime: "Fraccionado (4 tomas)",
      },
      {
        name: "Fase de Mantenimiento",
        durationDays: 60,
        dailyDose: 5.0, // standard maintenance dose
        timingType: "post-workout",
        customTime: null,
      }
    ];
  }

  if (presetName === "creatine_standard") {
    return [
      {
        name: "Mantenimiento Continuo",
        durationDays: 90,
        dailyDose: 5.0,
        timingType: "post-workout",
        customTime: null,
      }
    ];
  }

  if (presetName === "whey_protein") {
    return [
      {
        name: "Proteína Diaria",
        durationDays: 90,
        dailyDose: 30.0, // 30g scoop
        timingType: "post-workout",
        customTime: null,
      }
    ];
  }

  if (presetName === "pre_workout") {
    return [
      {
        name: "Pre-Entreno En Días Activos",
        durationDays: 60,
        dailyDose: 10.0, // 10g scoop
        timingType: "pre-workout",
        customTime: null,
      }
    ];
  }

  // Default fallback
  return [
    {
      name: "Suplementación General",
      durationDays: 30,
      dailyDose: 5.0,
      timingType: "morning",
      customTime: null,
    }
  ];
}

/**
 * Checks if a supplement is running low on stock (less than 5 days remaining)
 * @param {Object} supplement - Supplement DB model
 * @param {number} dailyDose - Current active daily dose
 * @returns {Object} { isLowStock: boolean, daysRemaining: number }
 */
export function checkInventoryAlert(supplement, dailyDose = 5) {
  const remaining = parseFloat(supplement.remainingQuantity) || 0;
  const dose = parseFloat(dailyDose) || 5;

  if (dose <= 0) return { isLowStock: false, daysRemaining: 999 };

  const daysRemaining = Math.max(0, Math.round(remaining / dose));
  return {
    isLowStock: daysRemaining <= 5,
    daysRemaining,
  };
}
