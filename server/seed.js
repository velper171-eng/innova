import prisma from "./database.js";
import { calculateSomatotype, calculateBodyFat } from "./calculator.js";
import { getSupplementPresetPhases } from "./supplementEngine.js";

async function seed() {
  console.log("Seeding database with sample patients, evaluations, supplements, and cycles...");

  // Clear existing data (in order of dependencies)
  await prisma.intakeLog.deleteMany({});
  await prisma.cyclePhase.deleteMany({});
  await prisma.supplementCycle.deleteMany({});
  await prisma.supplement.deleteMany({});
  await prisma.workoutSchedule.deleteMany({});
  await prisma.evaluation.deleteMany({});
  await prisma.patient.deleteMany({});

  // --- CREATE PATIENT 1: Carlos Gómez ---
  const patient1 = await prisma.patient.create({
    data: {
      name: "Carlos Gómez",
      birthdate: "1990-08-12",
      gender: "male",
      email: "carlos.gomez@gmail.com",
      phone: "+57 321 987 6543",
      sport: "Levantamiento de Pesas",
    }
  });

  // Schedule for Carlos: 6:00 PM (18:00) on Mon, Wed, Fri
  await prisma.workoutSchedule.create({
    data: {
      patientId: patient1.id,
      workoutTime: "18:00",
      activeDays: "Lunes,Miércoles,Viernes"
    }
  });

  // Supplement Inventory for Carlos: Creatina Evolufit (300g, 45g left to trigger alert soon!)
  const supplement1 = await prisma.supplement.create({
    data: {
      patientId: patient1.id,
      name: "Creatina Monohidratada",
      brand: "Evolufit",
      totalCapacity: 300,
      remainingQuantity: 45, // Under 5 days of loading (at 20g/day) or maintenance!
      unit: "g",
      purchaseLink: "https://wa.me/573001234567?text=Hola,%20quiero%20recomprar%20Creatina%20Evolufit"
    }
  });

  // Supplement Inventory for Carlos: Proteína de Suero (900g, 800g left)
  const supplement2 = await prisma.supplement.create({
    data: {
      patientId: patient1.id,
      name: "Whey Protein isolate",
      brand: "Optimum Nutrition",
      totalCapacity: 900,
      remainingQuantity: 800,
      unit: "g",
      purchaseLink: "https://optimum-nutrition.com"
    }
  });

  // Active Creatine Cycle for Carlos: started 2 days ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 2); // 2 days ago
  const startDateStr = startDate.toISOString().split("T")[0];

  const creatinePhases = getSupplementPresetPhases("creatine_loading", 80); // Carlos weighs 80kg -> loading dose = 24g
  const cycle1 = await prisma.supplementCycle.create({
    data: {
      patientId: patient1.id,
      supplementId: supplement1.id,
      name: "Ciclo de Creatina (Carga)",
      startDate: startDateStr,
      isActive: true,
      phases: {
        create: creatinePhases.map(p => ({
          name: p.name,
          durationDays: p.durationDays,
          dailyDose: p.dailyDose,
          timingType: p.timingType,
          customTime: p.customTime
        }))
      }
    }
  });

  // Logs for Carlos: took yesterday's and today's morning dose
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];

  await prisma.intakeLog.create({
    data: {
      cycleId: cycle1.id,
      date: yesterdayStr,
      time: "08:00",
      doseTaken: 6.0, // 24g split in 4 = 6g
      status: "taken"
    }
  });

  await prisma.intakeLog.create({
    data: {
      cycleId: cycle1.id,
      date: todayStr,
      time: "08:00",
      doseTaken: 6.0,
      status: "taken"
    }
  });

  // Evaluations for Carlos
  const ev1Data = {
    age: 35,
    gender: "male",
    height: 178,
    weight: 85,
    skinfoldTriceps: 14,
    skinfoldBiceps: 6,
    skinfoldSubescapular: 16,
    skinfoldSupraspinale: 15,
    skinfoldAbdominal: 22,
    skinfoldThigh: 18,
    skinfoldCalf: 12,
    girthArm: 36,
    girthCalf: 38,
    diameterHumerus: 7.2,
    diameterFemur: 9.8
  };
  const somato1 = calculateSomatotype(ev1Data);
  const fat1 = calculateBodyFat(ev1Data);

  await prisma.evaluation.create({
    data: {
      patientId: patient1.id,
      date: "2026-01-10",
      weight: ev1Data.weight,
      height: ev1Data.height,
      age: ev1Data.age,
      skinfoldTriceps: ev1Data.skinfoldTriceps,
      skinfoldBiceps: ev1Data.skinfoldBiceps,
      skinfoldSubescapular: ev1Data.skinfoldSubescapular,
      skinfoldSupraspinale: ev1Data.skinfoldSupraspinale,
      skinfoldAbdominal: ev1Data.skinfoldAbdominal,
      skinfoldThigh: ev1Data.skinfoldThigh,
      skinfoldCalf: ev1Data.skinfoldCalf,
      girthArm: ev1Data.girthArm,
      girthCalf: ev1Data.girthCalf,
      diameterHumerus: ev1Data.diameterHumerus,
      diameterFemur: ev1Data.diameterFemur,
      density: fat1.density,
      bodyFat: fat1.bodyFat,
      endomorphy: somato1.endomorphy,
      mesomorphy: somato1.mesomorphy,
      ectomorphy: somato1.ectomorphy,
      xCoord: somato1.xCoord,
      yCoord: somato1.yCoord,
    }
  });

  const ev2Data = {
    age: 35,
    gender: "male",
    height: 178,
    weight: 80,
    skinfoldTriceps: 8,
    skinfoldBiceps: 3.5,
    skinfoldSubescapular: 10,
    skinfoldSupraspinale: 8,
    skinfoldAbdominal: 12,
    skinfoldThigh: 11,
    skinfoldCalf: 8,
    girthArm: 37,
    girthCalf: 38,
    diameterHumerus: 7.2,
    diameterFemur: 9.8
  };
  const somato2 = calculateSomatotype(ev2Data);
  const fat2 = calculateBodyFat(ev2Data);

  await prisma.evaluation.create({
    data: {
      patientId: patient1.id,
      date: "2026-05-19",
      weight: ev2Data.weight,
      height: ev2Data.height,
      age: ev2Data.age,
      skinfoldTriceps: ev2Data.skinfoldTriceps,
      skinfoldBiceps: ev2Data.skinfoldBiceps,
      skinfoldSubescapular: ev2Data.skinfoldSubescapular,
      skinfoldSupraspinale: ev2Data.skinfoldSupraspinale,
      skinfoldAbdominal: ev2Data.skinfoldAbdominal,
      skinfoldThigh: ev2Data.skinfoldThigh,
      skinfoldCalf: ev2Data.skinfoldCalf,
      girthArm: ev2Data.girthArm,
      girthCalf: ev2Data.girthCalf,
      diameterHumerus: ev2Data.diameterHumerus,
      diameterFemur: ev2Data.diameterFemur,
      density: fat2.density,
      bodyFat: fat2.bodyFat,
      endomorphy: somato2.endomorphy,
      mesomorphy: somato2.mesomorphy,
      ectomorphy: somato2.ectomorphy,
      xCoord: somato2.xCoord,
      yCoord: somato2.yCoord,
    }
  });


  // --- CREATE PATIENT 2: Mariana Restrepo ---
  const patient2 = await prisma.patient.create({
    data: {
      name: "Mariana Restrepo",
      birthdate: "1997-11-22",
      gender: "female",
      email: "mariana.r@hotmail.com",
      phone: "+57 310 445 6677",
      sport: "Natación",
    }
  });

  await prisma.workoutSchedule.create({
    data: {
      patientId: patient2.id,
      workoutTime: "06:00", // 6:00 AM swimmer workout
      activeDays: "Martes,Jueves,Sábado"
    }
  });

  const evFemaleData = {
    age: 28,
    gender: "female",
    height: 165,
    weight: 58,
    skinfoldTriceps: 10,
    skinfoldBiceps: 5,
    skinfoldSubescapular: 9,
    skinfoldSupraspinale: 12,
    skinfoldAbdominal: 14,
    skinfoldThigh: 16,
    skinfoldCalf: 11,
    girthArm: 26,
    girthCalf: 34,
    diameterHumerus: 6.0,
    diameterFemur: 8.5
  };
  const somatoF = calculateSomatotype(evFemaleData);
  const fatF = calculateBodyFat(evFemaleData);

  await prisma.evaluation.create({
    data: {
      patientId: patient2.id,
      date: "2026-05-10",
      weight: evFemaleData.weight,
      height: evFemaleData.height,
      age: evFemaleData.age,
      skinfoldTriceps: evFemaleData.skinfoldTriceps,
      skinfoldBiceps: evFemaleData.skinfoldBiceps,
      skinfoldSubescapular: evFemaleData.skinfoldSubescapular,
      skinfoldSupraspinale: evFemaleData.skinfoldSupraspinale,
      skinfoldAbdominal: evFemaleData.skinfoldAbdominal,
      skinfoldThigh: evFemaleData.skinfoldThigh,
      skinfoldCalf: evFemaleData.skinfoldCalf,
      girthArm: evFemaleData.girthArm,
      girthCalf: evFemaleData.girthCalf,
      diameterHumerus: evFemaleData.diameterHumerus,
      diameterFemur: evFemaleData.diameterFemur,
      density: fatF.density,
      bodyFat: fatF.bodyFat,
      endomorphy: somatoF.endomorphy,
      mesomorphy: somatoF.mesomorphy,
      ectomorphy: somatoF.ectomorphy,
      xCoord: somatoF.xCoord,
      yCoord: somatoF.yCoord,
    }
  });

  console.log("Database seeded successfully with all modules!");
}

seed().catch(err => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
