import React, { useState, useEffect } from "react";
import { bodyPathsFront, bodyPathsBack } from "./bodyPaths";

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



// Helper function to map exercise names to exact muscle groups
const getExactMuscles = (exerciseName, primaryGroup) => {
  const name = (exerciseName || "").toLowerCase();
  const primary = (primaryGroup || "").toLowerCase();
  const muscles = new Set();

  if (primary) {
    if (primary.includes(",")) {
      primary.split(",").forEach(m => muscles.add(m.trim()));
    } else {
      muscles.add(primary);
    }
  }

  // Keywords mapping for exact muscle mapping
  if (name.includes("jalón") || name.includes("lat pulldown") || name.includes("dominadas") || name.includes("pull-up") || name.includes("chin-up") || name.includes("pull over") || name.includes("pullover")) {
    muscles.add("back");
    muscles.add("lats");
    muscles.add("dorsales");
    if (!name.includes("over") && !name.includes("pecho")) {
      muscles.add("arms");
      muscles.add("biceps");
      muscles.add("bíceps");
    }
  }
  if (name.includes("remo") || name.includes("row")) {
    muscles.add("back");
    muscles.add("lats");
    muscles.add("dorsales");
    muscles.add("traps");
    muscles.add("trapecios");
  }
  if (name.includes("peso muerto") || name.includes("deadlift")) {
    muscles.add("back");
    muscles.add("lower_back");
    muscles.add("lumbares");
    muscles.add("legs");
    muscles.add("glutes");
    muscles.add("glúteos");
    muscles.add("hamstrings");
    muscles.add("isquiotibiales");
  }
  if (name.includes("hiperextensiones") || name.includes("back extension") || name.includes("lumbares")) {
    muscles.add("back");
    muscles.add("lower_back");
    muscles.add("lumbares");
    muscles.add("glutes");
    muscles.add("glúteos");
  }
  if (name.includes("press de banca") || name.includes("bench press") || name.includes("press plano") || name.includes("press inclinado") || name.includes("press declinado") || name.includes("flexiones") || name.includes("push-up") || name.includes("fondos") || name.includes("chest dip") || name.includes("aperturas") || name.includes("fly") || name.includes("pec dec") || name.includes("cruces")) {
    muscles.add("chest");
    muscles.add("pecho");
    if (!name.includes("aperturas") && !name.includes("fly") && !name.includes("cruces") && !name.includes("pec dec")) {
      muscles.add("shoulders");
      muscles.add("hombros");
      muscles.add("arms");
      muscles.add("triceps");
      muscles.add("tríceps");
    }
  }
  if (name.includes("press militar") || name.includes("overhead press") || name.includes("shoulder press") || name.includes("press de hombros") || name.includes("lateral") || name.includes("elevaciones laterales") || name.includes("pájaro") || name.includes("rear delt") || name.includes("face-pull") || name.includes("face pull") || name.includes("deltoides")) {
    muscles.add("shoulders");
    muscles.add("hombros");
    if (name.includes("militar") || name.includes("shoulder press") || name.includes("press")) {
      muscles.add("triceps");
      muscles.add("tríceps");
    }
    if (name.includes("pájaro") || name.includes("rear delt") || name.includes("face")) {
      muscles.add("back");
      muscles.add("traps");
      muscles.add("trapecios");
    }
  }
  if (name.includes("encogimientos") || name.includes("shrugs")) {
    muscles.add("back");
    muscles.add("traps");
    muscles.add("trapecios");
  }
  if (name.includes("curl") || name.includes("biceps") || name.includes("bíceps") || name.includes("predicador") || name.includes("preacher")) {
    muscles.add("arms");
    muscles.add("biceps");
    muscles.add("bíceps");
  }
  if (name.includes("tríceps") || name.includes("triceps") || name.includes("copa") || name.includes("rompecráneos") || name.includes("skullcrusher") || name.includes("pushdown") || name.includes("patada")) {
    if (!name.includes("glúteo") && !name.includes("pierna")) {
      muscles.add("arms");
      muscles.add("triceps");
      muscles.add("tríceps");
    }
  }
  if (name.includes("sentadilla") || name.includes("squat") || name.includes("prensa") || name.includes("leg press") || name.includes("extensiones de cuádriceps") || name.includes("leg extension") || name.includes("zancadas") || name.includes("lunges") || name.includes("bulgaras") || name.includes("búlgaras")) {
    muscles.add("legs");
    muscles.add("quads");
    muscles.add("cuádriceps");
    muscles.add("glutes");
    muscles.add("glúteos");
  }
  if (name.includes("hip thrust") || name.includes("puente de glúteo") || name.includes("glute bridge") || name.includes("patada de glúteo") || name.includes("patada de polea")) {
    muscles.add("legs");
    muscles.add("glutes");
    muscles.add("glúteos");
    if (name.includes("thrust") || name.includes("puente")) {
      muscles.add("hamstrings");
      muscles.add("isquiotibiales");
      muscles.add("femoral");
    }
  }
  if (name.includes("peso muerto rumano") || name.includes("romanian deadlift") || name.includes("curl de piernas") || name.includes("leg curl") || name.includes("isquios") || name.includes("femoral")) {
    muscles.add("legs");
    muscles.add("hamstrings");
    muscles.add("isquiotibiales");
    muscles.add("femoral");
    muscles.add("glutes");
    muscles.add("glúteos");
  }
  if (name.includes("gemelos") || name.includes("pantorrillas") || name.includes("calf") || name.includes("talones")) {
    muscles.add("legs");
    muscles.add("calves");
    muscles.add("gemelos");
    muscles.add("pantorrillas");
  }
  if (name.includes("plancha") || name.includes("plank") || name.includes("crunch") || name.includes("abdominales") || name.includes("elevación de piernas") || name.includes("leg raise") || name.includes("oblicuos") || name.includes("rueda") || name.includes("ab wheel")) {
    muscles.add("core");
    muscles.add("abs");
    muscles.add("abdomen");
  }
  if (name.includes("hiit") || name.includes("burpees") || name.includes("swings") || name.includes("farmer") || name.includes("granero")) {
    muscles.add("full_body");
  }

  return Array.from(muscles);
};

const MuscleSilhouette = ({ highlight = "legs", exerciseName = "", view = "front", somatotypeData, dominantSomatotype = "mesomorph" }) => {
  const mappedMuscles = getExactMuscles(exerciseName, highlight);

  const isHighlighted = (muscles) => {
    if (!highlight) return false;
    
    const mappedLower = mappedMuscles.map(m => m.toLowerCase());
    
    if (mappedLower.includes("full_body") || mappedLower.includes("cuerpo completo")) return true;
    
    return muscles.some(m => 
      mappedLower.some(mapped => mapped.includes(m.toLowerCase()) || m.toLowerCase().includes(mapped))
    );
  };
  
  const getBodyModelParams = (somatotype, viewMode) => {
    const suffix = viewMode === "back" ? "_back.png" : ".png";
    if (somatotype === "ectomorph") {
      return {
        href: `/ectomorph_body${suffix}`,
        width: 304,
        height: 637,
      };
    } else if (somatotype === "endomorph") {
      return {
        href: `/endomorph_body${suffix}`,
        width: 304,
        height: 637,
      };
    } else {
      return {
        href: `/athletic_body${suffix}`,
        width: 304,
        height: 637,
      };
    }
  };

  const data = somatotypeData || {
    dominant: dominantSomatotype,
    scaleX: 1.0,
    scaleY: 1.0
  };
  
  const { dominant, scaleX, scaleY } = data;
  const bodyModel = getBodyModelParams(dominant, view);
  
  const sX = typeof scaleX === "number" ? scaleX : 1.0;
  const sY = typeof scaleY === "number" ? scaleY : 1.0;
  const transformStr = `translate(152, 318.5) scale(${sX.toFixed(3)}, ${sY.toFixed(3)}) translate(-152, -318.5)`;

  return (
    <svg 
      viewBox="0 0 304 637" 
      style={{ 
        display: "block", 
        margin: "0 auto", 
        overflow: "visible", 
        width: "100%", 
        height: "auto", 
        maxWidth: "110px", 
        maxHeight: "230px" 
      }}
    >
      <defs>
        {/* Clip path utilizing the exact outer silhouette boundary of the body */}
        <clipPath id="bodyClip">
          <path d={bodyPathsFront[0]?.d || ""} />
        </clipPath>
        
        {/* Front clip paths for each specific muscle group in 304 x 637 space */}
        <clipPath id="chestClip">
          <path d="M 152 115 L 120 122 C 115 140, 115 155, 118 162 L 152 166 L 186 162 C 189 155, 189 140, 184 122 Z" />
        </clipPath>
        <clipPath id="shouldersClip">
          <path d="M 120 122 L 95 128 C 90 140, 90 155, 93 162 L 118 162 Z M 184 122 L 209 128 C 214 140, 214 155, 211 162 L 186 162 Z" />
        </clipPath>
        <clipPath id="armsClip">
          <path d="M 93 162 L 75 195 L 60 245 L 45 295 L 65 295 L 90 235 L 116 162 Z M 211 162 L 229 195 L 244 245 L 259 295 L 239 295 L 214 235 L 188 162 Z" />
        </clipPath>
        <clipPath id="coreClip">
          <path d="M 118 162 L 152 166 L 186 162 L 188 220 C 188 245, 186 258, 186 260 L 152 260 L 118 260 C 118 258, 116 245, 116 220 Z" />
        </clipPath>
        <clipPath id="legsQuadsClip">
          <path d="M 118 260 L 152 260 L 186 260 L 194 320 C 198 370, 202 400, 202 410 L 152 410 L 102 410 C 102 400, 106 370, 110 320 Z" />
        </clipPath>
        <clipPath id="legsCalvesClip">
          <path d="M 102 410 L 152 410 L 202 410 L 210 500 L 216 600 L 152 630 L 88 600 L 94 500 Z" />
        </clipPath>
        
        {/* Posterior clip paths in 304 x 637 space */}
        <clipPath id="backUpperClip">
          <path d="M 152 110 L 120 122 L 110 165 L 152 175 L 194 165 L 184 122 Z" />
        </clipPath>
        <clipPath id="backLowerClip">
          <path d="M 110 165 L 152 175 L 194 165 L 194 248 L 152 248 L 110 248 Z" />
        </clipPath>
        <clipPath id="shouldersClipBack">
          <path d="M 120 122 L 95 128 L 90 165 L 110 165 Z M 184 122 L 209 128 C 214 140, 214 155, 211 162 L 186 162 Z" />
        </clipPath>
        <clipPath id="armsClipBack">
          <path d="M 90 165 L 75 200 L 60 250 L 50 300 L 70 300 L 95 240 L 110 165 Z M 214 165 L 229 200 L 244 250 L 254 300 L 234 300 L 209 240 L 194 165 Z" />
        </clipPath>
        <clipPath id="backGlutesClip">
          <path d="M 110 248 L 152 248 L 194 248 L 200 296 L 152 305 L 104 296 Z" />
        </clipPath>
        <clipPath id="backHamstringsClip">
          <path d="M 104 296 L 152 305 L 200 296 L 204 410 L 152 410 L 100 410 Z" />
        </clipPath>
        <clipPath id="legsCalvesClipBack">
          <path d="M 100 410 L 152 410 L 204 410 L 212 500 L 216 600 L 152 630 L 86 600 L 92 500 Z" />
        </clipPath>
      </defs>
      
      <g transform={transformStr} style={{ transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        {/* Layer 1: High-fidelity 3D Body Model PNG */}
        <image
          href={bodyModel.href}
          x="0"
          y="0"
          width="304"
          height="637"
          style={{
            opacity: 0.95,
            transition: "all 0.3s ease"
          }}
        />
        
        {/* Layer 2: Clipped soft green fills inside active muscles */}
        <g clipPath="url(#bodyClip)">
          {view === "front" ? (
            <>
              {isHighlighted(["chest", "pecho"]) && (
                <path d="M 152 115 L 120 122 C 115 140, 115 155, 118 162 L 152 166 L 186 162 C 189 155, 189 140, 184 122 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["shoulders", "hombros"]) && (
                <path d="M 120 122 L 95 128 C 90 140, 90 155, 93 162 L 118 162 Z M 184 122 L 209 128 C 214 140, 214 155, 211 162 L 186 162 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["arms", "biceps", "bíceps"]) && (
                <path d="M 93 162 L 75 195 L 60 245 L 45 295 L 65 295 L 90 235 L 116 162 Z M 211 162 L 229 195 L 244 245 L 259 295 L 239 295 L 214 235 L 188 162 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["core", "abs", "abdomen"]) && (
                <path d="M 118 162 L 152 166 L 186 162 L 188 220 C 188 245, 186 258, 186 260 L 152 260 L 118 260 C 118 258, 116 245, 116 220 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["legs", "quads", "cuádriceps"]) && (
                <path d="M 118 260 L 152 260 L 186 260 L 194 320 C 198 370, 202 400, 202 410 L 152 410 L 102 410 C 102 400, 106 370, 110 320 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["legs", "calves", "gemelos", "pantorrillas"]) && (
                <path d="M 102 410 L 152 410 L 202 410 L 210 500 L 216 600 L 152 630 L 88 600 L 94 500 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
            </>
          ) : (
            <>
              {isHighlighted(["back", "espalda", "lats", "dorsales", "traps", "trapecios"]) && (
                <path d="M 152 110 L 120 122 L 110 165 L 152 175 L 194 165 L 184 122 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["back", "espalda", "lower_back", "lumbares"]) && (
                <path d="M 110 165 L 152 175 L 194 165 L 194 248 L 152 248 L 110 248 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["shoulders", "hombros"]) && (
                <path d="M 120 122 L 95 128 L 90 165 L 110 165 Z M 184 122 L 209 128 C 214 140, 214 155, 211 162 L 186 162 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["arms", "triceps", "tríceps"]) && (
                <path d="M 90 165 L 75 200 L 60 250 L 50 300 L 70 300 L 95 240 L 110 165 Z M 214 165 L 229 200 L 244 250 L 254 300 L 234 300 L 209 240 L 194 165 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["legs", "glutes", "glúteos"]) && (
                <path d="M 110 248 L 152 248 L 194 248 L 200 296 L 152 305 L 104 296 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["legs", "hamstrings", "isquiotibiales", "femoral"]) && (
                <path d="M 104 296 L 152 305 L 200 296 L 204 410 L 152 410 L 100 410 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
              {isHighlighted(["legs", "calves", "gemelos", "pantorrillas"]) && (
                <path d="M 100 410 L 152 410 L 204 410 L 212 500 L 216 600 L 152 630 L 86 600 L 92 500 Z" fill="rgba(16, 185, 129, 0.2)" />
              )}
            </>
          )}
        </g>

        {/* Layer 3: High-fidelity base SVG drawing lines */}
        <g style={{ opacity: 0.85, transition: "all 0.3s ease", pointerEvents: "none" }}>
          {(view === "front" ? bodyPathsFront : bodyPathsBack).map(p => (
            <path
              key={p.id}
              d={p.d}
              fill="#1f2937"
            />
          ))}
        </g>

        {/* Layer 4: Green glowing lines specifically for the active muscle groups using clipping masks */}
        {view === "front" ? (
          <>
            {isHighlighted(["chest", "pecho"]) && (
              <g clipPath="url(#chestClip)">
                {bodyPathsFront.map(p => (
                  <path key={`${p.id}_active_chest`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["shoulders", "hombros"]) && (
              <g clipPath="url(#shouldersClip)">
                {bodyPathsFront.map(p => (
                  <path key={`${p.id}_active_shoulders`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["arms", "biceps", "bíceps"]) && (
              <g clipPath="url(#armsClip)">
                {bodyPathsFront.map(p => (
                  <path key={`${p.id}_active_arms`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["core", "abs", "abdomen"]) && (
              <g clipPath="url(#coreClip)">
                {bodyPathsFront.map(p => (
                  <path key={`${p.id}_active_core`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["legs", "quads", "cuádriceps"]) && (
              <g clipPath="url(#legsQuadsClip)">
                {bodyPathsFront.map(p => (
                  <path key={`${p.id}_active_quads`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["legs", "calves", "gemelos", "pantorrillas"]) && (
              <g clipPath="url(#legsCalvesClip)">
                {bodyPathsFront.map(p => (
                  <path key={`${p.id}_active_calves`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
          </>
        ) : (
          <>
            {isHighlighted(["back", "espalda", "lats", "dorsales", "traps", "trapecios"]) && (
              <g clipPath="url(#backUpperClip)">
                {bodyPathsBack.map(p => (
                  <path key={`${p.id}_active_back_upper`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["back", "espalda", "lower_back", "lumbares"]) && (
              <g clipPath="url(#backLowerClip)">
                {bodyPathsBack.map(p => (
                  <path key={`${p.id}_active_back_lower`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["shoulders", "hombros"]) && (
              <g clipPath="url(#shouldersClipBack)">
                {bodyPathsBack.map(p => (
                  <path key={`${p.id}_active_shoulders_back`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["arms", "triceps", "tríceps"]) && (
              <g clipPath="url(#armsClipBack)">
                {bodyPathsBack.map(p => (
                  <path key={`${p.id}_active_arms_back`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["legs", "glutes", "glúteos"]) && (
              <g clipPath="url(#backGlutesClip)">
                {bodyPathsBack.map(p => (
                  <path key={`${p.id}_active_glutes`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["legs", "hamstrings", "isquiotibiales", "femoral"]) && (
              <g clipPath="url(#backHamstringsClip)">
                {bodyPathsBack.map(p => (
                  <path key={`${p.id}_active_hamstrings`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
            {isHighlighted(["legs", "calves", "gemelos", "pantorrillas"]) && (
              <g clipPath="url(#legsCalvesClipBack)">
                {bodyPathsBack.map(p => (
                  <path key={`${p.id}_active_calves_back`} d={p.d} fill="#10b981" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
                ))}
              </g>
            )}
          </>
        )}
      </g>
    </svg>
  );
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
const ExerciseCard = ({ exercise, log, onToggle, onUpdateLog, onDelete, isAdminMode, somatotypeData, onMouseEnter, onMouseLeave, onSwapSuccess, onUpdateLogSets }) => {
  const isCompleted = log?.completed || false;
  const [editing, setEditing] = useState(false);
  const [actualWeight, setActualWeight] = useState(log?.actualWeight || exercise.weight || "");
  const [showAlts, setShowAlts] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [savingSets, setSavingSets] = useState(false);

  // Parse existing sets from log if present
  const getInitialSets = () => {
    if (log?.actualReps) {
      try {
        const parsed = JSON.parse(log.actualReps);
        if (Array.isArray(parsed)) {
          const result = [...parsed];
          while (result.length < (exercise.sets || 3)) {
            result.push({ weight: exercise.weight || "", reps: "" });
          }
          return result;
        }
      } catch (e) {
        // Not a JSON array
      }
    }
    return Array.from({ length: exercise.sets || 3 }, () => ({
      weight: exercise.weight || "",
      reps: ""
    }));
  };

  const [setsData, setSetsData] = useState(getInitialSets);

  useEffect(() => {
    setSetsData(getInitialSets());
  }, [log?.actualReps, exercise.sets]);

  const handleSaveSets = async () => {
    if (!onUpdateLogSets) return;
    try {
      setSavingSets(true);
      await onUpdateLogSets(exercise.id, setsData);
    } catch (e) {
      console.error("Error saving sets:", e);
    } finally {
      setSavingSets(false);
    }
  };

  let alternativesList = [];
  if (exercise.alternatives) {
    try {
      alternativesList = typeof exercise.alternatives === "string" 
        ? JSON.parse(exercise.alternatives) 
        : exercise.alternatives;
    } catch (e) {
      console.error("Error parsing alternatives:", e);
    }
  }

  const handleSwap = async (altName, altVideoUrl) => {
    try {
      setSwapping(true);
      const res = await fetch(`${API_BASE}/training-exercises/${exercise.id}/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alternativeName: altName,
          alternativeVideoUrl: altVideoUrl
        })
      });
      if (res.ok) {
        if (onSwapSuccess) onSwapSuccess();
        setShowAlts(false);
      } else {
        alert("Error al intercambiar el ejercicio");
      }
    } catch (e) {
      console.error("Error swapping:", e);
      alert("Error de conexión");
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "14px",
        borderRadius: "12px",
        background: isCompleted ? "rgba(0,128,128,0.06)" : "var(--bg-main)",
        border: `1px solid ${isCompleted ? "var(--primary)" : "var(--border-color)"}`,
        transition: "all 0.2s",
      }}
    >
      {/* Main card row */}
      <div style={{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: "12px", alignItems: "center" }}>
        {/* Muscle silhouette */}
        <div style={{
          background: "var(--bg-card)", borderRadius: "10px", padding: "4px",
          border: "1px solid var(--border-color)"
        }}>
          <MuscleSilhouette highlight={exercise.muscleGroup} exerciseName={exercise.name} somatotypeData={somatotypeData} />
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {exercise.videoUrl ? (
              <a 
                href={exercise.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.95rem", fontWeight: 700,
                  color: isCompleted ? "var(--primary)" : "var(--text-main)",
                  textDecoration: "underline",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {exercise.name} <span style={{ fontSize: "0.75rem" }}>🎬</span>
              </a>
            ) : (
              <span style={{
                fontSize: "0.95rem", fontWeight: 700,
                color: isCompleted ? "var(--primary)" : "var(--text-main)",
                textDecoration: isCompleted ? "line-through" : "none"
              }}>
                {exercise.name}
              </span>
            )}
            
            {/* Show alternatives button if any exist */}
            {alternativesList.length > 0 && (
              <button
                onClick={() => setShowAlts(!showAlts)}
                style={{
                  background: "rgba(0,128,128,0.08)",
                  border: "1px solid rgba(0,128,128,0.2)",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  fontSize: "0.7rem",
                  color: "var(--primary)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px",
                  marginLeft: "4px",
                  fontWeight: 600,
                  transition: "all 0.2s"
                }}
              >
                🔄 Alternativas
              </button>
            )}
          </div>

          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {exercise.sets} series × {exercise.reps} reps
            {exercise.weight ? ` · ${exercise.weight} kg` : ""}
          </span>
          
          {/* Metadatos: chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
            {exercise.rest && (
              <span style={{
                fontSize: "0.75rem", background: "rgba(0,128,128,0.08)", color: "var(--primary)",
                padding: "2px 8px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "2px"
              }}>
                ⏱️ {exercise.rest}
              </span>
            )}
            {exercise.rir && (
              <span style={{
                fontSize: "0.75rem", background: "rgba(255,165,0,0.1)", color: "orange",
                padding: "2px 8px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "2px"
              }}>
                🔥 RIR {exercise.rir}
              </span>
            )}
            {exercise.technique && (
              <span style={{
                fontSize: "0.75rem", background: "rgba(128,0,128,0.08)", color: "purple",
                padding: "2px 8px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "2px"
              }}>
                ⚙️ {exercise.technique}
              </span>
            )}
            {exercise.notes && (
              <span style={{
                fontSize: "0.75rem", background: "rgba(0,0,255,0.05)", color: "#4f46e5",
                padding: "2px 8px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "2px",
                maxWidth: "240px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"
              }} title={exercise.notes}>
                📝 {exercise.notes}
              </span>
            )}
          </div>

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
              <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600, display: "block", marginTop: "2px" }}>
                ✓ Real: {log.actualWeight} kg
              </span>
            )
          )}

          {(() => {
            let loggedSets = [];
            if (log?.actualReps) {
              try {
                const parsed = JSON.parse(log.actualReps);
                if (Array.isArray(parsed)) {
                  loggedSets = parsed.filter(s => s.weight !== "" || s.reps !== "");
                }
              } catch (e) {}
            }
            if (loggedSets.length === 0) return null;
            return (
              <div style={{ 
                marginTop: "6px", 
                padding: "8px 10px", 
                background: "rgba(0,128,128,0.04)", 
                border: "1px solid rgba(0,128,128,0.15)",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)" }}>
                  🏋️ {isAdminMode ? "Series registradas del atleta:" : "Mis series registradas:"}
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {loggedSets.map((s, idx) => (
                    <span key={idx} style={{ 
                      fontSize: "0.7rem", 
                      color: "var(--text-main)",
                      background: "var(--bg-main)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                      fontWeight: 500
                    }}>
                      S{idx + 1}: <strong>{s.weight || 0} kg</strong> × {s.reps || 0} reps
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Action / Delete / Toggle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
          {isAdminMode ? (
            <button
              onClick={onDelete}
              style={{
                background: "rgba(244, 63, 94, 0.08)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                color: "#f43f5e",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                transition: "all 0.2s"
              }}
              title="Eliminar ejercicio"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(244, 63, 94, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(244, 63, 94, 0.08)";
              }}
            >
              🗑️
            </button>
          ) : (
            <>
              <button
                onClick={onToggle}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "none",
                  background: isCompleted ? "var(--primary)" : "var(--border-color)",
                  color: isCompleted ? "white" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {isCompleted ? "✓" : "○"}
              </button>
              {isCompleted && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    cursor: "pointer"
                  }}
                >
                  ✏️ Peso
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Registrar Series Section */}
      {!isAdminMode && (
        <div style={{
          marginTop: "4px",
          padding: "12px",
          background: "var(--bg-card)",
          borderRadius: "8px",
          border: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
              📊 Registrar Cargas y Reps por Serie
            </span>
            {isCompleted && (
              <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600 }}>
                ✓ Guardado
              </span>
            )}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {setsData.map((setData, index) => (
              <div 
                key={index} 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "60px 1fr 1fr", 
                  alignItems: "center", 
                  gap: "10px" 
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Serie {index + 1}
                </span>
                
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <input
                    type="number"
                    step="any"
                    value={setData.weight}
                    onChange={(e) => {
                      const updated = [...setsData];
                      updated[index].weight = e.target.value;
                      setSetsData(updated);
                    }}
                    placeholder="Peso"
                    style={{
                      width: "100%",
                      padding: "4px 8px",
                      fontSize: "0.8rem",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      background: "white",
                      color: "var(--text-main)"
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>kg</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <input
                    type="number"
                    value={setData.reps}
                    onChange={(e) => {
                      const updated = [...setsData];
                      updated[index].reps = e.target.value;
                      setSetsData(updated);
                    }}
                    placeholder="Reps"
                    style={{
                      width: "100%",
                      padding: "4px 8px",
                      fontSize: "0.8rem",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      background: "white",
                      color: "var(--text-main)"
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>reps</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveSets}
            disabled={savingSets}
            style={{
              marginTop: "4px",
              padding: "6px 12px",
              fontSize: "0.8rem",
              fontWeight: 600,
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {savingSets ? "Guardando..." : "Guardar Series"}
          </button>
        </div>
      )}

      {/* Alternatives panel */}
      {showAlts && (
        <div style={{
          marginTop: "6px",
          padding: "10px",
          background: "var(--bg-card)",
          border: "1px dashed var(--border-color)",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>
            Reemplazar por una alternativa:
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {alternativesList.map((alt, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "6px 8px",
                  background: "var(--bg-main)",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 500 }}>
                    {alt.name}
                  </span>
                  {alt.videoUrl && (
                    <a 
                      href={alt.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.75rem", textDecoration: "underline", color: "var(--primary)" }}
                    >
                      🎬 Video
                    </a>
                  )}
                </div>
                <button
                  disabled={swapping}
                  onClick={() => handleSwap(alt.name, alt.videoUrl)}
                  style={{
                    padding: "3px 8px",
                    fontSize: "0.75rem",
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  {swapping ? "Intercambiando..." : "Seleccionar"}
                </button>
              </div>
            ))}
          </div>
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
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [planError, setPlanError] = useState("");
  const [newPlanDays, setNewPlanDays] = useState(4);
  const [hoveredExercise, setHoveredExercise] = useState(null);

  const [somatotypeData, setSomatotypeData] = useState({
    dominant: "mesomorph",
    scaleX: 1.0,
    scaleY: 1.0,
  });

  const fetchPatientSomatotype = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.evaluations && data.evaluations.length > 0) {
          const sortedEvals = [...data.evaluations].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          const latestEval = sortedEvals[sortedEvals.length - 1];
          const endo = latestEval.endomorphy || latestEval.endo || 3.0;
          const meso = latestEval.mesomorphy || latestEval.meso || 4.0;
          const ecto = latestEval.ectomorphy || latestEval.ecto || 3.0;
          
          let dominant = "mesomorph";
          if (endo > meso && endo > ecto) {
            dominant = "endomorph";
          } else if (ecto > endo && ecto > meso) {
            dominant = "ectomorph";
          } else {
            dominant = "mesomorph";
          }

          // Morph scale factor dynamically depending on endo, meso, and ecto coordinates
          const dEndo = endo - 3.0;
          const dMeso = meso - 4.0;
          const dEcto = ecto - 3.0;

          // scaleX: endomorphy increases width, ectomorphy decreases it, mesomorphy increases it moderately
          let scaleX = 1.0 + (dEndo * 0.06) + (dMeso * 0.02) - (dEcto * 0.06);
          // scaleY: ectomorphy increases height/linearity, endomorphy decreases it slightly
          let scaleY = 1.0 + (dEcto * 0.015) - (dEndo * 0.01);

          // Keep scaling within realistic, aesthetic bounds
          scaleX = Math.max(0.78, Math.min(1.22, scaleX));
          scaleY = Math.max(0.94, Math.min(1.06, scaleY));

          setSomatotypeData({ dominant, scaleX, scaleY });
        }
      }
    } catch (err) {
      console.error("Error fetching patient somatotype:", err);
    }
  };

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
    fetchPatientSomatotype();
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
    if (!newPlanName.trim()) {
      setPlanError("Por favor ingresa un nombre para el plan");
      return;
    }
    try {
      setCreatingPlan(true);
      setPlanError("");
      const res = await fetch(`${API_BASE}/patients/${patientId}/training-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlanName,
          goal: newPlanGoal,
          daysPerWeek: newPlanDays,
        }),
      });
      if (res.ok) {
        setNewPlanName("");
        setShowNewPlan(false);
        fetchPlans();
      } else {
        const errorData = await res.json();
        setPlanError(errorData.error || "Error al crear el plan");
      }
    } catch (err) {
      console.error("Error creating plan:", err);
      setPlanError("Error de conexión al servidor");
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleAddExercise = async () => {
    if (!newExName.trim() || !activePlan) return;
    
    let dayId = activePlan.days?.find((d) => d.dayIndex === selectedDayIdx)?.id;
    
    if (!dayId) {
      try {
        const dayRes = await fetch(`${API_BASE}/training-days`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: activePlan.id,
            dayIndex: selectedDayIdx,
            name: DAY_NAMES[selectedDayIdx],
            muscleGroup: newExMuscle,
          }),
        });
        if (dayRes.ok) {
          const createdDay = await dayRes.json();
          dayId = createdDay.id;
        } else {
          console.error("Error creating training day on backend");
          return;
        }
      } catch (err) {
        console.error("Error creating training day:", err);
        return;
      }
    }

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

  const handleUpdateLogSets = async (exerciseId, setsData) => {
    const existingLog = exerciseLogs.find(
      (l) => l.exerciseId === exerciseId && l.date === today
    );
    try {
      const actualRepsStr = JSON.stringify(setsData);
      const firstWeight = setsData.find(s => s.weight !== "")?.weight;
      const actualWeightVal = firstWeight ? parseFloat(firstWeight) : null;

      if (existingLog) {
        await fetch(`${API_BASE}/exercise-logs/${existingLog.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actualReps: actualRepsStr,
            actualWeight: actualWeightVal,
            completed: true
          }),
        });
      } else {
        await fetch(`${API_BASE}/exercise-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId,
            date: today,
            completed: true,
            actualReps: actualRepsStr,
            actualWeight: actualWeightVal
          }),
        });
      }
      fetchLogs();
    } catch (err) {
      console.error("Error updating sets log:", err);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este ejercicio de la rutina?")) return;
    try {
      const res = await fetch(`${API_BASE}/training-exercises/${exerciseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPlans();
      } else {
        console.error("Error deleting exercise from server");
      }
    } catch (err) {
      console.error("Error deleting exercise:", err);
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
            <div className="form-group">
              <label className="form-label">Días por semana</label>
              <select className="form-select" value={newPlanDays}
                onChange={(e) => setNewPlanDays(parseInt(e.target.value))}>
                <option value={3}>3 días / semana</option>
                <option value={4}>4 días / semana</option>
                <option value={5}>5 días / semana</option>
                <option value={6}>6 días / semana (PPL Completo)</option>
              </select>
            </div>
          </div>
          {planError && (
            <div style={{ color: "#f43f5e", fontSize: "0.85rem", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "8px", padding: "8px 12px" }}>
              ⚠️ {planError}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={() => setShowNewPlan(false)} disabled={creatingPlan}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCreatePlan} disabled={creatingPlan}>
              {creatingPlan ? "⏳ Generando plan..." : "Crear Plan con IA"}
            </button>
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
                    <div style={{
                      background: "linear-gradient(180deg, #e7f1f3 0%, #edf4f5 100%)",
                      border: "1px solid #b8cdd2",
                      padding: "12px",
                      borderRadius: "16px",
                      boxShadow: "0 4px 12px rgba(35, 127, 148, 0.05)",
                    }}>
                      <MuscleSilhouette highlight={hoveredExercise ? hoveredExercise.muscleGroup : selectedDay?.muscleGroup} exerciseName={hoveredExercise ? hoveredExercise.name : ""} view="front" somatotypeData={somatotypeData} />
                    </div>
                  </div>
                  {/* Back View */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>Vista Posterior</span>
                    <div style={{
                      background: "linear-gradient(180deg, #e7f1f3 0%, #edf4f5 100%)",
                      border: "1px solid #b8cdd2",
                      padding: "12px",
                      borderRadius: "16px",
                      boxShadow: "0 4px 12px rgba(35, 127, 148, 0.05)",
                    }}>
                      <MuscleSilhouette highlight={hoveredExercise ? hoveredExercise.muscleGroup : selectedDay?.muscleGroup} exerciseName={hoveredExercise ? hoveredExercise.name : ""} view="back" somatotypeData={somatotypeData} />
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
                      somatotypeData={somatotypeData}
                      onToggle={() => handleToggleExercise(ex.id)}
                      onUpdateLog={(weight) => handleUpdateLogWeight(ex.id, weight)}
                      onDelete={() => handleDeleteExercise(ex.id)}
                      onMouseEnter={() => setHoveredExercise(ex)}
                      onMouseLeave={() => setHoveredExercise(null)}
                      onSwapSuccess={fetchPlans}
                      onUpdateLogSets={handleUpdateLogSets}
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
