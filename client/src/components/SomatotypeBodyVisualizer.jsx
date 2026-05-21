import React, { useState } from "react";

const SomatotypeBodyVisualizer = ({ evaluations = [], activeTab = "anthropometry", setActiveTab }) => {
  const [activeMetric, setActiveMetric] = useState("weight"); // "weight" or "fat"

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

  // Morph scale factor depending on dominant somatotype
  // Center is X=250, Y=260. Formula: translate(250, 260) scale(Sx, Sy) translate(-250, -260)
  let transformStr = "";
  if (dominant === "ectomorph") {
    transformStr = "translate(250, 260) scale(0.82, 1.04) translate(-250, -260)";
  } else if (dominant === "endomorph") {
    transformStr = "translate(250, 260) scale(1.18, 0.95) translate(-250, -260)";
  } else {
    transformStr = "translate(250, 260) scale(1.0, 1.0) translate(-250, -260)";
  }

  // Prepare trend data for 6 points
  const getChartData = () => {
    if (sortedEvals.length === 0) {
      // Return beautiful mockup data representing progress
      return [
        { date: "Ene", weight: 92, bodyFat: 28 },
        { date: "Feb", weight: 88, bodyFat: 26 },
        { date: "Mar", weight: 85, bodyFat: 23 },
        { date: "Abr", weight: 81, bodyFat: 21 },
        { date: "May", weight: 76, bodyFat: 18 },
        { date: "Jun", weight: 70, bodyFat: 15 },
      ];
    }

    const formattedList = sortedEvals.map((ev, idx) => ({
      date: ev.date 
        ? new Date(ev.date).toLocaleDateString("es-ES", { month: "short" }) 
        : `Eval ${idx + 1}`,
      weight: ev.weight || 70.0,
      bodyFat: ev.bodyFat || ev.bf || 15.0,
    }));

    if (formattedList.length >= 6) {
      return formattedList.slice(-6);
    }

    // Extrapolate backwards from the first element if < 6
    const first = formattedList[0];
    const needed = 6 - formattedList.length;
    const extrapolated = [];

    for (let i = 0; i < needed; i++) {
      const step = needed - i;
      extrapolated.push({
        date: `Hist ${i + 1}`,
        weight: Math.round((first.weight + step * 2.5) * 10) / 10,
        bodyFat: Math.round((first.bodyFat + step * 1.5) * 10) / 10,
      });
    }

    return [...extrapolated, ...formattedList];
  };

  const chartData = getChartData();

  // Layout boundaries for chart in SVG (viewBox 0 0 500 500)
  // X: 60 to 440 (width 380px)
  // Y: 100 to 420 (height 320px)
  const chartXStart = 60;
  const chartXEnd = 440;
  const chartYStart = 100;
  const chartYEnd = 420;
  const chartWidth = chartXEnd - chartXStart; // 380
  const chartHeight = chartYEnd - chartYStart; // 320

  // Calculate coordinates for SVG paths
  const weightCoords = chartData.map((d, i) => {
    const x = chartXStart + (i / 5) * chartWidth;
    // Scale Weight: 0 to 200 kg
    const y = chartYEnd - (d.weight / 200) * chartHeight;
    return { x, y, value: d.weight };
  });

  const fatCoords = chartData.map((d, i) => {
    const x = chartXStart + (i / 5) * chartWidth;
    // Scale Body Fat: 0 to 60 %
    const y = chartYEnd - (d.bodyFat / 60) * chartHeight;
    return { x, y, value: d.bodyFat };
  });

  // SVG Area Paths
  const weightAreaPath =
    `M ${weightCoords[0].x},${chartYEnd} ` +
    weightCoords.map((c) => `L ${c.x},${c.y}`).join(" ") +
    ` L ${weightCoords[weightCoords.length - 1].x},${chartYEnd} Z`;

  const weightLinePath =
    "M " + weightCoords.map((c) => `${c.x},${c.y}`).join(" L ");

  const fatAreaPath =
    `M ${fatCoords[0].x},${chartYEnd} ` +
    fatCoords.map((c) => `L ${c.x},${c.y}`).join(" ") +
    ` L ${fatCoords[fatCoords.length - 1].x},${chartYEnd} Z`;

  const fatLinePath =
    "M " + fatCoords.map((c) => `${c.x},${c.y}`).join(" L ");

  // Muscular Body Silhouette path
  const bodySilhouettePath = `
    M 250,94 
    C 244,94 238,102 238,110 
    C 238,122 228,128 218,132 
    C 204,138 194,152 188,172 
    C 182,192 176,218 170,248 
    C 167,262 164,272 161,280 
    C 159,285 156,289 158,292 
    C 160,295 166,294 170,290 
    C 176,284 180,270 182,254 
    C 185,234 189,204 196,184 
    C 198,178 201,182 201,188 
    C 203,202 204,226 201,248 
    C 198,266 194,281 190,294 
    C 187,300 185,304 187,307 
    C 189,309 193,304 196,298 
    C 201,288 206,274 210,258 
    C 218,224 224,186 228,158 
    C 228,156 229,156 229,158 
    C 230,181 232,211 228,238 
    C 225,256 220,271 218,286 
    C 215,298 215,310 220,310 
    C 224,310 226,302 228,292 
    C 232,278 236,258 238,238 
    C 240,256 240,278 238,301 
    C 235,331 231,354 234,384 
    C 236,406 233,434 236,456 
    C 237,466 232,476 232,481 
    C 232,484 237,486 243,486 
    C 250,486 252,480 252,472 
    C 252,456 251,436 252,416 
    C 253,394 253,371 254,348 
    C 255,326 257,308 260,296 
    C 263,308 265,326 266,348 
    C 267,371 267,394 268,416 
    C 269,436 268,456 268,472 
    C 268,480 270,486 277,486 
    C 283,486 288,484 288,481 
    C 288,476 283,476 284,456 
    C 287,434 284,406 286,384 
    C 289,354 285,331 282,301 
    C 280,278 280,256 282,238 
    C 284,258 288,278 292,292 
    C 294,302 296,310 300,310 
    C 305,310 305,298 302,286 
    C 300,271 295,256 292,238 
    C 288,211 290,181 291,158 
    C 291,156 292,156 292,158 
    C 296,186 302,224 310,258 
    C 314,274 319,288 324,298 
    C 327,304 331,309 333,307 
    C 335,304 333,300 330,294 
    C 326,281 322,266 319,248 
    C 316,226 317,202 319,188 
    C 319,182 322,178 324,184 
    C 331,204 335,234 338,254 
    C 340,270 344,284 350,290 
    C 354,294 360,295 362,292 
    C 364,289 361,285 359,280 
    C 356,272 353,262 350,248 
    C 344,218 338,192 332,172 
    C 326,152 316,138 302,132 
    C 292,128 282,122 282,110 
    C 282,102 276,94 270,94 
    Z
  `;

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #e7f1f3 0%, #edf4f5 100%)",
        border: "1px solid #b8cdd2",
        borderRadius: "24px",
        padding: "24px 16px",
        boxShadow: "0 10px 30px rgba(35, 127, 148, 0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
        color: "#1e3b43",
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        position: "relative",
      }}
    >
      {/* Title block with dumbbell ornaments */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#237f94" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="2" y="9" width="3" height="6" rx="1" />
          <rect x="19" y="9" width="3" height="6" rx="1" />
          <line x1="5" y1="12" x2="19" y2="12" strokeWidth="3" stroke="#237f94" />
          <rect x="5" y="7" width="2" height="10" rx="0.5" />
          <rect x="17" y="7" width="2" height="10" rx="0.5" />
        </svg>
        <h2
          style={{
            fontSize: "1.45rem",
            fontWeight: "800",
            textAlign: "center",
            margin: 0,
            color: "#0f2d37",
            letterSpacing: "0.03em",
            lineHeight: "1.2",
            textTransform: "uppercase",
          }}
        >
          Tablero de Datos Antropométricos y Corporales Detallados
        </h2>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#237f94" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="2" y="9" width="3" height="6" rx="1" />
          <rect x="19" y="9" width="3" height="6" rx="1" />
          <line x1="5" y1="12" x2="19" y2="12" strokeWidth="3" stroke="#237f94" />
          <rect x="5" y="7" width="2" height="10" rx="0.5" />
          <rect x="17" y="7" width="2" height="10" rx="0.5" />
        </svg>
      </div>

      {/* Toggle Pill Selector (Weight vs Body Fat %) */}
      <div
        style={{
          background: "rgba(200, 220, 222, 0.7)",
          borderRadius: "30px",
          padding: "4px",
          display: "flex",
          width: "fit-content",
          margin: "4px auto 0 auto",
          border: "1px solid rgba(35, 127, 148, 0.15)",
        }}
      >
        <button
          onClick={() => setActiveMetric("weight")}
          style={{
            background: activeMetric === "weight" ? "#237f94" : "transparent",
            color: activeMetric === "weight" ? "#ffffff" : "#4e6a73",
            border: "none",
            borderRadius: "24px",
            padding: "8px 24px",
            fontSize: "0.95rem",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s ease",
            outline: "none",
          }}
        >
          Weight
        </button>
        <button
          onClick={() => setActiveMetric("fat")}
          style={{
            background: activeMetric === "fat" ? "#237f94" : "transparent",
            color: activeMetric === "fat" ? "#ffffff" : "#4e6a73",
            border: "none",
            borderRadius: "24px",
            padding: "8px 24px",
            fontSize: "0.95rem",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s ease",
            outline: "none",
          }}
        >
          Body Fat %
        </button>
      </div>

      {/* Main Dual Axis Chart + Body Model Container */}
      <div
        style={{
          position: "relative",
          background: "transparent",
          minHeight: "450px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "visible",
        }}
      >
        <svg
          viewBox="0 0 500 500"
          width="100%"
          height="450"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Fine graph grid */}
            <pattern id="lightGraphGrid" width="38" height="34" patternUnits="userSpaceOnUse">
              <path d="M 38 0 L 0 0 0 34" fill="none" stroke="rgba(35, 127, 148, 0.05)" strokeWidth="0.8" />
            </pattern>

            {/* Glowing filter for the body outline */}
            <filter id="bodyOutlineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* 3D Chrome Metallic Blue Gradient */}
            <linearGradient id="bodyChromeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a3d45" />
              <stop offset="15%" stopColor="#226473" />
              <stop offset="42%" stopColor="#31bed8" />
              <stop offset="50%" stopColor="#d8f8fd" />
              <stop offset="58%" stopColor="#31bed8" />
              <stop offset="85%" stopColor="#226473" />
              <stop offset="100%" stopColor="#1a3d45" />
            </linearGradient>

            {/* Area chart gradients */}
            <linearGradient id="weightAreaFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#237f94" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#237f94" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="fatAreaFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#688089" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#688089" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect x={chartXStart} y={chartYStart} width={chartWidth} height={chartHeight} fill="url(#lightGraphGrid)" rx="6" />

          {/* Horizontal dotted gridlines matching y-axis numbers */}
          {[100, 180, 260, 340, 420].map((yVal, i) => (
            <line
              key={i}
              x1={chartXStart}
              y1={yVal}
              x2={chartXEnd}
              y2={yVal}
              stroke="rgba(35, 127, 148, 0.15)"
              strokeDasharray="4,4"
              strokeWidth="1"
            />
          ))}

          {/* --- LEFT Y-AXIS (Weight: 0 - 200 kg) --- */}
          <line
            x1={chartXStart}
            y1={chartYStart}
            x2={chartXStart}
            y2={chartYEnd}
            stroke={activeMetric === "weight" ? "#237f94" : "#7c98a0"}
            strokeWidth={activeMetric === "weight" ? "2" : "1.2"}
            opacity={activeMetric === "weight" ? "1.0" : "0.5"}
          />
          {/* Tick marks on left axis */}
          {[100, 180, 260, 340, 420].map((yVal, i) => (
            <line
              key={i}
              x1={chartXStart - 5}
              y1={yVal}
              x2={chartXStart}
              y2={yVal}
              stroke={activeMetric === "weight" ? "#237f94" : "#7c98a0"}
              strokeWidth="1.5"
              opacity={activeMetric === "weight" ? "1.0" : "0.5"}
            />
          ))}
          {/* Left Y-axis labels (200, 150, 100, 50, 0) */}
          {[
            { val: 200, y: 100 },
            { val: 150, y: 180 },
            { val: 100, y: 260 },
            { val: 50, y: 340 },
            { val: 0, y: 420 },
          ].map((item, i) => (
            <text
              key={i}
              x={chartXStart - 10}
              y={item.y + 4}
              textAnchor="end"
              fontSize="11"
              fontWeight="700"
              fill={activeMetric === "weight" ? "#0f2d37" : "#688089"}
              opacity={activeMetric === "weight" ? "1.0" : "0.6"}
            >
              {item.val}
            </text>
          ))}
          {/* Left Vertical Label: Weight (kg) */}
          <text
            transform={`rotate(-90, ${chartXStart - 38}, ${chartYStart + chartHeight / 2})`}
            x={chartXStart - 38}
            y={chartYStart + chartHeight / 2}
            textAnchor="middle"
            fontSize="12"
            fontWeight="800"
            letterSpacing="0.05em"
            fill={activeMetric === "weight" ? "#237f94" : "#688089"}
            opacity={activeMetric === "weight" ? "1.0" : "0.6"}
          >
            Weight (kg)
          </text>

          {/* --- RIGHT Y-AXIS (Body Fat: 0 - 60 %) --- */}
          <line
            x1={chartXEnd}
            y1={chartYStart}
            x2={chartXEnd}
            y2={chartYEnd}
            stroke={activeMetric === "fat" ? "#237f94" : "#7c98a0"}
            strokeWidth={activeMetric === "fat" ? "2" : "1.2"}
            opacity={activeMetric === "fat" ? "1.0" : "0.5"}
          />
          {/* Tick marks on right axis */}
          {[100, 180, 260, 340, 420].map((yVal, i) => (
            <line
              key={i}
              x1={chartXEnd}
              y1={yVal}
              x2={chartXEnd + 5}
              y2={yVal}
              stroke={activeMetric === "fat" ? "#237f94" : "#7c98a0"}
              strokeWidth="1.5"
              opacity={activeMetric === "fat" ? "1.0" : "0.5"}
            />
          ))}
          {/* Right Y-axis labels (60, 45, 30, 15, 0) */}
          {[
            { val: 60, y: 100 },
            { val: 45, y: 180 },
            { val: 30, y: 260 },
            { val: 15, y: 340 },
            { val: 0, y: 420 },
          ].map((item, i) => (
            <text
              key={i}
              x={chartXEnd + 10}
              y={item.y + 4}
              textAnchor="start"
              fontSize="11"
              fontWeight="700"
              fill={activeMetric === "fat" ? "#0f2d37" : "#688089"}
              opacity={activeMetric === "fat" ? "1.0" : "0.6"}
            >
              {item.val}
            </text>
          ))}
          {/* Right Vertical Label: Body Fat (%) */}
          <text
            transform={`rotate(90, ${chartXEnd + 38}, ${chartYStart + chartHeight / 2})`}
            x={chartXEnd + 38}
            y={chartYStart + chartHeight / 2}
            textAnchor="middle"
            fontSize="12"
            fontWeight="800"
            letterSpacing="0.05em"
            fill={activeMetric === "fat" ? "#237f94" : "#688089"}
            opacity={activeMetric === "fat" ? "1.0" : "0.6"}
          >
            Body Fat (%)
          </text>

          {/* --- BACKGROUND AREA CHARTS & TREND LINES (drawn behind body model) --- */}

          {/* 1. Weight Trend (Left Area) */}
          <path
            d={weightAreaPath}
            fill="url(#weightAreaFillGrad)"
            opacity={activeMetric === "weight" ? "0.45" : "0.08"}
            style={{ transition: "opacity 0.4s ease" }}
          />
          <path
            d={weightLinePath}
            fill="none"
            stroke="#1c788c"
            strokeWidth={activeMetric === "weight" ? "3.5" : "1.5"}
            opacity={activeMetric === "weight" ? "0.95" : "0.2"}
            style={{ transition: "stroke-width 0.4s ease, opacity 0.4s ease" }}
          />

          {/* 2. Body Fat Trend (Right Area) */}
          <path
            d={fatAreaPath}
            fill="url(#fatAreaFillGrad)"
            opacity={activeMetric === "fat" ? "0.45" : "0.08"}
            style={{ transition: "opacity 0.4s ease" }}
          />
          <path
            d={fatLinePath}
            fill="none"
            stroke="#5c757f"
            strokeWidth={activeMetric === "fat" ? "3.5" : "1.5"}
            opacity={activeMetric === "fat" ? "0.95" : "0.2"}
            style={{ transition: "stroke-width 0.4s ease, opacity 0.4s ease" }}
          />

          {/* Interactive Chart Nodes & Tooltips */}
          {activeMetric === "weight" &&
            weightCoords.map((c, idx) => (
              <g key={`w-node-${idx}`}>
                <circle cx={c.x} cy={c.y} r="6" fill="#1c788c" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx={c.x} cy={c.y} r="12" fill="#1c788c" fillOpacity="0.15" />
                <rect
                  x={c.x - 22}
                  y={c.y - 32}
                  width="44"
                  height="20"
                  rx="6"
                  fill="#0f2d37"
                  stroke="#31bed8"
                  strokeWidth="1"
                />
                <text
                  x={c.x}
                  y={c.y - 18}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill="#ffffff"
                >
                  {c.value.toFixed(0)}k
                </text>
              </g>
            ))}

          {activeMetric === "fat" &&
            fatCoords.map((c, idx) => (
              <g key={`f-node-${idx}`}>
                <circle cx={c.x} cy={c.y} r="6" fill="#5c757f" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx={c.x} cy={c.y} r="12" fill="#5c757f" fillOpacity="0.15" />
                <rect
                  x={c.x - 22}
                  y={c.y - 32}
                  width="44"
                  height="20"
                  rx="6"
                  fill="#0f2d37"
                  stroke="#7c98a0"
                  strokeWidth="1"
                />
                <text
                  x={c.x}
                  y={c.y - 18}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill="#ffffff"
                >
                  {c.value.toFixed(1)}%
                </text>
              </g>
            ))}

          {/* Timeline labels at the bottom of the chart */}
          {chartData.map((d, i) => {
            const x = chartXStart + (i / 5) * chartWidth;
            return (
              <text
                key={`lbl-${i}`}
                x={x}
                y={chartYEnd + 20}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#4e6a73"
              >
                {d.date}
              </text>
            );
          })}

          {/* --- HIGH-FIDELITY 3D METALLIC ATHLETIC BODY MODEL (Centered, Layered) --- */}
          <g transform={transformStr} style={{ transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
            {/* Floor reflection rings */}
            <ellipse cx="250" cy="485" rx="38" ry="7" fill="none" stroke="rgba(35, 127, 148, 0.15)" strokeWidth="0.8" />
            <ellipse cx="250" cy="485" rx="22" ry="4" fill="none" stroke="#31bed8" strokeOpacity="0.25" strokeWidth="0.8" />

            {/* Glowing back-layer highlight */}
            <path
              d={bodySilhouettePath}
              fill="none"
              stroke="#31bed8"
              strokeWidth="8"
              opacity="0.18"
              filter="url(#bodyOutlineGlow)"
            />

            {/* Solid chrome metallic-shaded muscle silhouette */}
            <path
              d={bodySilhouettePath}
              fill="url(#bodyChromeGrad)"
              stroke="#31bed8"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Muscular Head Globe */}
            <ellipse cx="250" cy="74" rx="14" ry="19" fill="url(#bodyChromeGrad)" stroke="#31bed8" strokeWidth="1.5" />
            <path d="M 242,75 C 245,77 248,77 250,77 C 252,77 255,77 258,75" fill="none" stroke="#a5f3fc" strokeWidth="1" opacity="0.6" />

            {/* Muscle definition contour overlays (Neon/cyan lighting) */}
            <g stroke="#a5f3fc" strokeWidth="1.1" fill="none" opacity="0.75" strokeLinecap="round">
              {/* Deltoids (Shoulders) */}
              <path d="M 218,132 C 212,142 208,158 212,168" />
              <path d="M 282,132 C 288,142 292,158 288,168" />

              {/* Pectorals (Chest) */}
              <path d="M 218,158 C 225,172 238,176 250,176 C 262,176 275,172 282,158" strokeWidth="1.3" />
              <path d="M 250,148 L 250,176" strokeWidth="1.3" />
              <path d="M 219,148 C 230,150 242,150 250,148 C 258,150 270,150 281,148" opacity="0.5" />

              {/* Abdominals (Six-pack grid & line alba) */}
              <path d="M 250,176 L 250,277" strokeWidth="1.3" />
              <path d="M 235,195 C 245,197 255,197 265,195" />
              <path d="M 233,218 C 245,220 255,220 267,218" />
              <path d="M 233,242 C 245,244 255,244 267,242" />
              <path d="M 235,176 C 232,205 233,240 235,260" opacity="0.4" />
              <path d="M 265,176 C 268,205 267,240 265,260" opacity="0.4" />

              {/* Serratus lateral ribs */}
              <path d="M 215,185 L 225,190" opacity="0.4" />
              <path d="M 213,195 L 223,200" opacity="0.4" />
              <path d="M 285,185 L 275,190" opacity="0.4" />
              <path d="M 287,195 L 277,200" opacity="0.4" />

              {/* Obliques / V-Cut Hips */}
              <path d="M 218,248 C 228,262 242,274 250,277" strokeWidth="1.3" />
              <path d="M 282,248 C 272,262 258,274 250,277" strokeWidth="1.3" />

              {/* Arms (Biceps & Forearms contours) */}
              <path d="M 201,188 C 196,202 191,216 189,226" opacity="0.5" />
              <path d="M 299,188 C 304,202 309,216 311,226" opacity="0.5" />
              <path d="M 190,240 C 185,255 180,268 178,278" opacity="0.5" />
              <path d="M 310,240 C 315,255 320,268 322,278" opacity="0.5" />

              {/* Thighs (Quadriceps structure) */}
              <path d="M 228,292 C 234,320 238,340 240,358" opacity="0.5" />
              <path d="M 272,292 C 266,320 262,340 260,358" opacity="0.5" />
              <path d="M 224,310 C 228,332 232,352 238,358" opacity="0.5" />
              <path d="M 276,310 C 272,332 268,352 262,358" opacity="0.5" />

              {/* Kneecaps (Patella) */}
              <ellipse cx="230" cy="370" rx="4" ry="6" opacity="0.6" />
              <ellipse cx="270" cy="370" rx="4" ry="6" opacity="0.6" />

              {/* Calves / Shin bone contours */}
              <path d="M 226,384 C 223,405 220,425 226,445" opacity="0.5" />
              <path d="M 274,384 C 277,405 280,425 274,445" opacity="0.5" />
            </g>
          </g>

          {/* Real-time laser scan horizontal bar */}
          <line
            x1={chartXStart}
            y1="100"
            x2={chartXEnd}
            y2="100"
            stroke="#31bed8"
            strokeWidth="2.5"
            opacity="0.8"
            style={{ filter: "drop-shadow(0 0 4px #31bed8)" }}
          >
            <animate
              attributeName="y1"
              values="100;420;100"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y2"
              values="100;420;100"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.9;0.3"
              dur="5s"
              repeatCount="indefinite"
            />
          </line>
        </svg>

        {/* Floating somatotype badge */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "24px",
            background: "rgba(35, 127, 148, 0.1)",
            border: "1px solid rgba(35, 127, 148, 0.3)",
            borderRadius: "16px",
            padding: "4px 12px",
            fontSize: "0.8rem",
            fontWeight: "700",
            color: "#237f94",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {dominant === "ectomorph" && "Ectomorfo ⚡"}
          {dominant === "mesomorph" && "Mesomorfo 🔥"}
          {dominant === "endomorph" && "Endomorfo 🥑"}
        </div>
      </div>

      {/* Columns containing weight and fat summaries */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderTop: "1.5px solid rgba(35, 127, 148, 0.15)",
          paddingTop: "20px",
          textAlign: "center",
          position: "relative",
          margin: "0 8px",
        }}
      >
        {/* Left Column (PESO) */}
        <div style={{ paddingRight: "12px" }}>
          <h4
            style={{
              fontSize: "0.95rem",
              fontWeight: "800",
              color: "#4e6a73",
              margin: 0,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Peso
          </h4>
          <div
            style={{
              fontSize: "2.35rem",
              fontWeight: "900",
              color: "#0f2d37",
              margin: "6px 0",
              lineHeight: "1",
            }}
          >
            {weight} kg
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#688089",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            Peso actual registrado en la última evaluación
          </p>
        </div>

        {/* Center separating line */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "20px",
            bottom: "0",
            width: "1.5px",
            background: "rgba(35, 127, 148, 0.15)",
            transform: "translateX(-50%)",
          }}
        />

        {/* Right Column (GRASA CORPORAL (BF%)) */}
        <div style={{ paddingLeft: "12px" }}>
          <h4
            style={{
              fontSize: "0.95rem",
              fontWeight: "800",
              color: "#4e6a73",
              margin: 0,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Grasa Corporal (BF%)
          </h4>
          <div
            style={{
              fontSize: "2.35rem",
              fontWeight: "900",
              color: "#0f2d37",
              margin: "6px 0",
              lineHeight: "1",
            }}
          >
            {bodyFat.toFixed(1)}%
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#688089",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            Porcentaje de grasa corporal estimado
          </p>
        </div>
      </div>

      {/* Somatotype scores scientific display (clean & compact) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          background: "rgba(255, 255, 255, 0.4)",
          borderRadius: "16px",
          padding: "10px 16px",
          border: "1px solid rgba(35, 127, 148, 0.08)",
          margin: "0 8px",
        }}
      >
        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#4e6a73" }}>
          Categoría: <span style={{ color: "#0f2d37" }}>{category}</span>
        </span>
        <div style={{ display: "flex", gap: "8px", fontSize: "0.78rem" }}>
          <span style={{ padding: "4px 8px", background: "rgba(255, 69, 0, 0.08)", border: "1px solid rgba(255, 69, 0, 0.15)", borderRadius: "8px", color: "#cf3c00", fontWeight: "700" }}>
            Endo: {endo.toFixed(1)}
          </span>
          <span style={{ padding: "4px 8px", background: "rgba(50, 205, 50, 0.08)", border: "1px solid rgba(50, 205, 50, 0.15)", borderRadius: "8px", color: "#249c24", fontWeight: "700" }}>
            Meso: {meso.toFixed(1)}
          </span>
          <span style={{ padding: "4px 8px", background: "rgba(0, 191, 255, 0.08)", border: "1px solid rgba(0, 191, 255, 0.15)", borderRadius: "8px", color: "#008ac7", fontWeight: "700" }}>
            Ecto: {ecto.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Bottom Nav Bar (matches the mockup navigation tabs) */}
      {setActiveTab && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            background: "rgba(200, 220, 222, 0.4)",
            border: "1px solid rgba(35, 127, 148, 0.12)",
            borderRadius: "18px",
            padding: "8px 4px",
            margin: "10px 8px 0 8px",
          }}
        >
          {/* 1. ALIMENTACIÓN (Tab: nutrition) */}
          <button
            onClick={() => setActiveTab("nutrition")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: activeTab === "nutrition" ? "#0f2d37" : "#526c75",
              opacity: activeTab === "nutrition" ? "1" : "0.7",
              outline: "none",
              transition: "all 0.3s ease",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3v6a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V3" />
              <path d="M8 3v9" />
              <path d="M8 12v9" />
              <path d="M16 3c-1.5 0-3 1.5-3 4.5s1.5 4.5 3 4.5 3-1.5 3-4.5S17.5 3 16 3z" />
              <path d="M16 12v9" />
            </svg>
            <span style={{ fontSize: "0.68rem", fontWeight: "800", textTransform: "uppercase" }}>Alimentación</span>
          </button>

          {/* 2. ANTROPOMETRÍA (Tab: anthropometry) */}
          <button
            onClick={() => setActiveTab("anthropometry")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: activeTab === "anthropometry" ? "#0f2d37" : "#526c75",
              opacity: activeTab === "anthropometry" ? "1" : "0.7",
              outline: "none",
              transition: "all 0.3s ease",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M7 6v4" />
              <path d="M11 6v4" />
              <path d="M15 6v4" />
              <path d="M19 6v4" />
              <path d="M7 14v4" />
              <path d="M11 14v4" />
              <path d="M15 14v4" />
            </svg>
            <span style={{ fontSize: "0.68rem", fontWeight: "800", textTransform: "uppercase" }}>Antropometría</span>
          </button>

          {/* 3. ENTRENAMIENTO (Tab: training) */}
          <button
            onClick={() => setActiveTab("training")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: activeTab === "training" ? "#0f2d37" : "#526c75",
              opacity: activeTab === "training" ? "1" : "0.7",
              outline: "none",
              transition: "all 0.3s ease",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="8" width="4" height="8" rx="1" />
              <rect x="18" y="8" width="4" height="8" rx="1" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <rect x="5" y="6" width="2" height="12" rx="0.5" />
              <rect x="17" y="6" width="2" height="12" rx="0.5" />
            </svg>
            <span style={{ fontSize: "0.68rem", fontWeight: "800", textTransform: "uppercase" }}>Entrenamiento</span>
          </button>

          {/* 4. RESUMEN DE PROGRESO (also toggles to anthropometry or shows trends) */}
          <button
            onClick={() => {
              setActiveTab("anthropometry");
              // Smooth scroll to BodyTrendChart if it exists
              const trendEl = document.querySelector(".glass-card h3");
              if (trendEl) {
                trendEl.scrollIntoView({ behavior: "smooth" });
              }
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: "#526c75",
              opacity: "0.7",
              outline: "none",
              transition: "all 0.3s ease",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
              <path d="M15 8h4v4" />
            </svg>
            <span style={{ fontSize: "0.68rem", fontWeight: "800", textTransform: "uppercase" }}>Progreso</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SomatotypeBodyVisualizer;
