import React from "react";

const SomatotypeBodyVisualizer = ({ evaluations = [], activeTab = "anthropometry", setActiveTab }) => {
  // ─── Data ─────────────────────────────────────────────────────────────────
  const sortedEvals = [...evaluations].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestEval = sortedEvals[sortedEvals.length - 1] || null;

  let endo = 3.0, meso = 4.0, ecto = 3.0;
  let bodyFat = 15.0, weight = 70.0, height = 175.0;
  let category = "Mesomorfo Balanceado";

  if (latestEval) {
    endo     = latestEval.endomorphy || latestEval.endo || 3.0;
    meso     = latestEval.mesomorphy || latestEval.meso || 4.0;
    ecto     = latestEval.ectomorphy || latestEval.ecto || 3.0;
    bodyFat  = latestEval.bodyFat    || 15.0;
    weight   = latestEval.weight     || 70.0;
    height   = latestEval.height     || 175.0;
    category = latestEval.category   || "Mesomorfo Balanceado";
  }

  const leanMass = Math.max(0, Math.min(100, 100 - bodyFat));
  const fatPct   = Math.max(0, Math.min(100, bodyFat));

  // ─── Dominant somatotype ──────────────────────────────────────────────────
  let dominant = "mesomorph";
  if (endo > meso && endo > ecto) dominant = "endomorph";
  else if (ecto > endo && ecto > meso) dominant = "ectomorph";

  // ─── Morph scale ──────────────────────────────────────────────────────────
  const dEndo = endo - 3.0, dMeso = meso - 4.0, dEcto = ecto - 3.0;
  let scaleX = Math.max(0.78, Math.min(1.22, 1.0 + dEndo * 0.06 + dMeso * 0.02 - dEcto * 0.06));
  let scaleY = Math.max(0.94, Math.min(1.06, 1.0 + dEcto * 0.015 - dEndo * 0.01));

  // ─── Body image ───────────────────────────────────────────────────────────
  const bodyImages = {
    ectomorph:  { src: "/ectomorph_body.png",  maxH: 420 },
    endomorph:  { src: "/endomorph_body.png",  maxH: 420 },
    mesomorph:  { src: "/athletic_body.png",   maxH: 420 },
  };
  const bodyImg = bodyImages[dominant];

  // ─── Gauge bar component ──────────────────────────────────────────────────
  const GAUGE_H = 280;

  const Gauge = ({ pct, label, emoji, colorTop, colorBot, textColor, side }) => (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 6, width: 64, userSelect: "none",
    }}>
      <span style={{ fontSize: "1.3rem" }}>{emoji}</span>
      <span style={{
        fontSize: "0.68rem", fontWeight: 800, color: "#4e6a73",
        textTransform: "uppercase", letterSpacing: "0.05em",
        textAlign: "center", lineHeight: 1.2,
      }}>{label}</span>

      {/* Track */}
      <div style={{
        position: "relative", width: 22, height: GAUGE_H,
        background: "rgba(35,127,148,0.08)", borderRadius: 12,
        overflow: "hidden", border: "1px solid rgba(35,127,148,0.15)",
        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.06)",
      }}>
        {/* Fill animates from bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${pct}%`,
          background: `linear-gradient(to top, ${colorBot}, ${colorTop})`,
          borderRadius: 12,
          transition: "height 1s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 10px ${colorTop}55`,
        }} />
        {/* Tick marks */}
        {[25, 50, 75].map(t => (
          <div key={t} style={{
            position: "absolute", left: 0, right: 0,
            bottom: `${t}%`, height: 1,
            background: "rgba(255,255,255,0.5)",
          }} />
        ))}
      </div>

      <span style={{
        fontSize: "1.4rem", fontWeight: 900, color: textColor,
        lineHeight: 1, letterSpacing: "-0.02em",
      }}>{pct.toFixed(1)}%</span>
    </div>
  );

  // ─── Styles ────────────────────────────────────────────────────────────────
  const card = {
    background: "linear-gradient(180deg, #e7f1f3 0%, #edf4f5 100%)",
    border: "1px solid #b8cdd2",
    borderRadius: 24,
    padding: "24px 16px",
    boxShadow: "0 10px 30px rgba(35,127,148,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
    color: "#1e3b43",
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex", flexDirection: "column", gap: 20,
    position: "relative",
  };

  return (
    <div style={card}>

      {/* ── Title ──────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#237f94" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="9" width="3" height="6" rx="1"/><rect x="19" y="9" width="3" height="6" rx="1"/>
          <line x1="5" y1="12" x2="19" y2="12" strokeWidth="3" stroke="#237f94"/>
          <rect x="5" y="7" width="2" height="10" rx="0.5"/><rect x="17" y="7" width="2" height="10" rx="0.5"/>
        </svg>
        <h2 style={{
          fontSize: "1.3rem", fontWeight: 800, textAlign: "center",
          margin: 0, color: "#0f2d37", letterSpacing: "0.03em",
          lineHeight: 1.2, textTransform: "uppercase",
        }}>
          Tablero de Datos Antropométricos y Corporales
        </h2>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#237f94" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="9" width="3" height="6" rx="1"/><rect x="19" y="9" width="3" height="6" rx="1"/>
          <line x1="5" y1="12" x2="19" y2="12" strokeWidth="3" stroke="#237f94"/>
          <rect x="5" y="7" width="2" height="10" rx="0.5"/><rect x="17" y="7" width="2" height="10" rx="0.5"/>
        </svg>
      </div>

      {/* ── Somatotype badge ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span style={{
          background: "rgba(35,127,148,0.1)", border: "1px solid rgba(35,127,148,0.3)",
          borderRadius: 16, padding: "4px 16px",
          fontSize: "0.85rem", fontWeight: 700, color: "#237f94",
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          {dominant === "ectomorph" && "Ectomorfo ⚡"}
          {dominant === "mesomorph" && "Mesomorfo 🔥"}
          {dominant === "endomorph" && "Endomorfo 🥑"}
        </span>
      </div>

      {/* ── Body + Gauges ─────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 16, padding: "8px 0",
      }}>

        {/* Left gauge: Body Fat */}
        <Gauge
          pct={fatPct}
          label="Grasa Corporal"
          emoji="🥑"
          colorTop="#f4a76f"
          colorBot="#e07a5f"
          textColor="#c0553a"
          side="left"
        />

        {/* Body silhouette — clean, no chart behind */}
        <div style={{
          flex: 1, display: "flex", justifyContent: "center", alignItems: "center",
          position: "relative", minHeight: GAUGE_H + 40,
        }}>
          {/* Shadow ellipse */}
          <div style={{
            position: "absolute", bottom: 0, left: "50%",
            transform: "translateX(-50%)",
            width: 80, height: 16,
            background: "radial-gradient(ellipse, rgba(35,127,148,0.2) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <img
            src={bodyImg.src}
            alt="Silueta corporal"
            style={{
              maxHeight: bodyImg.maxH,
              width: "auto",
              objectFit: "contain",
              transform: `scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`,
              transformOrigin: "center bottom",
              transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
              filter: "drop-shadow(0 8px 24px rgba(35,127,148,0.18))",
              display: "block",
            }}
          />
        </div>

        {/* Right gauge: Lean Mass */}
        <Gauge
          pct={leanMass}
          label="Masa Magra"
          emoji="💪"
          colorTop="#34d399"
          colorBot="#10b981"
          textColor="#0a7a54"
          side="right"
        />
      </div>

      {/* ── Horizontal stacked composition bar ────────────────────────────── */}
      <div style={{ padding: "0 12px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: "0.75rem", fontWeight: 700, color: "#4e6a73",
          marginBottom: 6,
        }}>
          <span>Composición Corporal</span>
          <span style={{ color: "#237f94" }}>Peso total: {weight} kg</span>
        </div>
        <div style={{
          display: "flex", height: 28, borderRadius: 14, overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          {/* Lean mass segment */}
          <div style={{
            width: `${leanMass}%`,
            background: "linear-gradient(90deg, #10b981, #34d399)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          }}>
            {leanMass > 15 && (
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>
                💪 {leanMass.toFixed(1)}%
              </span>
            )}
          </div>
          {/* Fat segment */}
          <div style={{
            width: `${fatPct}%`,
            background: "linear-gradient(90deg, #f4a76f, #e07a5f)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          }}>
            {fatPct > 8 && (
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>
                🥑 {fatPct.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700 }}>▲ Masa Magra</span>
          <span style={{ fontSize: "0.7rem", color: "#e07a5f", fontWeight: 700 }}>Grasa Corporal ▲</span>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        borderTop: "1.5px solid rgba(35,127,148,0.15)",
        paddingTop: 20, textAlign: "center",
        position: "relative", margin: "0 8px",
      }}>
        <div style={{ paddingRight: 12 }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#4e6a73", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Peso</h4>
          <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#0f2d37", margin: "6px 0", lineHeight: 1 }}>{weight} kg</div>
          <p style={{ fontSize: "0.72rem", color: "#688089", margin: 0, fontStyle: "italic" }}>Última evaluación</p>
        </div>
        <div style={{ position: "absolute", left: "50%", top: 20, bottom: 0, width: 1.5, background: "rgba(35,127,148,0.15)", transform: "translateX(-50%)" }} />
        <div style={{ paddingLeft: 12 }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#4e6a73", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Grasa Corporal</h4>
          <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#0f2d37", margin: "6px 0", lineHeight: 1 }}>{fatPct.toFixed(1)}%</div>
          <p style={{ fontSize: "0.72rem", color: "#688089", margin: 0, fontStyle: "italic" }}>Masa magra: {leanMass.toFixed(1)}%</p>
        </div>
      </div>

      {/* ── Somatotype scores ──────────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, background: "rgba(255,255,255,0.4)", borderRadius: 16,
        padding: "10px 16px", border: "1px solid rgba(35,127,148,0.08)", margin: "0 8px",
      }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#4e6a73" }}>
          Categoría: <span style={{ color: "#0f2d37" }}>{category}</span>
        </span>
        <div style={{ display: "flex", gap: 6, fontSize: "0.76rem" }}>
          <span style={{ padding: "3px 8px", background: "rgba(255,69,0,0.08)", border: "1px solid rgba(255,69,0,0.15)", borderRadius: 8, color: "#cf3c00", fontWeight: 700 }}>Endo {endo.toFixed(1)}</span>
          <span style={{ padding: "3px 8px", background: "rgba(50,205,50,0.08)", border: "1px solid rgba(50,205,50,0.15)", borderRadius: 8, color: "#249c24", fontWeight: 700 }}>Meso {meso.toFixed(1)}</span>
          <span style={{ padding: "3px 8px", background: "rgba(0,191,255,0.08)", border: "1px solid rgba(0,191,255,0.15)", borderRadius: 8, color: "#008ac7", fontWeight: 700 }}>Ecto {ecto.toFixed(1)}</span>
        </div>
      </div>

      {/* ── Nav tabs ───────────────────────────────────────────────────────── */}
      {setActiveTab && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          background: "rgba(200,220,222,0.4)", border: "1px solid rgba(35,127,148,0.12)",
          borderRadius: 18, padding: "8px 4px", margin: "10px 8px 0 8px",
        }}>
          {[
            { tab: "nutrition",     icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v6a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V3"/><path d="M8 3v9M8 12v9M16 3c-1.5 0-3 1.5-3 4.5s1.5 4.5 3 4.5 3-1.5 3-4.5S17.5 3 16 3z"/><path d="M16 12v9"/></svg>, label: "Alimentación" },
            { tab: "anthropometry", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 6v4M11 6v4M15 6v4M19 6v4M7 14v4M11 14v4M15 14v4"/></svg>, label: "Antropometría" },
            { tab: "training",      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="8" width="4" height="8" rx="1"/><rect x="18" y="8" width="4" height="8" rx="1"/><line x1="6" y1="12" x2="18" y2="12"/><rect x="5" y="6" width="2" height="12" rx="0.5"/><rect x="17" y="6" width="2" height="12" rx="0.5"/></svg>, label: "Entrenamiento" },
            { tab: "progress",      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/><path d="M15 8h4v4"/></svg>, label: "Progreso" },
          ].map(({ tab, icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab === "progress" ? "anthropometry" : tab)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                color: activeTab === tab ? "#0f2d37" : "#526c75",
                opacity: activeTab === tab ? 1 : 0.7,
                outline: "none", transition: "all 0.3s ease",
              }}
            >
              {icon}
              <span style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase" }}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SomatotypeBodyVisualizer;
