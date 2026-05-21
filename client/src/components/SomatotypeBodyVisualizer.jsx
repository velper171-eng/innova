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

  // Proportional body silhouette configurations (centered at X=80 on a 160 width canvas)
  const getSilhouettePaths = () => {
    switch (dominant) {
      case "ectomorph":
        return {
          head: { cx: 80, cy: 32, rx: 11, ry: 14 },
          bodyPath: "M 80,47 C 72,49 64,52 58,58 C 55,65 54,80 53,100 C 52,120 51,135 52,155 C 52,158 51,161 53,161 C 54,161 55,155 55,145 C 56,125 57,105 61,85 C 62,100 63,120 63,140 C 63,150 63,157 64,165 C 61,180 60,205 62,235 C 63,250 62,270 63,285 C 63,288 60,290 60,293 C 62,295 68,295 69,293 C 70,290 70,275 69,255 C 68,235 68,205 69,180 L 80,180 L 91,180 C 92,205 92,235 91,255 C 90,275 90,290 91,293 C 92,295 98,295 100,293 C 100,290 97,288 97,285 C 98,270 97,250 98,235 C 100,205 99,180 96,165 C 97,157 97,150 97,140 C 97,120 98,100 99,85 C 103,105 104,125 105,145 C 105,155 106,161 107,161 C 109,161 108,158 108,155 C 109,135 108,120 107,100 C 106,80 105,65 102,58 C 96,52 88,49 80,47 Z",
          glowColor: "rgba(0, 242, 254, 0.35)",
          strokeColor: "#00f2fe",
          gradientId: "ectoBodyGrad",
          accentZone: (
            <g stroke="#00f2fe" strokeWidth="0.8" opacity="0.45" strokeDasharray="3,3">
              <line x1="56" y1="90" x2="56" y2="150" />
              <line x1="104" y1="90" x2="104" y2="150" />
              <line x1="66" y1="190" x2="66" y2="275" />
              <line x1="94" y1="190" x2="94" y2="275" />
            </g>
          )
        };
      case "endomorph":
        return {
          head: { cx: 80, cy: 34, rx: 12, ry: 15 },
          bodyPath: "M 80,49 C 72,51 63,54 56,62 C 51,72 50,88 49,108 C 48,128 47,143 48,163 C 49,166 47,169 50,169 C 52,169 53,162 53,150 C 54,130 55,113 58,92 C 60,108 62,128 64,148 C 65,158 66,166 67,172 C 62,190 60,213 62,243 C 63,258 62,276 64,290 C 64,293 61,295 61,298 C 64,300 71,300 73,298 C 74,295 74,280 73,260 C 72,240 72,210 73,184 L 80,184 L 87,184 C 88,210 88,240 87,260 C 86,280 86,295 87,298 C 89,300 96,300 99,298 C 99,295 96,293 96,290 C 98,276 97,258 98,243 C 100,213 98,190 93,172 C 94,166 95,158 96,148 C 98,128 100,108 102,92 C 105,113 106,130 107,150 C 107,162 108,169 110,169 C 113,169 111,166 112,163 C 113,143 112,128 111,108 C 110,88 109,72 104,62 C 97,54 88,51 80,49 Z",
          glowColor: "rgba(244, 63, 94, 0.35)",
          strokeColor: "#f43f5e",
          gradientId: "endoBodyGrad",
          accentZone: (
            <g>
              <ellipse cx="80" cy="130" rx="16" ry="22" fill="url(#fatGlow)" opacity="0.6" />
              <circle cx="80" cy="130" r="10" fill="none" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.3" />
            </g>
          )
        };
      case "mesomorph":
      default:
        return {
          head: { cx: 80, cy: 30, rx: 12, ry: 15 },
          bodyPath: "M 80,45 C 68,46 56,49 48,57 C 43,67 42,83 41,105 C 40,125 39,140 40,160 C 41,163 39,166 42,166 C 44,166 45,159 45,147 C 46,125 48,105 53,83 C 54,100 56,120 56,140 C 56,151 56,159 57,167 C 53,185 51,210 54,240 C 55,255 54,273 56,287 C 56,290 53,292 53,295 C 56,297 64,297 66,295 C 67,292 67,277 66,257 C 65,237 65,207 66,181 L 80,181 L 94,181 C 95,207 95,237 94,257 C 93,277 93,292 94,295 C 96,297 104,297 107,295 C 107,292 104,290 104,287 C 106,273 105,255 106,240 C 109,210 107,185 103,167 C 104,159 104,151 104,140 C 104,120 106,100 107,83 C 112,105 114,125 115,147 C 115,159 116,166 118,166 C 121,166 119,163 120,160 C 121,140 120,125 119,105 C 118,83 117,67 112,57 C 104,49 92,46 80,45 Z",
          glowColor: "rgba(16, 185, 129, 0.35)",
          strokeColor: "#10b981",
          gradientId: "mesoBodyGrad",
          accentZone: (
            <g opacity="0.45" fill="none" stroke="#10b981" strokeWidth="1">
              <path d="M 66,80 C 71,82 78,82 80,82 C 82,82 89,82 94,80 C 91,91 80,94 80,94 C 80,94 69,91 66,80 Z" fill="url(#muscleGlow)" opacity="0.3" />
              <rect x="69" y="100" width="22" height="34" rx="4" />
              <line x1="80" y1="100" x2="80" y2="134" />
              <line x1="69" y1="108" x2="91" y2="108" />
              <line x1="69" y1="117" x2="91" y2="117" />
              <line x1="69" y1="126" x2="91" y2="126" />
            </g>
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
      case "ectomorph": return "Estructura ósea delgada, extremidades largas y dificultad natural para ganar peso y grasa. Metabolismo muy acelerado.";
      case "endomorph": return "Estructura ósea más ancha, facilidad para acumular grasa y masa muscular, ritmo metabólico más pausado y eficiente.";
      case "mesomorph": return "Estructura atlética innata, hombros anchos y cintura estrecha. Gran facilidad para desarrollar masa muscular y fuerza.";
      default: return "";
    }
  };

  // Mass calculations
  const fatMass = ((weight * bodyFat) / 100).toFixed(1);
  const muscleMass = (weight - fatMass - (weight * 0.15)).toFixed(1); // 15% estimated bone/residual mass

  // Prepare trend data for area chart
  const sortedEvalsForChart = [...evaluations]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-6);

  // Generate fallback data if user has 0 or 1 evaluation
  const chartEvals = sortedEvalsForChart.length >= 2
    ? sortedEvalsForChart
    : [
        { date: "1", weight: weight - 2.5, bodyFat: bodyFat + 1.2 },
        { date: "2", weight: weight - 1.0, bodyFat: bodyFat + 0.6 },
        { date: "3", weight: weight, bodyFat: bodyFat }
      ];

  const weights = chartEvals.map(e => e.weight);
  const minW = Math.min(...weights) - 3;
  const maxW = Math.max(...weights) + 3;
  const rangeW = maxW - minW || 1;

  // Layout bounds for chart (X: 15-145, Y: 110-260)
  const chartWidth = 160;
  const chartHeight = 320;
  const paddingX = 15;
  const startY = 110;
  const endY = 260;

  const coords = chartEvals.map((e, idx) => {
    const x = paddingX + (idx / (chartEvals.length - 1)) * (chartWidth - 2 * paddingX);
    const y = endY - ((e.weight - minW) / rangeW) * (endY - startY);
    return { x, y, weight: e.weight };
  });

  const areaPath = `M ${coords[0].x},${chartHeight} ` + 
    coords.map(c => `L ${c.x},${c.y}`).join(" ") + 
    ` L ${coords[coords.length - 1].x},${chartHeight} Z`;

  const linePath = "M " + coords.map(c => `${c.x},${c.y}`).join(" L ");

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 className="glow-text" style={{ fontSize: "1.25rem", margin: 0 }}>
            Visualización Dinámica de Somatotipo
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px", marginBottom: 0 }}>
            Representación tridimensional e histografía corporal calculada según tu antropometría.
          </p>
        </div>
        <span 
          style={{ 
            fontSize: "0.85rem", 
            padding: "4px 12px", 
            borderRadius: "20px", 
            background: `${silhouette.strokeColor}15`, 
            border: `1px solid ${silhouette.strokeColor}35`,
            color: silhouette.strokeColor,
            fontWeight: 700,
            textShadow: `0 0 5px ${silhouette.strokeColor}40`
          }}
        >
          {getSomatotypeLabel(dominant)}
        </span>
      </div>

      <div className="grid-1-1-cols" style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "24px", alignItems: "center" }}>
        
        {/* Left column: High-tech 3D Scanner SVG */}
        <div 
          style={{ 
            background: "radial-gradient(circle at center, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            minHeight: "340px",
            overflow: "hidden",
            boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.8)"
          }}
        >
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="320" style={{ filter: "drop-shadow(0px 0px 15px rgba(0, 0, 0, 0.7))" }}>
            <defs>
              {/* Holographic grid pattern */}
              <pattern id="scanGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" />
              </pattern>

              {/* Glowing Gradients */}
              <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={silhouette.strokeColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={silhouette.strokeColor} stopOpacity="0" />
              </radialGradient>
              
              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={silhouette.strokeColor} stopOpacity="0.12" />
                <stop offset="100%" stopColor={silhouette.strokeColor} stopOpacity="0.00" />
              </linearGradient>

              {/* Silhouette fill gradients */}
              <linearGradient id="ectoBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0, 242, 254, 0.22)" />
                <stop offset="100%" stopColor="rgba(0, 242, 254, 0.04)" />
              </linearGradient>
              <linearGradient id="mesoBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.22)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.04)" />
              </linearGradient>
              <linearGradient id="endoBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(244, 63, 94, 0.22)" />
                <stop offset="100%" stopColor="rgba(244, 63, 94, 0.04)" />
              </linearGradient>

              <radialGradient id="fatGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>
              
              <radialGradient id="muscleGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Grid Overlay */}
            <rect width="100%" height="100%" fill="url(#scanGrid)" />

            {/* Background Area Chart (Weight Trend) */}
            <path d={areaPath} fill="url(#chartAreaGrad)" />
            <path d={linePath} fill="none" stroke={silhouette.strokeColor} strokeWidth="1.2" opacity="0.35" strokeDasharray="3,3" />
            
            {/* Weight trend nodes */}
            {coords.map((c, i) => (
              <g key={i}>
                <circle cx={c.x} cy={c.y} r="2.5" fill={silhouette.strokeColor} opacity="0.75" />
                <text x={c.x} y={c.y - 8} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontWeight="600">
                  {c.weight.toFixed(0)}kg
                </text>
              </g>
            ))}

            {/* Silhouette Background Center Glow */}
            <circle cx="80" cy="150" r="75" fill="url(#bodyGlow)" />

            {/* Body Silhouette Outline & Shading */}
            <g stroke={silhouette.strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={`url(#${silhouette.gradientId})`}>
              {/* Head */}
              <ellipse 
                cx={silhouette.head.cx} 
                cy={silhouette.head.cy} 
                rx={silhouette.head.rx} 
                ry={silhouette.head.ry} 
                style={{ filter: `drop-shadow(0 0 3px ${silhouette.strokeColor}40)` }}
              />
              
              {/* Body Path (Torso, Shoulders, Limbs unified) */}
              <path 
                d={silhouette.bodyPath} 
                style={{ filter: `drop-shadow(0 0 5px ${silhouette.strokeColor}50)` }}
              />
            </g>

            {/* Active zone overlays (heatmap) */}
            {silhouette.accentZone}

            {/* Holographic Target Overlays */}
            <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" fill="none">
              <circle cx="80" cy="30" r="18" />
              <line x1="80" y1="8" x2="80" y2="52" strokeDasharray="2,2" />
              <line x1="58" y1="30" x2="102" y2="30" strokeDasharray="2,2" />
            </g>

            {/* Floor reflection grid */}
            <ellipse cx="80" cy="300" rx="42" ry="8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            <ellipse cx="80" cy="300" rx="24" ry="4.5" fill="none" stroke={silhouette.strokeColor} strokeOpacity="0.25" strokeWidth="0.8" />

            {/* Glowing Laser Scanner Line */}
            <line x1="15" y1="50" x2="145" y2="50" stroke={silhouette.strokeColor} strokeWidth="2" opacity="0.8" style={{ filter: `drop-shadow(0 0 4px ${silhouette.strokeColor})` }}>
              <animate 
                attributeName="y1" 
                values="40;290;40" 
                dur="4.5s" 
                repeatCount="indefinite" 
              />
              <animate 
                attributeName="y2" 
                values="40;290;40" 
                dur="4.5s" 
                repeatCount="indefinite" 
              />
              <animate 
                attributeName="opacity" 
                values="0.3;0.9;0.3" 
                dur="4.5s" 
                repeatCount="indefinite" 
              />
            </line>
          </svg>

          {/* Scanner details display */}
          <div style={{ position: "absolute", bottom: "12px", display: "flex", gap: "12px", fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            <span>SYS: ACTIVE</span>
            <span>|</span>
            <span>GRID: 16px</span>
            <span>|</span>
            <span>SCAN: OK</span>
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
            <div style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Endomorfia</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f43f5e", marginTop: "2px" }}>{endo.toFixed(1)}</div>
            </div>
            <div style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Mesomorfia</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981", marginTop: "2px" }}>{meso.toFixed(1)}</div>
            </div>
            <div style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Ectomorfia</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#00f2fe", marginTop: "2px" }}>{ecto.toFixed(1)}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SomatotypeBodyVisualizer;
