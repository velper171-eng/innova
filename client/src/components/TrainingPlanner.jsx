import React, { useState, useEffect } from "react";

const API_BASE = "/api";

// ─── Muscle Group SVG Silhouettes ───────────────────────────────────────────
const MUSCLE_COLORS = {
  legs: "#008080",
  chest: "#00BFFF",
  back: "#FF8C00",
  shoulders: "#32CD32",
  arms: "#9370DB",
  core: "#FF6347",
  full_body: "#008080",
  rest: "#aaa",
};

const MuscleSilhouette = ({ highlight = "legs", view = "front" }) => {
  const isHighlighted = (muscles) => muscles.includes(highlight) || highlight === "full_body";
  
  // Neon colors
  const activeColor = "#10b981"; // Glowing green
  const inactiveColor = "rgba(255, 255, 255, 0.06)";
  const strokeColor = "rgba(255, 255, 255, 0.15)";

  if (view === "front") {
    return (
      <svg viewBox="0 0 120 240" width="80" height="160" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
        <defs>
          <filter id="neonGlowFront" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Head */}
        <ellipse cx="60" cy="22" rx="14" ry="16" fill={inactiveColor} stroke={strokeColor} strokeWidth="1" />
        {/* Neck */}
        <rect x="55" y="38" width="10" height="8" rx="2" fill={inactiveColor} stroke={strokeColor} strokeWidth="1" />
        
        {/* Chest */}
        <path d="M 36,46 C 45,43 55,43 60,43 C 65,43 75,43 84,46 L 81,75 C 60,78 60,78 39,75 Z"
          fill={isHighlighted(["chest"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["chest"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["chest"]) ? "url(#neonGlowFront)" : ""}
          style={{ transition: "all 0.3s" }}
        />
        
        {/* Shoulders */}
        <path d="M 36,46 C 28,48 26,56 30,62 C 32,58 35,50 36,46 Z"
          fill={isHighlighted(["shoulders"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["shoulders"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["shoulders"]) ? "url(#neonGlowFront)" : ""}
          style={{ transition: "all 0.3s" }}
        />
        <path d="M 84,46 C 92,48 94,56 90,62 C 88,58 85,50 84,46 Z"
          fill={isHighlighted(["shoulders"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["shoulders"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["shoulders"]) ? "url(#neonGlowFront)" : ""}
          style={{ transition: "all 0.3s" }}
        />

        {/* Arms */}
        <path d="M 30,62 C 27,80 25,98 28,120 C 31,98 33,80 34,70 Z"
          fill={isHighlighted(["arms"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["arms"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["arms"]) ? "url(#neonGlowFront)" : ""}
          style={{ transition: "all 0.3s" }}
        />
        <path d="M 90,62 C 93,80 95,98 92,120 C 89,98 87,80 86,70 Z"
          fill={isHighlighted(["arms"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["arms"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["arms"]) ? "url(#neonGlowFront)" : ""}
          style={{ transition: "all 0.3s" }}
        />

        {/* Core/Abs */}
        <path d="M 39,75 C 60,78 60,78 81,75 L 76,125 L 44,125 Z"
          fill={isHighlighted(["core"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["core"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["core"]) ? "url(#neonGlowFront)" : ""}
          style={{ transition: "all 0.3s" }}
        />

        {/* Legs (Quads) */}
        <path d="M 44,125 L 58,125 L 56,190 L 42,190 Z"
          fill={isHighlighted(["legs"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["legs"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["legs"]) ? "url(#neonGlowFront)" : ""}
          style={{ transition: "all 0.3s" }}
        />
        <path d="M 62,125 L 76,125 L 78,190 L 64,190 Z"
          fill={isHighlighted(["legs"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["legs"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["legs"]) ? "url(#neonGlowFront)" : ""}
          style={{ transition: "all 0.3s" }}
        />

        {/* Calves (Front) */}
        <rect x="44" y="195" width="10" height="30" rx="4" fill={inactiveColor} stroke={strokeColor} strokeWidth="1" />
        <rect x="66" y="195" width="10" height="30" rx="4" fill={inactiveColor} stroke={strokeColor} strokeWidth="1" />
      </svg>
    );
  } else {
    // Back view
    return (
      <svg viewBox="0 0 120 240" width="80" height="160" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
        <defs>
          <filter id="neonGlowBack" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Head */}
        <ellipse cx="60" cy="22" rx="14" ry="16" fill={inactiveColor} stroke={strokeColor} strokeWidth="1" />
        {/* Neck */}
        <rect x="55" y="38" width="10" height="8" rx="2" fill={inactiveColor} stroke={strokeColor} strokeWidth="1" />

        {/* Upper Back */}
        <path d="M 36,46 C 45,42 55,42 60,42 C 65,42 75,42 84,46 L 81,75 C 60,78 60,78 39,75 Z"
          fill={isHighlighted(["back"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["back"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["back"]) ? "url(#neonGlowBack)" : ""}
          style={{ transition: "all 0.3s" }}
        />

        {/* Shoulders */}
        <path d="M 36,46 C 28,48 26,56 30,62 C 32,58 35,50 36,46 Z"
          fill={isHighlighted(["shoulders"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["shoulders"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["shoulders"]) ? "url(#neonGlowBack)" : ""}
          style={{ transition: "all 0.3s" }}
        />
        <path d="M 84,46 C 92,48 94,56 90,62 C 88,58 85,50 84,46 Z"
          fill={isHighlighted(["shoulders"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["shoulders"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["shoulders"]) ? "url(#neonGlowBack)" : ""}
          style={{ transition: "all 0.3s" }}
        />

        {/* Lower Back */}
        <path d="M 39,75 C 60,78 60,78 81,75 L 76,125 L 44,125 Z"
          fill={isHighlighted(["back", "core"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["back", "core"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["back", "core"]) ? "url(#neonGlowBack)" : ""}
          style={{ transition: "all 0.3s" }}
        />

        {/* Hamstrings / Glutes */}
        <path d="M 44,125 L 58,125 L 56,190 L 42,190 Z"
          fill={isHighlighted(["legs"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["legs"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["legs"]) ? "url(#neonGlowBack)" : ""}
          style={{ transition: "all 0.3s" }}
        />
        <path d="M 62,125 L 76,125 L 78,190 L 64,190 Z"
          fill={isHighlighted(["legs"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["legs"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["legs"]) ? "url(#neonGlowBack)" : ""}
          style={{ transition: "all 0.3s" }}
        />

        {/* Calves */}
        <path d="M 44,195 L 54,195 L 52,225 L 44,225 Z"
          fill={isHighlighted(["legs"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["legs"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["legs"]) ? "url(#neonGlowBack)" : ""}
          style={{ transition: "all 0.3s" }}
        />
        <path d="M 66,195 L 76,195 L 76,225 L 68,225 Z"
          fill={isHighlighted(["legs"]) ? activeColor : inactiveColor}
          stroke={isHighlighted(["legs"]) ? activeColor : strokeColor}
          strokeWidth="1.2"
          filter={isHighlighted(["legs"]) ? "url(#neonGlowBack)" : ""}
          style={{ transition: "all 0.3s" }}
        />
      </svg>
    );
  }
};

// ─── Weekly Volume Bar Chart ─────────────────────────────────────────────────
const VolumeBarChart = ({ logs = [] }) => {
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const today = new Date().getDay(); // 0=Sun
  // Map JS day (0=Sun) to our index (0=Mon)
  const todayIdx = today === 0 ? 6 : today - 1;

  // Count completed exercises per day this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - todayIdx);

  const weekData = days.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const count = logs.filter((l) => l.date === dateStr && l.completed).length;
    return { day: days[i], count, isToday: i === todayIdx, dateStr };
  });

  const maxCount = Math.max(...weekData.map((d) => d.count), 1);
  const H = 80;
  const barW = 28;
  const gap = 10;
  const totalW = days.length * (barW + gap);

  return (
    <div>
      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Ejercicios completados esta semana
      </div>
      <svg viewBox={`0 0 ${totalW} ${H + 24}`} width="100%" style={{ overflow: "visible" }}>
        {weekData.map((d, i) => {
          const barH = (d.count / maxCount) * H;
          const x = i * (barW + gap);
          const y = H - barH;
          const isToday = d.isToday;
          return (
            <g key={i}>
              {/* Background bar */}
              <rect x={x} y={0} width={barW} height={H} rx="6"
                fill="var(--border-color)" />
              {/* Filled bar */}
              {d.count > 0 && (
                <rect x={x} y={y} width={barW} height={barH} rx="6"
                  fill={isToday ? "var(--primary)" : "rgba(0,128,128,0.45)"}
                  style={{ transition: "height 0.4s ease" }} />
              )}
              {/* Day label */}
              <text x={x + barW / 2} y={H + 16} textAnchor="middle"
                fontSize="11" fontWeight={isToday ? "700" : "500"}
                fill={isToday ? "var(--primary)" : "var(--text-muted)"}>
                {d.day}
              </text>
              {/* Count */}
              {d.count > 0 && (
                <text x={x + barW / 2} y={y - 4} textAnchor="middle"
                  fontSize="10" fill="var(--primary)" fontWeight="700">
                  {d.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Exercise Card ────────────────────────────────────────────────────────────
const ExerciseCard = ({ exercise, log, onToggle, onUpdateLog, isAdminMode }) => {
  const isCompleted = log?.completed || false;
  const [editing, setEditing] = useState(false);
  const [actualWeight, setActualWeight] = useState(log?.actualWeight || exercise.weight || "");

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "64px 1fr auto",
      gap: "12px",
      alignItems: "center",
      padding: "14px",
      borderRadius: "12px",
      background: isCompleted ? "rgba(0,128,128,0.06)" : "var(--bg-main)",
      border: `1px solid ${isCompleted ? "var(--primary)" : "var(--border-color)"}`,
      transition: "all 0.2s",
    }}>
      {/* Muscle silhouette */}
      <div style={{
        background: "var(--bg-card)", borderRadius: "10px", padding: "4px",
        border: "1px solid var(--border-color)"
      }}>
        <MuscleSilhouette highlight={exercise.muscleGroup} />
      </div>

      {/* Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{
          fontSize: "0.95rem", fontWeight: 700,
          color: isCompleted ? "var(--primary)" : "var(--text-main)",
          textDecoration: isCompleted ? "line-through" : "none"
        }}>
          {exercise.name}
        </span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {exercise.sets} series × {exercise.reps} reps
          {exercise.weight ? ` · ${exercise.weight} kg` : ""}
        </span>
        {!isAdminMode && editing ? (
          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
            <input
              type="number"
              value={actualWeight}
              onChange={(e) => setActualWeight(e.target.value)}
              placeholder="Peso real (kg)"
              style={{
                width: "100px", padding: "4px 8px", fontSize: "0.8rem",
                border: "1px solid var(--primary)", borderRadius: "6px",
                background: "white", color: "var(--text-main)"
              }}
            />
            <button
              onClick={() => { onUpdateLog(parseFloat(actualWeight)); setEditing(false); }}
              style={{
                padding: "4px 10px", fontSize: "0.75rem", border: "none",
                background: "var(--primary)", color: "white", borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              ✓
            </button>
          </div>
        ) : (
          log?.actualWeight && (
            <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600 }}>
              ✓ Real: {log.actualWeight} kg
            </span>
          )
        )}
      </div>

      {/* Toggle button */}
      {!isAdminMode && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
          <button
            onClick={onToggle}
            style={{
              width: "36px", height: "36px", borderRadius: "50%", border: "none",
              background: isCompleted ? "var(--primary)" : "var(--border-color)",
              color: isCompleted ? "white" : "var(--text-muted)",
              cursor: "pointer", fontSize: "1rem", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            {isCompleted ? "✓" : "○"}
          </button>
          {isCompleted && !editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                background: "none", border: "none", fontSize: "0.7rem",
                color: "var(--text-muted)", cursor: "pointer"
              }}
            >
              ✏️ Peso
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main TrainingPlanner Component ──────────────────────────────────────────
const TrainingPlanner = ({ patientId, isAdminMode = false }) => {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });
  const [exerciseLogs, setExerciseLogs] = useState([]); // all logs for this patient
  const [loading, setLoading] = useState(false);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);

  // Form states
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanGoal, setNewPlanGoal] = useState("hypertrophy");
  const [newExName, setNewExName] = useState("");
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState("8-12");
  const [newExWeight, setNewExWeight] = useState("");
  const [newExMuscle, setNewExMuscle] = useState("legs");

  const today = new Date().toISOString().split("T")[0];
  const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const MUSCLE_GROUPS = [
    { value: "legs", label: "🦵 Piernas" },
    { value: "chest", label: "💪 Pecho" },
    { value: "back", label: "🔙 Espalda" },
    { value: "shoulders", label: "🏋️ Hombros" },
    { value: "arms", label: "💪 Brazos" },
    { value: "core", label: "🔥 Core / Abdomen" },
    { value: "full_body", label: "⚡ Cuerpo Completo" },
    { value: "rest", label: "😴 Descanso" },
  ];
  const GOALS = [
    { value: "hypertrophy", label: "💪 Hipertrofia" },
    { value: "strength", label: "🏋️ Fuerza Máxima" },
    { value: "endurance", label: "🏃 Resistencia" },
    { value: "fat_loss", label: "🔥 Definición / Pérdida de Grasa" },
  ];

  useEffect(() => {
    fetchPlans();
    fetchLogs();
  }, [patientId]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/patients/${patientId}/training-plans`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
        const active = data.find((p) => p.isActive) || data[0];
        if (active) setActivePlan(active);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/exercise-logs`);
      if (res.ok) {
        const data = await res.json();
        setExerciseLogs(data);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/training-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlanName,
          goal: newPlanGoal,
          daysPerWeek: 4,
        }),
      });
      if (res.ok) {
        setNewPlanName("");
        setShowNewPlan(false);
        fetchPlans();
      }
    } catch (err) {
      console.error("Error creating plan:", err);
    }
  };

  const handleAddExercise = async () => {
    if (!newExName.trim() || !activePlan) return;
    const day = activePlan.days?.find((d) => d.dayIndex === selectedDayIdx);
    if (!day) {
      // Create the day first
      await fetch(`${API_BASE}/training-days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: activePlan.id,
          dayIndex: selectedDayIdx,
          name: DAY_NAMES[selectedDayIdx],
          muscleGroup: newExMuscle,
        }),
      });
      await fetchPlans();
    }

    const dayId = activePlan.days?.find((d) => d.dayIndex === selectedDayIdx)?.id;
    if (!dayId) return;

    try {
      const res = await fetch(`${API_BASE}/training-days/${dayId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newExName,
          sets: parseInt(newExSets),
          reps: newExReps,
          weight: newExWeight ? parseFloat(newExWeight) : null,
          muscleGroup: newExMuscle,
        }),
      });
      if (res.ok) {
        setNewExName("");
        setNewExSets(3);
        setNewExReps("8-12");
        setNewExWeight("");
        setShowAddExercise(false);
        fetchPlans();
      }
    } catch (err) {
      console.error("Error adding exercise:", err);
    }
  };

  const handleToggleExercise = async (exerciseId) => {
    const existingLog = exerciseLogs.find(
      (l) => l.exerciseId === exerciseId && l.date === today
    );
    try {
      if (existingLog) {
        await fetch(`${API_BASE}/exercise-logs/${existingLog.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !existingLog.completed }),
        });
      } else {
        await fetch(`${API_BASE}/exercise-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exerciseId, date: today, completed: true }),
        });
      }
      fetchLogs();
    } catch (err) {
      console.error("Error toggling log:", err);
    }
  };

  const handleUpdateLogWeight = async (exerciseId, weight) => {
    const existingLog = exerciseLogs.find(
      (l) => l.exerciseId === exerciseId && l.date === today
    );
    if (!existingLog) return;
    try {
      await fetch(`${API_BASE}/exercise-logs/${existingLog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualWeight: weight }),
      });
      fetchLogs();
    } catch (err) {
      console.error("Error updating weight:", err);
    }
  };

  const selectedDay = activePlan?.days?.find((d) => d.dayIndex === selectedDayIdx);
  const exercises = selectedDay?.exercises || [];
  const completedCount = exercises.filter((ex) => {
    const log = exerciseLogs.find((l) => l.exerciseId === ex.id && l.date === today);
    return log?.completed;
  }).length;
  const progressPct = exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0;

  const goalLabel = GOALS.find((g) => g.value === activePlan?.goal)?.label || activePlan?.goal;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="animate-fade-in">

      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h3 className="glow-text" style={{ fontSize: "1.4rem" }}>
            Plan de Entrenamiento
          </h3>
          {activePlan ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{activePlan.name}</span>
              <span style={{
                fontSize: "0.75rem", padding: "2px 10px", borderRadius: "20px",
                background: "var(--primary-glow)", color: "var(--primary)", fontWeight: 700
              }}>{goalLabel}</span>
            </div>
          ) : (
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              No hay plan activo — crea uno para comenzar
            </span>
          )}
        </div>

        {isAdminMode && (
          <div style={{ display: "flex", gap: "10px" }}>
            {plans.length > 1 && (
              <select
                className="form-select"
                value={activePlan?.id || ""}
                onChange={(e) => setActivePlan(plans.find((p) => p.id === parseInt(e.target.value)))}
                style={{ fontSize: "0.85rem", padding: "8px 12px" }}
              >
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <button
              className="btn btn-primary"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              onClick={() => setShowNewPlan(true)}
            >
              + Nuevo Plan
            </button>
          </div>
        )}
      </div>

      {/* ─── Create Plan Modal ───────────────────────────────── */}
      {showNewPlan && (
        <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h4 style={{ margin: 0, color: "var(--text-main)" }}>Crear Nuevo Plan</h4>
          <div className="grid-2-cols">
            <div className="form-group">
              <label className="form-label">Nombre del plan</label>
              <input className="form-input" value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="Ej: Mesociclo Hipertrofia 4x"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Objetivo</label>
              <select className="form-select" value={newPlanGoal}
                onChange={(e) => setNewPlanGoal(e.target.value)}>
                {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={() => setShowNewPlan(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCreatePlan}>Crear Plan</button>
          </div>
        </div>
      )}

      {activePlan && (
        <>
          {/* ─── Day Selector ────────────────────────────────── */}
          <div className="glass-card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", gap: "0", overflowX: "auto", scrollbarWidth: "none" }}>
              {DAY_NAMES.map((name, i) => {
                const day = activePlan.days?.find((d) => d.dayIndex === i);
                const isSelected = i === selectedDayIdx;
                const muscleColor = day ? MUSCLE_COLORS[day.muscleGroup] || "var(--primary)" : "transparent";
                const todayMark = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDayIdx(i)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: "4px", padding: "10px 14px", border: "none", cursor: "pointer",
                      background: isSelected ? "var(--primary-glow)" : "transparent",
                      borderBottom: isSelected ? `3px solid var(--primary)` : "3px solid transparent",
                      borderRadius: isSelected ? "10px 10px 0 0" : "10px",
                      transition: "all 0.15s", flexShrink: 0, minWidth: "52px"
                    }}
                  >
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: isSelected ? "var(--primary)" : "var(--text-muted)" }}>
                      {["L","M","X","J","V","S","D"][i]}
                    </span>
                    {day && day.muscleGroup !== "rest" ? (
                      <div style={{
                        width: "10px", height: "10px", borderRadius: "50%",
                        background: muscleColor
                      }} />
                    ) : (
                      <div style={{ width: "10px", height: "10px" }} />
                    )}
                    {todayMark && (
                      <span style={{ fontSize: "0.55rem", color: "var(--primary)", fontWeight: 800 }}>HOY</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                {selectedDay ? selectedDay.name : DAY_NAMES[selectedDayIdx]}
                {selectedDay?.muscleGroup && selectedDay.muscleGroup !== "rest" && (
                  <span style={{
                    marginLeft: "8px", fontSize: "0.75rem", padding: "2px 8px",
                    borderRadius: "10px", background: `${MUSCLE_COLORS[selectedDay.muscleGroup]}22`,
                    color: MUSCLE_COLORS[selectedDay.muscleGroup], fontWeight: 700
                  }}>
                    {MUSCLE_GROUPS.find((m) => m.value === selectedDay.muscleGroup)?.label}
                  </span>
                )}
              </span>
              {isAdminMode && (
                <button
                  className="btn btn-primary"
                  style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                  onClick={() => setShowAddExercise(true)}
                >
                  + Añadir Ejercicio
                </button>
              )}
            </div>
          </div>

          {/* ─── Add Exercise Form ─────────────────────────── */}
          {showAddExercise && isAdminMode && (
            <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h4 style={{ margin: 0 }}>Añadir Ejercicio — {DAY_NAMES[selectedDayIdx]}</h4>
              <div className="grid-2-cols">
                <div className="form-group">
                  <label className="form-label">Nombre del ejercicio</label>
                  <input className="form-input" value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    placeholder="Ej: Sentadilla libre" />
                </div>
                <div className="form-group">
                  <label className="form-label">Grupo muscular</label>
                  <select className="form-select" value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}>
                    {MUSCLE_GROUPS.filter(m => m.value !== "rest").map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Series</label>
                  <input type="number" className="form-input" value={newExSets}
                    onChange={(e) => setNewExSets(e.target.value)} min={1} max={10} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reps / Tiempo</label>
                  <input className="form-input" value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    placeholder="8-12 o 30s" />
                </div>
                <div className="form-group">
                  <label className="form-label">Peso inicial (kg) — opcional</label>
                  <input type="number" className="form-input" value={newExWeight}
                    onChange={(e) => setNewExWeight(e.target.value)}
                    placeholder="Ej: 60" step="2.5" />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setShowAddExercise(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleAddExercise}>Guardar Ejercicio</button>
              </div>
            </div>
          )}

          {/* ─── Progress Bar (Athlete View) ────────────────── */}
          {!isAdminMode && exercises.length > 0 && (
            <div className="glass-card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                  Progreso de hoy
                </span>
                <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.1rem" }}>
                  {completedCount}/{exercises.length} ({progressPct}%)
                </span>
              </div>
              <div style={{ height: "10px", background: "var(--border-color)", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${progressPct}%`,
                  background: "linear-gradient(90deg, var(--primary), var(--success))",
                  borderRadius: "5px", transition: "width 0.4s ease"
                }} />
              </div>
              {progressPct === 100 && (
                <div style={{ textAlign: "center", marginTop: "8px", color: "var(--success)", fontWeight: 700, fontSize: "0.9rem" }}>
                  🎉 ¡Entrenamiento completado! Excelente trabajo.
                </div>
              )}
            </div>
          )}

          {/* ─── Main Grid: Muscle Map & Exercises ────────────────── */}
          <div className="training-grid-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px" }}>
            
            {/* Left side: High-tech Muscle Map & Volume Progress */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
                <h4 className="glow-text" style={{ fontSize: "1.15rem", margin: 0, alignSelf: "flex-start" }}>
                  Mapa Muscular Activo
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "-8px", alignSelf: "flex-start" }}>
                  Músculos objetivo de la sesión seleccionada.
                </p>
                
                <div style={{ display: "flex", gap: "20px", justifyContent: "center", alignItems: "center", width: "100%", padding: "10px 0" }}>
                  {/* Front View */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>Vista Frontal</span>
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <MuscleSilhouette highlight={selectedDay?.muscleGroup} view="front" />
                    </div>
                  </div>
                  {/* Back View */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>Vista Posterior</span>
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <MuscleSilhouette highlight={selectedDay?.muscleGroup} view="back" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <VolumeBarChart logs={exerciseLogs} />
              </div>
            </div>

            {/* Right side: Exercises list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h4 className="glow-text" style={{ fontSize: "1.15rem", margin: "0 0 4px 0" }}>Ejercicios Programados</h4>
              
              {exercises.length === 0 ? (
                <div className="glass-card" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  <span style={{ fontSize: "2rem", display: "block", marginBottom: "12px" }}>🏋️</span>
                  {isAdminMode
                    ? "No hay ejercicios en este día. Usa el botón '+' para añadir."
                    : "No hay ejercicios programados para este día de entrenamiento."}
                </div>
              ) : (
                exercises.map((ex) => {
                  const log = exerciseLogs.find((l) => l.exerciseId === ex.id && l.date === today);
                  return (
                    <ExerciseCard
                      key={ex.id}
                      exercise={ex}
                      log={log}
                      isAdminMode={isAdminMode}
                      onToggle={() => handleToggleExercise(ex.id)}
                      onUpdateLog={(weight) => handleUpdateLogWeight(ex.id, weight)}
                    />
                  );
                })
              )}
            </div>

          </div>

          <style>{`
            @media (max-width: 768px) {
              .training-grid-layout {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </>
      )}

      {/* No plan state */}
      {!activePlan && !loading && (
        <div className="glass-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px" }}>🏋️</span>
          <h4 style={{ color: "var(--text-main)", marginBottom: "8px" }}>Sin Plan de Entrenamiento</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "340px", margin: "0 auto 20px" }}>
            {isAdminMode
              ? "Crea un plan de entrenamiento personalizado para este atleta con ejercicios, series y repeticiones."
              : "Tu entrenador todavía no ha configurado tu plan de entrenamiento. Consulta con él para comenzar."}
          </p>
          {isAdminMode && (
            <button className="btn btn-primary" onClick={() => setShowNewPlan(true)}>
              🏋️ Crear Plan de Entrenamiento
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainingPlanner;
