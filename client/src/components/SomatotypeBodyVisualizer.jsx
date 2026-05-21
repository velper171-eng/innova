import React from "react";

const SomatotypeBodyVisualizer = ({ evaluations = [] }) => {
  // Sort evaluations chronologically to get the latest
  const sortedEvals = [...evaluations].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const latestEval = sortedEvals[sortedEvals.length - 1] || null;

  // Determine somatotype profile
  let endo = 3.0;
  let meso = 4.0;
  let ecto = 3.0;
  let bodyFat = 15.0;
  let weight = 70.0;
  let height = 175.0;
  let category = "Mesomorfo Balanceado";

  if (latestEval) {
    // Check if endomorphy etc are directly available, otherwise default
    endo = latestEval.endomorphy || latestEval.endo || 3.0;
    meso = latestEval.mesomorphy || latestEval.meso || 4.0;
    ecto = latestEval.ectomorphy || latestEval.ecto || 3.0;
    bodyFat = latestEval.bodyFat || 15.0;
    weight = latestEval.weight || 70.0;
    height = latestEval.height || 175.0;
    category = latestEval.category || "Mesomorfo Balanceado";
  }

  // Find dominant somatotype
  let dominant = "mesomorph"; // Default
  if (endo > meso && endo > ecto) {
    dominant = "endomorph";
  } else if (ecto > endo && ecto > meso) {
    dominant = "ectomorph";
  } else if (meso > endo && meso > ecto) {
    dominant = "mesomorph";
  }

  // Define SVG Paths based on Somatotype (Ecto: slender/tall, Meso: muscular/V-shape, Endo: rounder/robust)
  // We represent the torso, limbs, and highlights
  const getSilhouettePaths = () => {
    switch (dominant) {
      case "ectomorph":
        return {
          // Torso (narrow)
          torso: "M 48,60 C 48,80 50,110 52,140 L 68,140 C 70,110 72,80 72,60 Z",
          // Shoulders (narrow)
          shoulders: "M 40,60 C 45,55 52,50 60,50 C 68,50 75,55 80,60 C 74,65 67,65 60,65 C 53,65 46,65 40,60 Z",
          // Arms (slender)
          leftArm: "M 40,60 C 37,85 36,105 38,130 C 36,105 35,85 40,60 Z",
          rightArm: "M 80,60 C 83,85 84,105 82,130 C 84,105 85,85 80,60 Z",
          // Legs (thin)
          leftLeg: "M 52,140 C 50,170 48,200 49,230 L 57,230 C 58,200 58,170 57,140 Z",
          rightLeg: "M 68,140 C 70,170 72,200 71,230 L 63,230 C 62,200 62,170 63,140 Z",
          glowColor: "rgba(0, 242, 254, 0.4)",
          strokeColor: "#00f2fe",
          accentZone: null
        };
      case "endomorph":
        return {
          // Torso (wider waist & belly)
          torso: "M 42,60 C 40,85 36,115 44,140 L 76,140 C 84,115 80,85 78,60 Z",
          // Shoulders (softer, rounder)
          shoulders: "M 36,60 C 42,54 50,48 60,48 C 70,48 78,54 84,60 C 77,65 68,66 60,66 C 52,66 43,65 36,60 Z",
          // Arms (fuller)
          leftArm: "M 36,60 C 32,85 30,105 32,130 C 29,105 31,85 36,60 Z",
          rightArm: "M 84,60 C 88,85 90,105 88,130 C 91,105 89,85 84,60 Z",
          // Legs (stouter)
          leftLeg: "M 44,140 C 42,170 38,200 39,230 L 55,230 C 56,200 58,170 56,140 Z",
          rightLeg: "M 76,140 C 78,170 82,200 81,230 L 65,230 C 64,200 62,170 64,140 Z",
          glowColor: "rgba(244, 63, 94, 0.4)",
          strokeColor: "#f43f5e",
          // Highlights fat accumulation zones
          accentZone: (
            <ellipse cx="60" cy="110" rx="16" ry="20" fill="url(#fatGlow)" />
          )
        };
      case "mesomorph":
      default:
        return {
          // Torso (V-shape, defined waist)
          torso: "M 44,60 C 47,85 50,110 48,140 L 72,140 C 70,110 73,85 76,60 Z",
          // Shoulders (broad)
          shoulders: "M 34,60 C 42,52 50,45 60,45 C 70,45 78,52 86,60 C 77,63 68,64 60,64 C 52,64 43,63 34,60 Z",
          // Arms (muscular/biceps outline)
          leftArm: "M 34,60 C 28,82 27,102 30,130 C 26,102 28,82 34,60 Z",
          rightArm: "M 86,60 C 92,82 93,102 90,130 C 94,102 92,82 86,60 Z",
          // Legs (muscular thighs)
          leftLeg: "M 48,140 C 45,170 42,200 43,230 L 57,230 C 58,200 60,170 58,140 Z",
          rightLeg: "M 72,140 C 75,170 78,200 77,230 L 63,230 C 62,200 60,170 62,140 Z",
          glowColor: "rgba(16, 185, 129, 0.4)",
          strokeColor: "#10b981",
          // Highlight chest and shoulders
          accentZone: (
            <>
              <path d="M 45,67 C 52,68 59,68 60,68 C 61,68 68,68 75,67 C 72,78 60,82 60,82 C 60,82 48,78 45,67 Z" fill="url(#muscleGlow)" opacity="0.6" />
              <path d="M 49,85 L 57,85 L 56,120 L 49,120 Z" fill="url(#muscleGlow)" opacity="0.4" />
              <path d="M 63,85 L 71,85 L 71,120 L 63,120 Z" fill="url(#muscleGlow)" opacity="0.4" />
            </>
          )
        };
    }
  };

  const silhouette = getSilhouettePaths();

  // Helper to get somatotype friendly name
  const getSomatotypeLabel = (type) => {
    switch (type) {
      case "ectomorph": return "Ectomorfo ⚡";
      case "endomorph": return "Endomorfo 🥑";
      case "mesomorph": return "Mesomorfo 🔥";
      default: return "Mesomorfo 🔥";
    }
  };

  const getSomatotypeDesc = (type) => {
    switch (type) {
      case "ectomorph": return "Estructura ósea delgada, extremidades largas y dificultad para ganar peso/grasa. Metabolismo acelerado.";
      case "endomorph": return "Estructura ósea más ancha, facilidad para ganar grasa y masa muscular, ritmo metabólico más pausado.";
      case "mesomorph": return "Estructura atlética nativa, hombros anchos y cintura estrecha. Facilidad para desarrollar masa muscular.";
      default: return "";
    }
  };

  // Mass calculations
  const fatMass = ((weight * bodyFat) / 100).toFixed(1);
  const muscleMass = (weight - fatMass - (weight * 0.15)).toFixed(1); // 15% estimated bone/residual mass

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 className="glow-text" style={{ fontSize: "1.25rem", margin: 0 }}>
            Visualización Dinámica de Somatotipo
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px", marginBottom: 0 }}>
            Representación 3D e histografía corporal calculada según tu antropometría.
          </p>
        </div>
        <span 
          style={{ 
            fontSize: "0.85rem", 
            padding: "4px 10px", 
            borderRadius: "20px", 
            background: `${silhouette.strokeColor}20`, 
            border: `1px solid ${silhouette.strokeColor}40`,
            color: silhouette.strokeColor,
            fontWeight: 700
          }}
        >
          {getSomatotypeLabel(dominant)}
        </span>
      </div>

      <div className="grid-1-1-cols" style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "24px", alignItems: "center" }}>
        
        {/* Left column: SVG Human Shape */}
        <div 
          style={{ 
            background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.3) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "16px",
            padding: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            minHeight: "270px"
          }}
        >
          <svg viewBox="0 0 120 250" width="100%" height="250" style={{ filter: "drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.5))" }}>
            <defs>
              {/* Glowing Gradients */}
              <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={silhouette.strokeColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={silhouette.strokeColor} stopOpacity="0" />
              </radialGradient>
              <radialGradient id="fatGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="muscleGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background Glow */}
            <circle cx="60" cy="120" r="70" fill="url(#bodyGlow)" />

            {/* Silhouette Group with Neon Glow */}
            <g stroke={silhouette.strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
              
              {/* Head */}
              <ellipse cx="60" cy="28" rx="13" ry="16" fill="rgba(255,255,255,0.02)" />
              
              {/* Neck */}
              <path d="M 54,44 L 54,49 M 66,44 L 66,49" />
              
              {/* Shoulders */}
              <path d={silhouette.shoulders} fill="rgba(255,255,255,0.02)" />
              
              {/* Torso */}
              <path d={silhouette.torso} fill="rgba(255,255,255,0.01)" />
              
              {/* Arms */}
              <path d={silhouette.leftArm} />
              <path d={silhouette.rightArm} />
              
              {/* Legs */}
              <path d={silhouette.leftLeg} />
              <path d={silhouette.rightLeg} />
            </g>

            {/* Heatmap / Zone overlays */}
            {silhouette.accentZone}

            {/* Floor reflection grid */}
            <ellipse cx="60" cy="235" rx="35" ry="6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
            <ellipse cx="60" cy="235" rx="20" ry="3.5" fill="none" stroke={silhouette.strokeColor} strokeOpacity="0.3" strokeWidth="0.8" />
          </svg>

          {/* Indicator text */}
          <div style={{ position: "absolute", bottom: "10px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Contorno Corporal Dinámico
          </div>
        </div>

        {/* Right column: Details and Metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-main)", fontWeight: 600 }}>
              Perfil Somático: {category}
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px", lineHeight: "1.4" }}>
              {getSomatotypeDesc(dominant)}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
            {/* Weight */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-muted)" }}>Peso Corporal</span>
                <span style={{ color: "var(--text-main)", fontWeight: 700 }}>{weight} kg</span>
              </div>
              <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (weight / 130) * 100)}%`, background: "var(--primary)" }} />
              </div>
            </div>

            {/* Body Fat */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-muted)" }}>Porcentaje de Grasa</span>
                <span style={{ color: "#f43f5e", fontWeight: 700 }}>{bodyFat}% ({fatMass} kg)</span>
              </div>
              <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (bodyFat / 40) * 100)}%`, background: "#f43f5e" }} />
              </div>
            </div>

            {/* Muscle Mass */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-muted)" }}>Masa Muscular Estimada</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>{muscleMass} kg</span>
              </div>
              <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (muscleMass / 80) * 100)}%`, background: "#10b981" }} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <div style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Endomorfia</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f43f5e" }}>{endo.toFixed(1)}</div>
            </div>
            <div style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Mesomorfia</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981" }}>{meso.toFixed(1)}</div>
            </div>
            <div style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ectomorfia</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#00f2fe" }}>{ecto.toFixed(1)}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SomatotypeBodyVisualizer;
