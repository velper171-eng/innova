import React, { useState } from "react";

/**
 * BodyTrendChart — Gráfica interactiva de área dual
 * Muestra evolución de Peso (Teal) y % Grasa (Orange) con tooltips
 */
const BodyTrendChart = ({ evaluations = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const sorted = [...evaluations]
    .filter((e) => e.weight > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sorted.length < 2) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "40px", textAlign: "center",
        gap: "12px", minHeight: "200px", color: "var(--text-muted)"
      }}>
        <span style={{ fontSize: "2rem" }}>📈</span>
        <span style={{ fontSize: "0.9rem" }}>
          Necesitas al menos 2 evaluaciones para ver la gráfica de tendencia.
        </span>
      </div>
    );
  }

  const W = 480;
  const H = 220;
  const PAD = { top: 24, right: 24, bottom: 40, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Weight axis
  const weights = sorted.map((e) => e.weight);
  const minW = Math.min(...weights) * 0.97;
  const maxW = Math.max(...weights) * 1.03;

  // BF% axis
  const bfVals = sorted.map((e) => e.bodyFat || 0).filter(Boolean);
  const hasBF = bfVals.length >= 2;
  const minBF = hasBF ? Math.min(...bfVals) * 0.9 : 0;
  const maxBF = hasBF ? Math.max(...bfVals) * 1.1 : 50;

  const xScale = (i) => PAD.left + (i / (sorted.length - 1)) * chartW;
  const yScaleW = (v) => PAD.top + chartH - ((v - minW) / (maxW - minW)) * chartH;
  const yScaleBF = (v) => PAD.top + chartH - ((v - minBF) / (maxBF - minBF)) * chartH;

  // SVG path builders
  const buildLinePath = (points) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");

  const buildAreaPath = (points, yBase) => {
    if (points.length === 0) return "";
    const line = buildLinePath(points);
    const n = points.length - 1;
    return `${line} L${points[n][0]},${yBase} L${points[0][0]},${yBase} Z`;
  };

  const weightPoints = sorted.map((e, i) => [xScale(i), yScaleW(e.weight)]);
  const bfPoints = hasBF
    ? sorted.filter((e) => e.bodyFat).map((e, i) => {
        const idx = sorted.indexOf(e);
        return [xScale(idx), yScaleBF(e.bodyFat)];
      })
    : [];

  const yBase = PAD.top + chartH;

  // Y grid ticks
  const yTicks = 4;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minW + ((maxW - minW) * i) / yTicks;
    return { y: yScaleW(val), label: val.toFixed(1) };
  });

  const shortDate = (d) => {
    const dt = new Date(d);
    return `${dt.getDate()}/${dt.getMonth() + 1}`;
  };

  const hovered = hoveredIndex !== null ? sorted[hoveredIndex] : null;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Legend */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
          <div style={{ width: "14px", height: "3px", background: "var(--primary)", borderRadius: "2px" }} />
          <span style={{ color: "var(--text-muted)" }}>Peso (kg)</span>
        </div>
        {hasBF && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}>
            <div style={{ width: "14px", height: "3px", background: "var(--warning)", borderRadius: "2px" }} />
            <span style={{ color: "var(--text-muted)" }}>Grasa corporal (%)</span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: "absolute", top: "10px", right: "8px",
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderRadius: "10px", padding: "10px 14px", fontSize: "0.8rem",
          boxShadow: "var(--shadow-strong)", zIndex: 10, minWidth: "140px",
          pointerEvents: "none", animation: "fadeIn 0.15s"
        }}>
          <div style={{ fontWeight: 700, color: "var(--primary)", marginBottom: "4px" }}>
            {hovered.date}
          </div>
          <div style={{ color: "var(--text-main)" }}>⚖️ <strong>{hovered.weight} kg</strong></div>
          {hovered.bodyFat > 0 && (
            <div style={{ color: "var(--warning)", marginTop: "2px" }}>
              🔥 <strong>{hovered.bodyFat}%</strong> grasa
            </div>
          )}
          <div style={{ color: "var(--text-muted)", marginTop: "4px", fontSize: "0.75rem" }}>
            {hovered.endomorphy?.toFixed(1)}-{hovered.mesomorphy?.toFixed(1)}-{hovered.ectomorphy?.toFixed(1)}
          </div>
        </div>
      )}

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="gradWeight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="gradBF" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--warning)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--warning)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid horizontal lines */}
        {gridLines.map((gl, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={gl.y} x2={PAD.left + chartW} y2={gl.y}
              stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4"
            />
            <text x={PAD.left - 6} y={gl.y + 4} textAnchor="end"
              fontSize="10" fill="var(--text-muted)">{gl.label}</text>
          </g>
        ))}

        {/* BF% area + line */}
        {hasBF && bfPoints.length >= 2 && (
          <>
            <path d={buildAreaPath(bfPoints, yBase)} fill="url(#gradBF)" />
            <path d={buildLinePath(bfPoints)} fill="none"
              stroke="var(--warning)" strokeWidth="2.5" strokeLinecap="round"
              strokeLinejoin="round" />
          </>
        )}

        {/* Weight area + line */}
        <path d={buildAreaPath(weightPoints, yBase)} fill="url(#gradWeight)" />
        <path d={buildLinePath(weightPoints)} fill="none"
          stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round"
          strokeLinejoin="round" />

        {/* X axis baseline */}
        <line
          x1={PAD.left} y1={yBase} x2={PAD.left + chartW} y2={yBase}
          stroke="var(--border-color)" strokeWidth="1"
        />

        {/* Data points + labels */}
        {sorted.map((e, i) => {
          const px = xScale(i);
          const py = yScaleW(e.weight);
          const isHovered = hoveredIndex === i;
          return (
            <g key={i}>
              {/* X axis date label */}
              <text
                x={px} y={yBase + 18}
                textAnchor="middle" fontSize="9" fill="var(--text-muted)"
              >
                {shortDate(e.date)}
              </text>

              {/* Weight point */}
              <circle
                cx={px} cy={py}
                r={isHovered ? 7 : 4}
                fill={isHovered ? "var(--primary)" : "var(--bg-card)"}
                stroke="var(--primary)" strokeWidth="2"
                style={{ cursor: "pointer", transition: "r 0.15s" }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* BF point if exists */}
              {e.bodyFat > 0 && hasBF && (
                <circle
                  cx={px} cy={yScaleBF(e.bodyFat)}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? "var(--warning)" : "var(--bg-card)"}
                  stroke="var(--warning)" strokeWidth="2"
                  style={{ cursor: "pointer", transition: "r 0.15s" }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BodyTrendChart;
