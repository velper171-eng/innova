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

            {/* Head/Face Radial Gradient */}
            <radialGradient id="headGrad" cx="250" cy="70" r="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="45%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Left Pectoral Radial Gradient */}
            <radialGradient id="pecGradLeft" cx="236" cy="158" r="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="45%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Right Pectoral Radial Gradient */}
            <radialGradient id="pecGradRight" cx="264" cy="158" r="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="45%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Left Deltoid Radial Gradient */}
            <radialGradient id="deltoidGradLeft" cx="208" cy="145" r="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Right Deltoid Radial Gradient */}
            <radialGradient id="deltoidGradRight" cx="292" cy="145" r="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Left Bicep Radial Gradient */}
            <radialGradient id="bicepGradLeft" cx="207" cy="190" r="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Right Bicep Radial Gradient */}
            <radialGradient id="bicepGradRight" cx="293" cy="190" r="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Left Tricep Radial Gradient */}
            <radialGradient id="tricepGradLeft" cx="196" cy="184" r="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Right Tricep Radial Gradient */}
            <radialGradient id="tricepGradRight" cx="304" cy="184" r="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Left Forearm Radial Gradient */}
            <radialGradient id="forearmGradLeft" cx="200" cy="244" r="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Right Forearm Radial Gradient */}
            <radialGradient id="forearmGradRight" cx="300" cy="244" r="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Abdominals Radial Gradient */}
            <radialGradient id="abGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Left Oblique Radial Gradient */}
            <radialGradient id="obliqueGradLeft" cx="232" cy="262" r="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Right Oblique Radial Gradient */}
            <radialGradient id="obliqueGradRight" cx="268" cy="262" r="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Left Thigh (Center Quad) Radial Gradient */}
            <radialGradient id="quadCenterGradLeft" cx="225" cy="322" r="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Right Thigh (Center Quad) Radial Gradient */}
            <radialGradient id="quadCenterGradRight" cx="275" cy="322" r="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Left Thigh (Outer Quad) Radial Gradient */}
            <radialGradient id="quadOuterGradLeft" cx="217" cy="325" r="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Right Thigh (Outer Quad) Radial Gradient */}
            <radialGradient id="quadOuterGradRight" cx="283" cy="325" r="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Left Thigh (Teardrop Quad) Radial Gradient */}
            <radialGradient id="teardropGradLeft" cx="234" cy="342" r="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Right Thigh (Teardrop Quad) Radial Gradient */}
            <radialGradient id="teardropGradRight" cx="266" cy="342" r="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Kneecaps Radial Gradient */}
            <radialGradient id="patellaGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Calves Outer Left Radial Gradient */}
            <radialGradient id="calfOuterGradLeft" cx="220" cy="408" r="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Calves Outer Right Radial Gradient */}
            <radialGradient id="calfOuterGradRight" cx="280" cy="408" r="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Calves Inner Left Radial Gradient */}
            <radialGradient id="calfInnerGradLeft" cx="232" cy="408" r="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>

            {/* Calves Inner Right Radial Gradient */}
            <radialGradient id="calfInnerGradRight" cx="268" cy="408" r="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6fdff" />
              <stop offset="50%" stopColor="#37d5f2" />
              <stop offset="85%" stopColor="#175b6d" />
              <stop offset="100%" stopColor="#061d24" />
            </radialGradient>
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

            {/* Muscular Head Globe (3D Shaded) */}
            <g>
              <ellipse cx="250" cy="74" rx="14" ry="19" fill="url(#headGrad)" stroke="#31bed8" strokeWidth="1.5" />
              {/* Ear details */}
              <ellipse cx="235" cy="74" rx="2" ry="5.5" fill="#175b6d" stroke="#31bed8" strokeWidth="0.8" />
              <ellipse cx="265" cy="74" rx="2" ry="5.5" fill="#175b6d" stroke="#31bed8" strokeWidth="0.8" />
              {/* Jawline definition */}
              <path d="M 238,78 C 240,88 245,90 250,90 C 255,90 260,88 262,78" fill="none" stroke="#a5f3fc" strokeWidth="1" opacity="0.6" />
              {/* Neck contours */}
              <path d="M 243,90 L 241,114" stroke="#31bed8" strokeWidth="1" opacity="0.6" />
              <path d="M 257,90 L 259,114" stroke="#31bed8" strokeWidth="1" opacity="0.6" />
            </g>

            {/* 3D Volumetric Muscle Overlays */}
            <g strokeLinecap="round" strokeLinejoin="round">
              {/* 1. Trapezius */}
              <path d="M 236,94 C 232,106 226,118 218,122 L 228,122 C 234,116 238,106 238,94 Z" fill="url(#deltoidGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              <path d="M 264,94 C 268,106 274,118 282,122 L 272,122 C 266,116 262,106 262,94 Z" fill="url(#deltoidGradRight)" stroke="#31bed8" strokeWidth="0.8" />

              {/* 2. Deltoids (Shoulders) */}
              <path d="M 218,122 C 210,126 200,136 200,148 C 200,160 208,166 215,166 C 218,154 220,136 218,122 Z" fill="url(#deltoidGradLeft)" stroke="#31bed8" strokeWidth="1" />
              <path d="M 282,122 C 290,126 300,136 300,148 C 300,160 292,166 285,166 C 282,154 280,136 282,122 Z" fill="url(#deltoidGradRight)" stroke="#31bed8" strokeWidth="1" />

              {/* 3. Pectorals (Chest Plates) */}
              <path d="M 250,136 L 222,142 C 216,145 214,166 218,176 C 228,180 246,180 250,176 Z" fill="url(#pecGradLeft)" stroke="#31bed8" strokeWidth="1.2" />
              <path d="M 250,136 L 278,142 C 284,145 286,166 282,176 C 272,180 254,180 250,176 Z" fill="url(#pecGradRight)" stroke="#31bed8" strokeWidth="1.2" />
              {/* Sternal division line */}
              <line x1="250" y1="136" x2="250" y2="176" stroke="#061d24" strokeWidth="1.5" opacity="0.8" />
              {/* Clavicle borders */}
              <path d="M 218,124 C 230,132 242,132 250,130 C 258,132 270,132 282,124" fill="none" stroke="#31bed8" strokeWidth="1.2" opacity="0.6" />

              {/* 4. Upper Arms (Biceps & Triceps) */}
              {/* Left Bicep */}
              <path d="M 212,166 C 206,176 202,188 202,202 C 202,212 208,216 212,214 C 214,202 214,182 212,166 Z" fill="url(#bicepGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              {/* Right Bicep */}
              <path d="M 288,166 C 294,176 298,188 298,202 C 298,212 292,216 288,214 C 286,202 286,182 288,166 Z" fill="url(#bicepGradRight)" stroke="#31bed8" strokeWidth="0.8" />
              {/* Left Tricep (outer sweep) */}
              <path d="M 200,154 C 196,168 194,184 193,200 C 193,212 199,214 202,204 C 201,190 200,168 200,154 Z" fill="url(#tricepGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              {/* Right Tricep (outer sweep) */}
              <path d="M 300,154 C 304,168 306,184 307,200 C 307,212 301,214 298,204 C 299,190 300,168 300,154 Z" fill="url(#tricepGradRight)" stroke="#31bed8" strokeWidth="0.8" />

              {/* 5. Forearms (Muscular Bulge) */}
              <path d="M 212,214 C 208,226 198,246 191,264 C 187,272 189,274 192,274 C 198,274 209,248 212,214 Z" fill="url(#forearmGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              <path d="M 288,214 C 292,226 302,246 309,264 C 313,272 311,274 308,274 C 302,274 291,248 288,214 Z" fill="url(#forearmGradRight)" stroke="#31bed8" strokeWidth="0.8" />

              {/* 6. Hands */}
              <path d="M 188,274 C 185,280 180,288 178,296 C 180,296 184,288 192,274 Z" fill="url(#forearmGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              <path d="M 312,274 C 315,280 320,288 322,296 C 320,296 316,288 308,274 Z" fill="url(#forearmGradRight)" stroke="#31bed8" strokeWidth="0.8" />

              {/* 7. Abdominals (Individually Sculpted Blocks) */}
              <rect x="235" y="184" width="13" height="15" rx="3" fill="url(#abGrad)" stroke="#061d24" strokeWidth="0.6" />
              <rect x="252" y="184" width="13" height="15" rx="3" fill="url(#abGrad)" stroke="#061d24" strokeWidth="0.6" />

              <rect x="233" y="202" width="15" height="17" rx="3" fill="url(#abGrad)" stroke="#061d24" strokeWidth="0.6" />
              <rect x="252" y="202" width="15" height="17" rx="3" fill="url(#abGrad)" stroke="#061d24" strokeWidth="0.6" />

              <rect x="233" y="222" width="15" height="17" rx="3" fill="url(#abGrad)" stroke="#061d24" strokeWidth="0.6" />
              <rect x="252" y="222" width="15" height="17" rx="3" fill="url(#abGrad)" stroke="#061d24" strokeWidth="0.6" />

              <rect x="235" y="242" width="13" height="18" rx="3" fill="url(#abGrad)" stroke="#061d24" strokeWidth="0.6" />
              <rect x="252" y="242" width="13" height="18" rx="3" fill="url(#abGrad)" stroke="#061d24" strokeWidth="0.6" />

              {/* Linea Alba (deep vertical line) */}
              <line x1="250" y1="180" x2="250" y2="265" stroke="#061d24" strokeWidth="1.5" opacity="0.8" />

              {/* Ribs / Serratus Anterior Details */}
              <g stroke="#31bed8" strokeWidth="0.8" fill="none" opacity="0.5">
                <path d="M 215,182 L 225,186" />
                <path d="M 213,194 L 223,198" />
                <path d="M 212,206 L 222,210" />

                <path d="M 285,182 L 275,186" />
                <path d="M 287,194 L 277,198" />
                <path d="M 288,206 L 278,210" />
              </g>

              {/* 8. Obliques & Lower V-Cut (Inguinal Ligament) */}
              <path d="M 218,248 C 228,260 242,272 250,275 L 250,277 C 241,274 227,262 218,248 Z" fill="url(#obliqueGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              <path d="M 282,248 C 272,260 258,272 250,275 L 250,277 C 259,274 273,262 282,248 Z" fill="url(#obliqueGradRight)" stroke="#31bed8" strokeWidth="0.8" />

              <path d="M 226,252 C 234,264 246,275 250,276" stroke="#a5f3fc" strokeWidth="1.5" fill="none" opacity="0.85" />
              <path d="M 274,252 C 266,264 254,275 250,276" stroke="#a5f3fc" strokeWidth="1.5" fill="none" opacity="0.85" />

              {/* 9. Thighs (Quadriceps - 3 heads per thigh) */}
              {/* Rectus Femoris (Center) */}
              <path d="M 224,290 C 226,310 228,332 230,356 C 227,356 221,332 220,310 Z" fill="url(#quadCenterGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              <path d="M 276,290 C 274,310 272,332 270,356 C 273,356 279,332 280,310 Z" fill="url(#quadCenterGradRight)" stroke="#31bed8" strokeWidth="0.8" />

              {/* Vastus Lateralis (Outer sweep) */}
              <path d="M 220,290 C 212,312 214,338 222,360 C 224,338 224,312 220,290 Z" fill="url(#quadOuterGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              <path d="M 280,290 C 288,312 286,338 278,360 C 276,338 276,312 280,290 Z" fill="url(#quadOuterGradRight)" stroke="#31bed8" strokeWidth="0.8" />

              {/* Vastus Medialis (Teardrop muscle above knee) */}
              <path d="M 230,312 C 235,328 239,342 239,352 C 237,358 231,358 228,348 Z" fill="url(#teardropGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              <path d="M 270,312 C 265,328 261,342 261,352 C 263,358 269,358 272,348 Z" fill="url(#teardropGradRight)" stroke="#31bed8" strokeWidth="0.8" />

              {/* 10. Kneecaps (Patella) */}
              <ellipse cx="230" cy="368" rx="4.5" ry="6.5" fill="url(#patellaGrad)" stroke="#31bed8" strokeWidth="1" />
              <ellipse cx="270" cy="368" rx="4.5" ry="6.5" fill="url(#patellaGrad)" stroke="#31bed8" strokeWidth="1" />

              {/* 11. Calves & Lower Legs */}
              {/* Outer Calf Gastrocnemius */}
              <path d="M 224,378 C 217,394 217,416 222,438 C 224,438 225,408 224,378 Z" fill="url(#calfOuterGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              <path d="M 276,378 C 283,394 283,416 278,438 C 276,438 275,408 276,378 Z" fill="url(#calfOuterGradRight)" stroke="#31bed8" strokeWidth="0.8" />

              {/* Inner Calf Gastrocnemius */}
              <path d="M 228,378 C 235,394 235,416 230,438 C 228,438 227,408 228,378 Z" fill="url(#calfInnerGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              <path d="M 272,378 C 265,394 265,416 270,438 C 272,438 271,408 272,378 Z" fill="url(#calfInnerGradRight)" stroke="#31bed8" strokeWidth="0.8" />

              {/* Shin Highlights */}
              <path d="M 226,380 L 226,448" stroke="#a5f3fc" strokeWidth="1" opacity="0.3" />
              <path d="M 274,380 L 274,448" stroke="#a5f3fc" strokeWidth="1" opacity="0.3" />

              {/* 12. Feet */}
              <path d="M 220,468 C 218,482 220,486 228,486 C 230,478 228,468 220,468 Z" fill="url(#forearmGradLeft)" stroke="#31bed8" strokeWidth="0.8" />
              <path d="M 280,468 C 282,482 280,486 272,486 C 270,478 272,468 280,468 Z" fill="url(#forearmGradRight)" stroke="#31bed8" strokeWidth="0.8" />
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
