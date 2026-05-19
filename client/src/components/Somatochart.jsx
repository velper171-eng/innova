import React, { useState } from "react";

const Somatochart = ({ evaluations = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // SVG Size Config
  const width = 500;
  const height = 500;
  const margin = 40;

  // Chart bounds
  const minX = -9;
  const maxX = 9;
  const minY = -10;
  const maxY = 16;

  // Map values to coordinates
  const getX = (xVal) => {
    return margin + ((xVal - minX) / (maxX - minX)) * (width - 2 * margin);
  };

  const getY = (yVal) => {
    // Invert Y because SVG coordinates go top-to-bottom
    return height - margin - ((yVal - minY) / (maxY - minY)) * (height - 2 * margin);
  };

  // Grid lines to draw
  const xGridLines = [-8, -6, -4, -2, 0, 2, 4, 6, 8];
  const yGridLines = [-8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14];

  // Process evaluations (sort chronological to draw correct trend line)
  const sortedEvals = [...evaluations].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Construct points path for trend line
  const trendLinePath = sortedEvals
    .map((ev, index) => {
      const x = getX(ev.xCoord);
      const y = getY(ev.yCoord);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "500px", margin: "0 auto" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{
          background: "rgba(15, 23, 42, 0.4)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Gradients definitions */}
        <defs>
          <radialGradient id="mesoGlow" cx="50%" cy="20%" r="50%">
            <stop offset="0%" stopColor="rgba(0, 242, 254, 0.15)" />
            <stop offset="100%" stopColor="rgba(0, 242, 254, 0)" />
          </radialGradient>
          <radialGradient id="endoGlow" cx="20%" cy="80%" r="50%">
            <stop offset="0%" stopColor="rgba(244, 63, 94, 0.12)" />
            <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
          </radialGradient>
          <radialGradient id="ectoGlow" cx="80%" cy="80%" r="50%">
            <stop offset="0%" stopColor="rgba(127, 0, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(127, 0, 255, 0)" />
          </radialGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#00f2fe" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Region fills */}
        {/* Mesomorphy Dominant Area (Top half) */}
        <path
          d={`M ${getX(-9)} ${getY(0)} L ${getX(0)} ${getY(16)} L ${getX(9)} ${getY(0)} Z`}
          fill="url(#mesoGlow)"
        />
        {/* Endomorphy Dominant Area (Bottom-left) */}
        <path
          d={`M ${getX(-9)} ${getY(0)} L ${getX(0)} ${getY(0)} L ${getX(-3)} ${getY(-10)} L ${getX(-9)} ${getY(-10)} Z`}
          fill="url(#endoGlow)"
        />
        {/* Ectomorphy Dominant Area (Bottom-right) */}
        <path
          d={`M ${getX(9)} ${getY(0)} L ${getX(0)} ${getY(0)} L ${getX(3)} ${getY(-10)} L ${getX(9)} ${getY(-10)} Z`}
          fill="url(#ectoGlow)"
        />

        {/* Grid Lines */}
        {xGridLines.map((x) => (
          <line
            key={`x-${x}`}
            x1={getX(x)}
            y1={getY(minY)}
            x2={getX(x)}
            y2={getY(maxY)}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            strokeDasharray={x === 0 ? "0" : "4 4"}
          />
        ))}

        {yGridLines.map((y) => (
          <line
            key={`y-${y}`}
            x1={getX(minX)}
            y1={getY(y)}
            x2={getX(maxX)}
            y2={getY(y)}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            strokeDasharray={y === 0 ? "0" : "4 4"}
          />
        ))}

        {/* Outer shield boundary (Reuleaux-like polygon) */}
        <polygon
          points={`
            ${getX(0)},${getY(15)} 
            ${getX(5)},${getY(10)} 
            ${getX(8)},${getY(0)} 
            ${getX(4)},${getY(-8)} 
            ${getX(0)},${getY(-10)} 
            ${getX(-4)},${getY(-8)} 
            ${getX(-8)},${getY(0)} 
            ${getX(-5)},${getY(10)}
          `}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="2"
        />

        {/* Central Axis Lines */}
        <line
          x1={getX(0)}
          y1={getY(minY)}
          x2={getX(0)}
          y2={getY(maxY)}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1.5"
        />
        <line
          x1={getX(minX)}
          y1={getY(0)}
          x2={getX(maxX)}
          y2={getY(0)}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1.5"
        />

        {/* Axis Labels */}
        <text
          x={getX(0)}
          y={getY(15) - 10}
          fill="var(--primary)"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          letterSpacing="1"
        >
          MESOMORFO
        </text>
        <text
          x={getX(-7.5)}
          y={getY(-6.5)}
          fill="var(--error)"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          letterSpacing="1"
        >
          ENDOMORFO
        </text>
        <text
          x={getX(7.5)}
          y={getY(-6.5)}
          fill="#a78bfa"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          letterSpacing="1"
        >
          ECTOMORFO
        </text>

        {/* Central Circle Zone */}
        <circle
          cx={getX(0)}
          cy={getY(0)}
          r="25"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        <text
          x={getX(0)}
          y={getY(0) + 4}
          fill="rgba(255, 255, 255, 0.4)"
          textAnchor="middle"
          fontSize="10"
        >
          Central
        </text>

        {/* Historical Trend Line */}
        {sortedEvals.length > 1 && (
          <path
            d={trendLinePath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
            style={{
              strokeDasharray: "1000",
              strokeDashoffset: "0",
            }}
          />
        )}

        {/* Points Plotting */}
        {sortedEvals.map((ev, index) => {
          const isLatest = index === sortedEvals.length - 1;
          const x = getX(ev.xCoord);
          const y = getY(ev.yCoord);

          return (
            <g key={ev.id || index}>
              {/* Outer pulsing ring for the latest evaluation */}
              {isLatest && (
                <circle
                  cx={x}
                  cy={y}
                  r="12"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    values="6;16;6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0.1;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Core interactive circle */}
              <circle
                cx={x}
                cy={y}
                r={isLatest ? "7" : "5"}
                fill={isLatest ? "var(--primary)" : "rgba(255, 255, 255, 0.8)"}
                stroke={isLatest ? "#060913" : "var(--primary)"}
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={() => setHoveredPoint(ev)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          className="glass-card animate-fade-in"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            right: "10px",
            padding: "12px",
            fontSize: "0.85rem",
            zIndex: 10,
            border: "1px solid var(--primary)",
            background: "rgba(11, 19, 41, 0.95)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontWeight: 600, color: "var(--primary)" }}>
              {hoveredPoint.date}
            </span>
            <span style={{ color: "var(--text-muted)" }}>
              Clasificación: <strong>{hoveredPoint.endomorphy.toFixed(1)} - {hoveredPoint.mesomorphy.toFixed(1)} - {hoveredPoint.ectomorphy.toFixed(1)}</strong>
            </span>
          </div>
          <div>
            <strong>Categoría:</strong> {hoveredPoint.category || "No calculada"}<br />
            <strong>Coordenadas:</strong> X: {hoveredPoint.xCoord.toFixed(2)}, Y: {hoveredPoint.yCoord.toFixed(2)}<br />
            <strong>Grasa Corporal:</strong> {hoveredPoint.bodyFat ? `${hoveredPoint.bodyFat}%` : "N/A"}<br />
            <strong>Peso:</strong> {hoveredPoint.weight} kg | <strong>Altura:</strong> {hoveredPoint.height} cm
          </div>
        </div>
      )}
    </div>
  );
};

export default Somatochart;
