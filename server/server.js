import "./load-env.js";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import prisma from "./database.js";
import { calculateSomatotype, calculateBodyFat } from "./calculator.js";
import { getSupplementPresetPhases, checkInventoryAlert } from "./supplementEngine.js";
import { enqueuePostureJob, getQueueStatus } from "./queue.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// --- PATIENTS ROUTE ---

// Get all patients
app.get("/api/patients", async (req, res) => {
  console.log("ROUTE /api/patients: Request received.");
  try {
    console.log("ROUTE /api/patients: Querying Prisma...");
    const patients = await prisma.patient.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { evaluations: true }
        }
      }
    });
    console.log(`ROUTE /api/patients: Query successful. Patients found: ${patients.length}`);
    res.json(patients);
  } catch (error) {
    console.error("ROUTE /api/patients: Error fetching patients:", error);
    res.status(500).json({ error: "Error al obtener los pacientes" });
  }
});

// Get a patient by ID (including all evaluations)
app.get("/api/patients/:id", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    if (isNaN(patientId)) {
      return res.status(400).json({ error: "ID de paciente inválido" });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        evaluations: {
          orderBy: { date: "desc" }
        },
        supplements: true,
        cycles: {
          include: {
            phases: true,
            logs: true
          }
        },
        workoutSchedule: true
      }
    });

    if (!patient) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    res.json(patient);
  } catch (error) {
    console.error("Error fetching patient detail:", error);
    res.status(500).json({ error: "Error al obtener los detalles del paciente" });
  }
});

// Create a new patient
app.post("/api/patients", async (req, res) => {
  try {
    const { name, birthdate, gender, email, phone, sport } = req.body;
    
    if (!name || !birthdate || !gender) {
      return res.status(400).json({ error: "El nombre, fecha de nacimiento y género son obligatorios" });
    }

    const newPatient = await prisma.patient.create({
      data: {
        name,
        birthdate,
        gender,
        email,
        phone,
        sport
      }
    });

    res.status(201).json(newPatient);
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: "Error al crear el paciente" });
  }
});

// Update patient details
app.put("/api/patients/:id", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    if (isNaN(patientId)) {
      return res.status(400).json({ error: "ID de paciente inválido" });
    }

    const { name, birthdate, gender, email, phone, sport } = req.body;

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        name,
        birthdate,
        gender,
        email,
        phone,
        sport
      }
    });

    res.json(updatedPatient);
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ error: "Error al actualizar el paciente" });
  }
});

// Delete a patient
app.delete("/api/patients/:id", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    if (isNaN(patientId)) {
      return res.status(400).json({ error: "ID de paciente inválido" });
    }

    await prisma.patient.delete({
      where: { id: patientId }
    });

    res.json({ message: "Paciente eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ error: "Error al eliminar el paciente" });
  }
});

// --- EVALUATIONS ROUTE ---

// Add a new evaluation to a patient
app.post("/api/patients/:id/evaluations", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    if (isNaN(patientId)) {
      return res.status(400).json({ error: "ID de paciente inválido" });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    const evalData = req.body;
    
    // Validate key fields
    if (!evalData.date || !evalData.weight || !evalData.height || !evalData.age) {
      return res.status(400).json({ error: "Fecha, peso, altura y edad son requeridos" });
    }

    // Helper to extract fields and ensure they are floats/ints
    const cleanData = {
      age: parseInt(evalData.age),
      gender: patient.gender,
      height: parseFloat(evalData.height),
      weight: parseFloat(evalData.weight),
      skinfoldTriceps: parseFloat(evalData.skinfoldTriceps || 0),
      skinfoldBiceps: parseFloat(evalData.skinfoldBiceps || 0),
      skinfoldSubescapular: parseFloat(evalData.skinfoldSubescapular || 0),
      skinfoldSupraspinale: parseFloat(evalData.skinfoldSupraspinale || 0),
      skinfoldAbdominal: parseFloat(evalData.skinfoldAbdominal || 0),
      skinfoldThigh: parseFloat(evalData.skinfoldThigh || 0),
      skinfoldCalf: parseFloat(evalData.skinfoldCalf || 0),
      girthArm: parseFloat(evalData.girthArm || 0),
      girthCalf: parseFloat(evalData.girthCalf || 0),
      diameterHumerus: parseFloat(evalData.diameterHumerus || 0),
      diameterFemur: parseFloat(evalData.diameterFemur || 0),
    };

    // Calculate Somatotype and Body Fat
    const somatotype = calculateSomatotype(cleanData);
    const bodyFatRes = calculateBodyFat(cleanData);

    const newEvaluation = await prisma.evaluation.create({
      data: {
        patientId,
        date: evalData.date,
        weight: cleanData.weight,
        height: cleanData.height,
        age: cleanData.age,
        skinfoldTriceps: cleanData.skinfoldTriceps,
        skinfoldBiceps: cleanData.skinfoldBiceps,
        skinfoldSubescapular: cleanData.skinfoldSubescapular,
        skinfoldSupraspinale: cleanData.skinfoldSupraspinale,
        skinfoldAbdominal: cleanData.skinfoldAbdominal,
        skinfoldThigh: cleanData.skinfoldThigh,
        skinfoldCalf: cleanData.skinfoldCalf,
        girthArm: cleanData.girthArm,
        girthCalf: cleanData.girthCalf,
        diameterHumerus: cleanData.diameterHumerus,
        diameterFemur: cleanData.diameterFemur,
        density: bodyFatRes.density,
        bodyFat: bodyFatRes.bodyFat,
        endomorphy: somatotype.endomorphy,
        mesomorphy: somatotype.mesomorphy,
        ectomorphy: somatotype.ectomorphy,
        xCoord: somatotype.xCoord,
        yCoord: somatotype.yCoord,
      }
    });

    res.status(201).json(newEvaluation);
  } catch (error) {
    console.error("Error creating evaluation:", error);
    res.status(500).json({ error: "Error al registrar la evaluación" });
  }
});

// Delete an evaluation
app.delete("/api/evaluations/:id", async (req, res) => {
  try {
    const evalId = parseInt(req.params.id);
    if (isNaN(evalId)) {
      return res.status(400).json({ error: "ID de evaluación inválido" });
    }

    await prisma.evaluation.delete({
      where: { id: evalId }
    });

    res.json({ message: "Evaluación eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting evaluation:", error);
    res.status(500).json({ error: "Error al eliminar la evaluación" });
  }
});

// Real-time calculations endpoint (no database save)
app.post("/api/calculate", (req, res) => {
  try {
    const evalData = req.body;
    const cleanData = {
      age: parseInt(evalData.age || 20),
      gender: evalData.gender || "male",
      height: parseFloat(evalData.height || 170),
      weight: parseFloat(evalData.weight || 70),
      skinfoldTriceps: parseFloat(evalData.skinfoldTriceps || 0),
      skinfoldBiceps: parseFloat(evalData.skinfoldBiceps || 0),
      skinfoldSubescapular: parseFloat(evalData.skinfoldSubescapular || 0),
      skinfoldSupraspinale: parseFloat(evalData.skinfoldSupraspinale || 0),
      skinfoldAbdominal: parseFloat(evalData.skinfoldAbdominal || 0),
      skinfoldThigh: parseFloat(evalData.skinfoldThigh || 0),
      skinfoldCalf: parseFloat(evalData.skinfoldCalf || 0),
      girthArm: parseFloat(evalData.girthArm || 0),
      girthCalf: parseFloat(evalData.girthCalf || 0),
      diameterHumerus: parseFloat(evalData.diameterHumerus || 0),
      diameterFemur: parseFloat(evalData.diameterFemur || 0),
    };

    const somatotype = calculateSomatotype(cleanData);
    const bodyFatRes = calculateBodyFat(cleanData);

    res.json({
      somatotype,
      bodyFat: bodyFatRes,
    });
  } catch (error) {
    console.error("Error running real-time calculations:", error);
    res.status(400).json({ error: "Parámetros de cálculo inválidos" });
  }
});

// --- WORKOUT SCHEDULE ROUTES ---

// Get schedule
app.get("/api/patients/:id/schedule", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    let schedule = await prisma.workoutSchedule.findUnique({
      where: { patientId }
    });
    if (!schedule) {
      // Create a default schedule
      schedule = await prisma.workoutSchedule.create({
        data: {
          patientId,
          workoutTime: "18:00",
          activeDays: "Lunes,Miércoles,Viernes"
        }
      });
    }
    res.json(schedule);
  } catch (error) {
    console.error("Error getting schedule:", error);
    res.status(500).json({ error: "Error al obtener el horario" });
  }
});

// Save schedule
app.post("/api/patients/:id/schedule", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { workoutTime, activeDays } = req.body;
    const schedule = await prisma.workoutSchedule.upsert({
      where: { patientId },
      update: { workoutTime, activeDays },
      create: { patientId, workoutTime, activeDays }
    });
    res.json(schedule);
  } catch (error) {
    console.error("Error saving schedule:", error);
    res.status(500).json({ error: "Error al guardar el horario" });
  }
});

// --- SUPPLEMENT INVENTORY ROUTES ---

app.get("/api/patients/:id/supplements", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const supplements = await prisma.supplement.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" }
    });
    res.json(supplements);
  } catch (error) {
    console.error("Error fetching supplements:", error);
    res.status(500).json({ error: "Error al obtener suplementos" });
  }
});

app.post("/api/patients/:id/supplements", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { name, brand, totalCapacity, remainingQuantity, unit, purchaseLink } = req.body;
    const supplement = await prisma.supplement.create({
      data: {
        patientId,
        name,
        brand,
        totalCapacity: parseFloat(totalCapacity),
        remainingQuantity: parseFloat(remainingQuantity),
        unit,
        purchaseLink
      }
    });
    res.status(201).json(supplement);
  } catch (error) {
    console.error("Error creating supplement:", error);
    res.status(500).json({ error: "Error al crear suplemento" });
  }
});

app.delete("/api/supplements/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.supplement.delete({ where: { id } });
    res.json({ message: "Suplemento eliminado" });
  } catch (error) {
    console.error("Error deleting supplement:", error);
    res.status(500).json({ error: "Error al eliminar suplemento" });
  }
});

// --- SUPPLEMENT CYCLE ROUTES ---

app.get("/api/patients/:id/cycles", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const cycles = await prisma.supplementCycle.findMany({
      where: { patientId },
      include: {
        phases: true,
        logs: { orderBy: { date: "desc" } },
        supplement: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(cycles);
  } catch (error) {
    console.error("Error fetching cycles:", error);
    res.status(500).json({ error: "Error al obtener ciclos" });
  }
});

app.post("/api/patients/:id/cycles", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { name, supplementId, startDate, presetName } = req.body;

    // Fetch latest weight from evaluations to adjust Creatine load phase
    const latestEval = await prisma.evaluation.findFirst({
      where: { patientId },
      orderBy: { date: "desc" }
    });
    const weight = latestEval ? latestEval.weight : 70;

    const phasesToCreate = getSupplementPresetPhases(presetName, weight);

    const cycle = await prisma.supplementCycle.create({
      data: {
        patientId,
        name,
        supplementId: supplementId ? parseInt(supplementId) : null,
        startDate,
        isActive: true,
        phases: {
          create: phasesToCreate.map(p => ({
            name: p.name,
            durationDays: p.durationDays,
            dailyDose: p.dailyDose,
            timingType: p.timingType,
            customTime: p.customTime
          }))
        }
      },
      include: {
        phases: true
      }
    });

    res.status(201).json(cycle);
  } catch (error) {
    console.error("Error creating cycle:", error);
    res.status(500).json({ error: "Error al crear el ciclo de suplementación" });
  }
});

app.delete("/api/cycles/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.supplementCycle.delete({ where: { id } });
    res.json({ message: "Ciclo eliminado" });
  } catch (error) {
    console.error("Error deleting cycle:", error);
    res.status(500).json({ error: "Error al eliminar el ciclo" });
  }
});

// --- INTAKE LOGS AND DEDUCTION ---

app.post("/api/cycles/:id/logs", async (req, res) => {
  try {
    const cycleId = parseInt(req.params.id);
    const { date, time, doseTaken, status } = req.body;

    const cycle = await prisma.supplementCycle.findUnique({
      where: { id: cycleId },
      include: { supplement: true }
    });

    if (!cycle) {
      return res.status(404).json({ error: "Ciclo no encontrado" });
    }

    // Create log record
    const log = await prisma.intakeLog.create({
      data: {
        cycleId,
        date,
        time,
        doseTaken: parseFloat(doseTaken),
        status
      }
    });

    // If marked as taken and linked to an inventory supplement, deduct stock
    if (status === "taken" && cycle.supplement) {
      const updatedRemaining = Math.max(0, cycle.supplement.remainingQuantity - parseFloat(doseTaken));
      await prisma.supplement.update({
        where: { id: cycle.supplement.id },
        data: { remainingQuantity: updatedRemaining }
      });
    }

    res.status(201).json(log);
  } catch (error) {
    console.error("Error logging supplement intake:", error);
    res.status(500).json({ error: "Error al registrar la toma" });
  }
});

// --- REMINDERS & NOTIFICATION ALERTS ENGINE ---

app.get("/api/patients/:id/reminders", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const queryDate = req.query.date || new Date().toISOString().split("T")[0];

    const schedule = await prisma.workoutSchedule.findUnique({
      where: { patientId }
    }) || { workoutTime: "18:00", activeDays: "Lunes,Miércoles,Viernes" };

    const cycles = await prisma.supplementCycle.findMany({
      where: { patientId, isActive: true },
      include: {
        phases: true,
        logs: { where: { date: queryDate } },
        supplement: true
      }
    });

    const reminders = [];

    // Helper: calculate pre-workout and post-workout times
    const calculateRelativeTime = (baseTime, minutesOffset) => {
      try {
        const [hours, minutes] = baseTime.split(":").map(Number);
        const dateObj = new Date();
        dateObj.setHours(hours, minutes, 0, 0);
        dateObj.setMinutes(dateObj.getMinutes() + minutesOffset);
        return dateObj.toTimeString().split(" ")[0].substring(0, 5);
      } catch (err) {
        return baseTime;
      }
    };

    for (const cycle of cycles) {
      // Determine which phase is currently active
      // Order phases to calculate start offset
      const sortedPhases = cycle.phases; 
      let activePhase = null;
      let dayOffsetAccumulator = 0;

      const startDate = new Date(cycle.startDate);
      const targetDate = new Date(queryDate);
      const diffTime = Math.abs(targetDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days since start (1-indexed)

      if (targetDate >= startDate) {
        for (const phase of sortedPhases) {
          if (diffDays >= dayOffsetAccumulator && diffDays <= (dayOffsetAccumulator + phase.durationDays)) {
            activePhase = phase;
            break;
          }
          dayOffsetAccumulator += phase.durationDays;
        }
      }

      if (!activePhase && sortedPhases.length > 0) {
        // Fallback: default to the last phase if cycle is active but timeline is exceeded
        activePhase = sortedPhases[sortedPhases.length - 1];
      }

      if (activePhase) {
        let reminderTime = "12:00";
        if (activePhase.timingType === "morning") reminderTime = "08:00";
        else if (activePhase.timingType === "night") reminderTime = "21:00";
        else if (activePhase.timingType === "pre-workout") {
          reminderTime = calculateRelativeTime(schedule.workoutTime, -45);
        } else if (activePhase.timingType === "post-workout") {
          reminderTime = calculateRelativeTime(schedule.workoutTime, 60);
        } else if (activePhase.timingType === "custom" && activePhase.customTime) {
          reminderTime = activePhase.customTime;
        }

        const logged = cycle.logs.find(l => l.time === reminderTime || cycle.logs.length > 0);

        let stockInfo = null;
        if (cycle.supplement) {
          const alert = checkInventoryAlert(cycle.supplement, activePhase.dailyDose);
          stockInfo = {
            id: cycle.supplement.id,
            remainingQuantity: cycle.supplement.remainingQuantity,
            unit: cycle.supplement.unit,
            daysRemaining: alert.daysRemaining,
            isLowStock: alert.isLowStock,
            purchaseLink: cycle.supplement.purchaseLink
          };
        }

        reminders.push({
          cycleId: cycle.id,
          cycleName: cycle.name,
          phaseName: activePhase.name,
          dailyDose: activePhase.dailyDose,
          timingType: activePhase.timingType,
          scheduledTime: reminderTime,
          status: logged ? logged.status : "pending",
          logId: logged ? logged.id : null,
          stock: stockInfo
        });
      }
    }

    res.json({
      date: queryDate,
      workoutTime: schedule.workoutTime,
      activeDays: schedule.activeDays,
      reminders
    });
  } catch (error) {
    console.error("Error creating reminders list:", error);
    res.status(500).json({ error: "Error al calcular recordatorios" });
  }
});

// --- POSTURE ANALYSIS MODULE ---

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "posture-" + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Serve uploaded videos statically
app.use("/api/uploads", express.static(uploadDir));

// Upload video and queue analysis
app.post("/api/patients/:id/posture", upload.single("video"), async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    if (isNaN(patientId)) {
      return res.status(400).json({ error: "ID de paciente inválido" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo de video" });
    }

    const videoPath = `/uploads/${req.file.filename}`;

    // Create record in database
    const job = await prisma.postureAnalysisJob.create({
      data: {
        patientId,
        videoPath,
        status: "pending",
        progress: 0
      }
    });

    // Enqueue to background process
    enqueuePostureJob(job.id, req.file.path);

    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating posture analysis job:", error);
    res.status(500).json({ error: "Error al encolar el análisis biomecánico" });
  }
});

// Get all posture jobs for a patient
app.get("/api/patients/:id/posture/jobs", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const jobs = await prisma.postureAnalysisJob.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" }
    });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching posture jobs:", error);
    res.status(500).json({ error: "Error al obtener los análisis" });
  }
});

// Poll status of a single job
app.get("/api/posture/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const job = await prisma.postureAnalysisJob.findUnique({
      where: { id }
    });

    if (!job) {
      return res.status(404).json({ error: "Trabajo no encontrado" });
    }

    res.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      videoPath: job.videoPath,
      result: job.resultJson ? JSON.parse(job.resultJson) : null,
      createdAt: job.createdAt
    });
  } catch (error) {
    console.error("Error polling job status:", error);
    res.status(500).json({ error: "Error al obtener estado del análisis" });
  }
});

// Get queue health check
app.get("/api/posture/queue", (req, res) => {
  res.json(getQueueStatus());
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
