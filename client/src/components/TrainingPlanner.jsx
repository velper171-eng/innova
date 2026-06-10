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

const bodySilhouettePath = `
  M 250,64
  C 243,64 236,68 236,78
  C 236,88 234,88 234,92
  C 234,96 238,98 241,102
  C 241,108 236,114 228,122
  C 220,126 214,128 206,132
  C 198,136 198,146 200,160
  C 202,170 196,182 191,196
  C 186,210 180,228 177,246
  C 174,258 172,266 174,272
  C 176,276 182,274 184,268
  C 188,256 192,238 198,218
  C 202,204 204,196 206,188
  C 208,206 211,228 214,248
  C 217,262 216,274 218,284
  C 220,290 224,290 226,284
  C 228,274 228,260 228,248
  C 228,256 226,278 224,302
  C 220,332 216,364 218,394
  C 220,412 216,442 222,468
  C 224,474 220,480 220,483
  C 220,486 226,488 234,488
  C 242,488 244,484 244,476
  C 244,460 243,438 244,416
  C 245,394 246,370 248,348
  C 249,326 250,308 250,296
  C 250,308 251,326 252,348
  C 254,370 255,394 256,416
  C 256,438 256,460 256,476
  C 256,484 258,488 266,488
  C 274,488 280,486 280,483
  C 280,480 276,474 278,468
  C 284,412 280,442 282,394
  C 284,364 280,332 276,302
  C 274,278 272,256 272,248
  C 272,260 272,274 274,284
  C 276,290 280,290 282,284
  C 284,274 283,262 286,248
  C 289,228 292,206 294,188
  C 296,196 298,204 302,218
  C 308,238 312,256 316,268
  C 318,274 324,276 326,272
  C 328,266 326,258 323,246
  C 320,228 314,210 309,196
  C 304,182 298,170 300,160
  C 302,146 302,136 294,132
  C 286,128 280,126 272,122
  C 264,114 259,108 259,102
  C 262,98 266,96 266,92
  C 266,88 264,88 264,78
  C 264,68 257,64 250,64
  Z
`;

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
  
  const activeColor = "rgba(16, 185, 129, 0.75)"; // Glowing premium green semi-transparent
  const activeStroke = "#34d399";
  const inactiveColor = "transparent";
  const strokeColor = "transparent"; 

  const getStyleForMuscle = (muscles) => {
    const active = isHighlighted(muscles);
    return {
      fill: active ? activeColor : inactiveColor,
      stroke: active ? activeStroke : strokeColor,
      strokeWidth: active ? "1.5" : "0",
      filter: active ? "url(#neonGlowMuscle)" : "none",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      mixBlendMode: "overlay"
    };
  };

  const getBodyModelParams = (somatotype, viewMode) => {
    const suffix = viewMode === "back" ? "_back.png" : ".png";
    // We homogeneous the base layout dimensions for all somatotypes so the 
    // vector muscle paths align perfectly with the PNG image underneath.
    // The specific patient-level scaleX/scaleY handles horizontal morphing.
    if (somatotype === "ectomorph") {
      return {
        href: `/ectomorph_body${suffix}`,
        width: 202.3,
        x: 148.85,
        height: 424,
      };
    } else if (somatotype === "endomorph") {
      return {
        href: `/endomorph_body${suffix}`,
        width: 202.3,
        x: 148.85,
        height: 424,
      };
    } else {
      return {
        href: `/athletic_body${suffix}`,
        width: 202.3,
        x: 148.85,
        height: 424,
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
  const transformStr = `translate(250, 260) scale(${sX.toFixed(3)}, ${sY.toFixed(3)}) translate(-250, -260)`;

  return (
    <svg 
      viewBox="160 50 180 440" 
      style={{ 
        display: "block", 
        margin: "0 auto", 
        overflow: "visible", 
        width: "100%", 
        height: "auto", 
        maxWidth: "90px", 
        maxHeight: "180px" 
      }}
    >
      <defs>
        {/* Clip path utilizing the exact outer silhouette boundary of the body */}
        <clipPath id="bodyClip">
          <path d={bodySilhouettePath} />
        </clipPath>
        {/* Refined, tighter glow filter to conform nicely to muscle structures */}
        <filter id="neonGlowMuscle" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur1" />
          <feGaussianBlur stdDeviation="3" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <g transform={transformStr} style={{ transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        {/* High-fidelity 3D Body Model Image */}
        <image
          href={bodyModel.href}
          x={bodyModel.x}
          y="64"
          width={bodyModel.width}
          height={bodyModel.height}
          style={{
            opacity: 0.95,
            transition: "all 0.3s ease"
          }}
        />
        
        {/* Clipped group to ensure no green highlight overflows the silhouette boundary */}
        <g clipPath="url(#bodyClip)">
          {view === "front" ? (
            <>
              {/* Head & Neck (transparent) */}
              <path d="M 250,64 C 243,64 236,68 236,78 C 236,88 234,88 234,92 C 234,96 238,98 241,102 C 245,98 249,98 250,98 C 251,98 255,98 259,102 C 262,98 266,96 266,92 C 266,88 264,88 264,78 C 264,68 257,64 250,64 Z" fill="transparent" stroke="transparent" strokeWidth="0" />
              <path d="M 241,102 C 241,108 236,114 228,122 L 235,122 C 242,116 247,112 250,112 C 253,112 258,116 265,122 L 272,122 C 264,114 259,108 259,102 Z" fill="transparent" stroke="transparent" strokeWidth="0" />

              {/* Chest (Pectorals separated left & right) */}
              <path 
                d="M 250,125 C 242,125 233,127 229,134 C 227,142 227,154 229,163 C 235,166 244,166 250,165 Z M 250,125 C 258,125 267,127 271,134 C 273,142 273,154 271,163 C 265,166 256,166 250,165 Z" 
                style={getStyleForMuscle(["chest", "pecho"])} 
              />

              {/* Shoulders (Deltoids tailored to upper arm insertion) */}
              <path 
                d="M 228,122 C 220,126 212,128 206,132 C 198,136 198,146 200,160 C 204,163 210,158 214,150 C 218,142 222,132 228,122 Z M 272,122 C 280,126 288,128 294,132 C 302,136 302,146 300,160 C 296,163 290,158 286,150 C 282,142 278,132 272,122 Z" 
                style={getStyleForMuscle(["shoulders", "hombros"])} 
              />

              {/* Arms (Biceps & Forearms separated and contoured) */}
              <path 
                d="M 200,160 C 202,170 196,182 191,196 C 196,196 204,192 208,188 C 210,182 214,170 214,160 Z M 191,196 C 186,210 180,228 177,246 C 182,246 190,234 198,218 C 202,204 204,196 206,188 Z M 300,160 C 298,170 304,182 309,196 C 304,196 296,192 292,188 C 290,182 286,170 286,160 Z M 309,196 C 314,210 320,228 323,246 C 318,246 310,234 302,218 C 298,204 296,196 294,188 Z" 
                style={getStyleForMuscle(["arms", "biceps", "bíceps"])} 
              />

              {/* Core (Anatomically detailed abs pack and independent obliques) */}
              <path 
                d="M 234,172 H 248 V 190 H 234 Z M 234,194 H 248 V 210 H 234 Z M 234,214 H 248 V 230 H 234 Z M 235,234 H 248 V 246 H 235 Z M 252,172 H 266 V 190 H 252 Z M 252,194 H 266 V 210 H 252 Z M 252,214 H 266 V 230 H 252 Z M 252,234 H 265 V 246 H 252 Z M 229,165 C 229,180 228,210 230,246 C 233,246 234,246 234,246 C 232,210 231,180 231,165 Z M 271,165 C 271,180 272,210 270,246 C 267,246 266,246 266,246 C 268,210 269,180 269,165 Z" 
                style={getStyleForMuscle(["core", "abs", "abdomen"])} 
              />

              {/* Legs (Quads separated left & right with groin creases) */}
              <path 
                d="M 228,248 C 226,278 224,302 218,394 C 224,396 242,396 248,394 C 250,370 250,308 250,296 C 250,275 238,255 228,248 Z M 272,248 C 274,278 276,302 282,394 C 276,396 258,396 252,394 C 250,370 250,308 250,296 C 250,275 262,255 272,248 Z" 
                style={getStyleForMuscle(["legs", "quads", "cuádriceps"])} 
              />

              {/* Legs (Calves/Shins Front separated correctly below the knee) */}
              <path 
                d="M 218,394 C 220,412 216,442 222,468 C 224,474 220,480 220,483 C 220,486 226,488 234,488 C 242,488 244,484 244,476 C 244,460 243,438 244,416 C 245,406 247,398 248,394 C 240,392 226,392 218,394 Z M 282,394 C 280,412 284,442 278,468 C 276,474 280,480 280,483 C 280,486 274,488 266,488 C 258,488 256,484 256,476 C 256,460 257,438 256,416 C 255,406 253,398 252,394 C 260,392 274,392 282,394 Z" 
                style={getStyleForMuscle(["legs", "calves", "gemelos", "pantorrillas"])} 
              />
            </>
          ) : (
            <>
              {/* Head & Neck (transparent) */}
              <path d="M 250,64 C 243,64 236,68 236,78 C 236,88 234,88 234,92 C 234,96 238,98 241,102 C 245,98 249,98 250,98 C 251,98 255,98 259,102 C 262,98 266,96 266,92 C 266,88 264,88 264,78 C 264,68 257,64 250,64 Z" fill="transparent" stroke="transparent" strokeWidth="0" />
              <path d="M 241,102 C 241,108 236,114 228,122 L 235,122 C 242,116 247,112 250,112 C 253,112 258,116 265,122 L 272,122 C 264,114 259,108 259,102 Z" fill="transparent" stroke="transparent" strokeWidth="0" />

              {/* Upper Back (Traps & Lats separated left & right) */}
              <path 
                d="M 250,122 C 240,122 232,126 228,122 C 224,142 222,154 222,165 C 230,170 240,173 250,174 Z M 250,122 C 260,122 268,126 272,122 C 276,142 278,154 278,165 C 270,170 260,173 250,174 Z" 
                style={getStyleForMuscle(["back", "espalda", "lats", "dorsales", "traps", "trapecios"])} 
              />

              {/* Lower Back (Left & Right lower back with spine division) */}
              <path 
                d="M 222,165 C 230,170 240,173 250,174 L 250,248 C 242,248 234,249 228,248 C 226,220 224,190 222,165 Z M 278,165 C 270,170 260,173 250,174 L 250,248 C 258,248 266,249 272,248 C 274,220 276,190 278,165 Z" 
                style={getStyleForMuscle(["back", "espalda", "lower_back", "lumbares"])} 
              />

              {/* Shoulders (Posterior) */}
              <path 
                d="M 228,122 C 220,126 212,128 206,132 C 198,136 198,146 200,160 C 204,163 210,158 214,150 C 218,142 222,132 228,122 Z M 272,122 C 280,126 288,128 294,132 C 302,136 302,146 300,160 C 296,163 290,158 286,150 C 282,142 278,132 272,122 Z" 
                style={getStyleForMuscle(["shoulders", "hombros"])} 
              />

              {/* Arms (Posterior/Triceps & Forearms) */}
              <path 
                d="M 200,160 C 202,170 196,182 191,196 C 196,196 204,192 208,188 C 210,182 214,170 214,160 Z M 191,196 C 186,210 180,228 177,246 C 182,246 190,234 198,218 C 202,204 204,196 206,188 Z M 300,160 C 298,170 304,182 309,196 C 304,196 296,192 292,188 C 290,182 286,170 286,160 Z M 309,196 C 314,210 320,228 323,246 C 318,246 310,234 302,218 C 298,204 296,196 294,188 Z" 
                style={getStyleForMuscle(["arms", "triceps", "tríceps"])} 
              />

              {/* Glutes (Separated left & right cheeks with bottom and top curves) */}
              <path 
                d="M 228,248 C 228,260 226,278 224,296 C 232,298 242,298 248,296 C 249,280 249,260 250,248 C 242,248 234,248 228,248 Z M 272,248 C 272,260 274,278 276,296 C 268,298 258,298 252,296 C 251,280 251,260 250,248 C 258,248 266,248 272,248 Z" 
                style={getStyleForMuscle(["legs", "glutes", "glúteos"])} 
              />

              {/* Hamstrings (Hamstrings separated left & right with crease curves) */}
              <path 
                d="M 224,296 C 220,332 216,364 218,394 C 224,396 242,396 248,394 C 250,370 250,308 250,296 C 242,298 232,298 224,296 Z M 276,296 C 280,332 284,364 282,394 C 276,396 258,396 252,394 C 250,370 250,308 250,296 C 258,298 268,298 276,296 Z" 
                style={getStyleForMuscle(["legs", "hamstrings", "isquiotibiales", "femoral"])} 
              />

              {/* Calves (Pantorrillas Posterior separated) */}
              <path 
                d="M 218,394 C 220,412 216,442 222,468 C 224,474 220,480 220,483 C 220,486 226,488 234,488 C 242,488 244,484 244,476 C 244,460 243,438 244,416 C 245,406 247,398 248,394 C 240,392 226,392 218,394 Z M 282,394 C 280,412 284,442 278,468 C 276,474 280,480 280,483 C 280,486 274,488 266,488 C 258,488 256,484 256,476 C 256,460 257,438 256,416 C 255,406 253,398 252,394 C 260,392 274,392 282,394 Z" 
                style={getStyleForMuscle(["legs", "calves", "gemelos", "pantorrillas"])} 
              />
            </>
          )}
        </g>
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
