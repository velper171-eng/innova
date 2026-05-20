import React, { useState, useEffect } from "react";
import CalorieCounter from "./CalorieCounter";

const API_BASE = "/api";

const AthleteView = ({ patientId, onBack }) => {
  const [reminders, setReminders] = useState([]);
  const [workoutTime, setWorkoutTime] = useState("18:00");
  const [activeDays, setActiveDays] = useState("Lunes,Miércoles,Viernes");
  const [supplements, setSupplements] = useState([]);
  const [cycles, setCycles] = useState([]);
  
  // UI toggles
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isAddingSupplement, setIsAddingSupplement] = useState(false);
  const [athleteTab, setAthleteTab] = useState("supplements"); // "supplements", "calories"

  
  // New supplement form state
  const [newSupName, setNewSupName] = useState("");
  const [newSupBrand, setNewSupBrand] = useState("");
  const [newSupCap, setNewSupCap] = useState("");
  const [newSupRem, setNewSupRem] = useState("");
  const [newSupUnit, setNewSupUnit] = useState("g");
  const [newSupLink, setNewSupLink] = useState("");

  useEffect(() => {
    fetchData();
    requestNotificationPermission();
  }, [patientId]);

  const fetchData = async () => {
    try {
      // Get reminders
      const remRes = await fetch(`${API_BASE}/patients/${patientId}/reminders`);
      if (remRes.ok) {
        const data = await remRes.json();
        setReminders(data.reminders || []);
        setWorkoutTime(data.workoutTime);
        setActiveDays(data.activeDays);
        
        // Trigger browser notification if a reminder is pending
        triggerBrowserNotifications(data.reminders || []);
      }

      // Get supplements
      const supRes = await fetch(`${API_BASE}/patients/${patientId}/supplements`);
      if (supRes.ok) {
        const sups = await supRes.json();
        setSupplements(sups);
      }

      // Get cycles
      const cycRes = await fetch(`${API_BASE}/patients/${patientId}/cycles`);
      if (cycRes.ok) {
        const cycs = await cycRes.json();
        setCycles(cycs);
      }
    } catch (err) {
      console.error("Error loading athlete data:", err);
    }
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const triggerBrowserNotifications = (remList) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    // Find any pending reminder
    const pending = remList.find(r => r.status === "pending");
    if (pending) {
      const now = new Date();
      const [rHour, rMin] = pending.scheduledTime.split(":").map(Number);
      
      // Trigger notification if target time is today and within 30 minutes
      const rTime = new Date();
      rTime.setHours(rHour, rMin, 0, 0);
      
      const diffMs = Math.abs(now - rTime);
      const diffMins = diffMs / (1000 * 60);

      if (diffMins < 30) {
        new Notification(`Recordatorio de Suplemento: ${pending.cycleName}`, {
          body: `Es hora de tu toma de ${pending.dailyDose}g (${pending.timingType}). ¡No pierdas tu racha!`,
          icon: "/favicon.svg"
        });
      }
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutTime, activeDays }),
      });
      if (res.ok) {
        setIsEditingSchedule(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSupplement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/supplements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSupName,
          brand: newSupBrand,
          totalCapacity: newSupCap,
          remainingQuantity: newSupRem,
          unit: newSupUnit,
          purchaseLink: newSupLink
        }),
      });
      if (res.ok) {
        setIsAddingSupplement(false);
        // Clear inputs
        setNewSupName("");
        setNewSupBrand("");
        setNewSupCap("");
        setNewSupRem("");
        setNewSupLink("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogIntake = async (cycleId, dose, status) => {
    const today = new Date().toISOString().split("T")[0];
    const time = new Date().toTimeString().split(" ")[0].substring(0, 5);

    try {
      const res = await fetch(`${API_BASE}/cycles/${cycleId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, time, doseTaken: dose, status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSupplement = async (id) => {
    if (!window.confirm("¿Deseas eliminar este suplemento?")) return;
    try {
      await fetch(`${API_BASE}/supplements/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Streak
  const getStreakCount = () => {
    // Collect all unique logged dates that are "taken" across active cycles
    const takenDates = new Set();
    cycles.forEach(c => {
      c.logs.forEach(l => {
        if (l.status === "taken") {
          takenDates.add(l.date);
        }
      });
    });

    let streak = 0;
    const checkDate = new Date();
    
    // Scan backwards from today to find consecutive streak
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (takenDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has no log yet, it might still continue the streak if yesterday is logged
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split("T")[0];
          if (takenDates.has(yesterdayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
            streak = 1;
            continue;
          }
        }
        break;
      }
    }
    return streak;
  };

  // Build calendar matrix (past 30 days)
  const getPast30DaysGrid = () => {
    const grid = [];
    const today = new Date();

    // Map logs for color encoding
    const dateStatusMap = {};
    cycles.forEach(c => {
      c.logs.forEach(l => {
        dateStatusMap[l.date] = l.status;
      });
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      grid.push({
        dateStr,
        dayNum: d.getDate(),
        status: dateStatusMap[dateStr] || "none" // "taken", "skipped", "none"
      });
    }
    return grid;
  };

  const streak = getStreakCount();
  const past30Days = getPast30DaysGrid();

  // Monitor online status dynamically
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 0 40px", width: "100%" }} className="animate-fade-in">
      
      {/* Mobile Nav Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Regresar CRM
        </button>
        <div style={{ textAlign: "right" }}>
          <h3 className="glow-text" style={{ fontSize: "1.2rem", margin: 0 }}>Modo Atleta</h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Consola Portátil</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="athlete-tabs" style={{ marginBottom: "24px" }}>
        <button
          className={`athlete-tab-btn ${athleteTab === "supplements" ? "active" : ""}`}
          onClick={() => setAthleteTab("supplements")}
        >
          💊 Plan de Suplementos
        </button>
        <button
          className={`athlete-tab-btn ${athleteTab === "calories" ? "active" : ""}`}
          onClick={() => setAthleteTab("calories")}
        >
          🥗 Conteo de Calorías
        </button>
      </div>

      {athleteTab === "supplements" ? (
        <>
          {/* PWA Cloud Sync Status Panel */}
          <div className="glass-card animate-fade-in" style={{
            marginBottom: "20px",
            padding: "12px 16px",
            background: "var(--primary-glow)",
            border: "1px solid var(--primary)",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "8px",
                height: "8px",
                background: isOnline ? "var(--success)" : "#fbbf24",
                borderRadius: "50%",
                boxShadow: isOnline ? "0 0 8px var(--success)" : "0 0 8px #fbbf24"
              }} />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)" }}>
                {isOnline ? "PWA Online: Sincronizado" : "PWA Offline: Modo Gimnasio (Local)"}
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              Serverless & MongoDB
            </span>
          </div>

          {/* 1. Daily reminders & intake checkoffs */}
          <section className="glass-card" style={{ marginBottom: "20px" }}>
            <h4 className="glow-text" style={{ fontSize: "1.2rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "var(--primary)", boxShadow: "var(--shadow-glow)" }} />
              Tomas Programadas para Hoy
            </h4>

            {reminders.length === 0 ? (
              <div style={{ color: "var(--text-dark)", textAlign: "center", padding: "20px", fontStyle: "italic" }}>
                No hay ciclos de suplementación activos hoy.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {reminders.map((rem, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: rem.status === "taken" ? "rgba(0, 191, 255, 0.08)" : rem.status === "skipped" ? "rgba(255, 69, 0, 0.08)" : "var(--bg-main)",
                      border: `1px solid ${rem.status === "taken" ? "var(--success)" : rem.status === "skipped" ? "var(--error)" : "var(--border-color)"}`,
                      borderRadius: "12px",
                      padding: "16px",
                    }}
                  >
                    <div style={{ display: "flex", justifycontent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h5 style={{ fontSize: "1.05rem", color: "var(--text-main)", fontWeight: 600 }}>{rem.cycleName}</h5>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          Dosis: <strong>{rem.dailyDose} {rem.stock?.unit || "g"}</strong> | Hora: <strong>{rem.scheduledTime}</strong> ({rem.timingType})
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontWeight: 600,
                          background: rem.status === "taken" ? "rgba(0,191,255,0.15)" : rem.status === "skipped" ? "rgba(255,69,0,0.15)" : "var(--bg-main)",
                          color: rem.status === "taken" ? "var(--success)" : rem.status === "skipped" ? "var(--error)" : "var(--text-muted)"
                        }}
                      >
                        {rem.status === "taken" ? "Tomado" : rem.status === "skipped" ? "Omitido" : "Pendiente"}
                      </span>
                    </div>

                    {/* Low Stock Warning */}
                    {rem.stock?.isLowStock && (
                      <div style={{ marginTop: "12px", padding: "8px 12px", background: "rgba(255, 69, 0, 0.08)", border: "1px solid rgba(255, 69, 0, 0.2)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--error)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>⚠️ ¡Quedan aprox. <strong>{rem.stock.daysRemaining} días</strong> ({rem.stock.remainingQuantity.toFixed(1)} {rem.stock.unit})!</span>
                        {rem.stock.purchaseLink && (
                          <a
                            href={rem.stock.purchaseLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn"
                            style={{ padding: "4px 8px", fontSize: "0.75rem", background: "var(--error)", color: "white" }}
                          >
                            Recomprar
                          </a>
                        )}
                      </div>
                    )}

                    {/* Big Action Checkboxes for gym use */}
                    {rem.status === "pending" && (
                      <div className="grid-2-cols" style={{ gap: "12px", marginTop: "14px" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "10px", fontSize: "0.85rem", color: "var(--error)" }}
                          onClick={() => handleLogIntake(rem.cycleId, rem.dailyDose, "skipped")}
                        >
                          Omitir
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "10px", fontSize: "0.85rem" }}
                          onClick={() => handleLogIntake(rem.cycleId, rem.dailyDose, "taken")}
                        >
                          ✓ Tomar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 2. Streak Adherence and Calendar */}
          <section className="glass-card" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 className="glow-text" style={{ fontSize: "1.2rem" }}>Racha de Adherencia</h4>
              <div style={{ background: "rgba(0, 191, 255, 0.08)", border: "1px solid var(--success)", padding: "4px 10px", borderRadius: "12px", fontSize: "0.85rem", color: "var(--success)", fontWeight: 700 }}>
                🔥 {streak} Días de Racha
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
              Registro de cumplimiento de los últimos 30 días. Mantén las celdas verdes.
            </p>

            {/* 30 day mini calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
              {past30Days.map((day, idx) => (
                <div
                  key={idx}
                  title={day.dateStr}
                  style={{
                    aspectRatio: "1/1",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: day.status === "taken" ? "rgba(0, 191, 255, 0.25)" : day.status === "skipped" ? "rgba(255, 69, 0, 0.2)" : "var(--bg-main)",
                    border: `1px solid ${day.status === "taken" ? "var(--success)" : day.status === "skipped" ? "var(--error)" : "var(--border-color)"}`,
                    color: day.status !== "none" ? "var(--text-main)" : "var(--text-muted)"
                  }}
                >
                  {day.dayNum}
                </div>
              ))}
            </div>
          </section>

          {/* 3. Workout schedule editor */}
          <section className="glass-card" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ fontSize: "1.1rem" }}>Horario de Entrenamiento</h4>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Hora: <strong>{workoutTime}</strong> | Días: <strong>{activeDays}</strong>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                onClick={() => setIsEditingSchedule(!isEditingSchedule)}
              >
                {isEditingSchedule ? "Cerrar" : "Ajustar"}
              </button>
            </div>

            {isEditingSchedule && (
              <form onSubmit={handleSaveSchedule} style={{ marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Hora del Entrenamiento (HH:MM)</label>
                  <input
                    type="time"
                    className="form-input"
                    value={workoutTime}
                    onChange={(e) => setWorkoutTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Días Activos (separados por comas)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={activeDays}
                    onChange={(e) => setActiveDays(e.target.value)}
                    placeholder="Lunes,Miércoles,Viernes"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-end", padding: "8px 16px", fontSize: "0.85rem" }}>
                  Guardar Horario
                </button>
              </form>
            )}
          </section>

          {/* 4. Supplement inventory & Replenishment warnings */}
          <section className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 className="glow-text" style={{ fontSize: "1.2rem" }}>Mi Inventario de Suplementos</h4>
              <button
                className="btn btn-primary"
                style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                onClick={() => setIsAddingSupplement(!isAddingSupplement)}
              >
                {isAddingSupplement ? "Cancelar" : "+ Agregar"}
              </button>
            </div>

            {/* Add supplement form */}
            {isAddingSupplement && (
              <form onSubmit={handleAddSupplement} style={{ marginBottom: "20px", padding: "16px", background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="grid-2-cols" style={{ gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Nombre *</label>
                    <input type="text" className="form-input" value={newSupName} onChange={(e) => setNewSupName(e.target.value)} placeholder="Ej. Creatina" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Marca</label>
                    <input type="text" className="form-input" value={newSupBrand} onChange={(e) => setNewSupBrand(e.target.value)} placeholder="Ej. Evolufit" />
                  </div>
                </div>
                <div className="grid-3-cols" style={{ gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Capacidad Total *</label>
                    <input type="number" className="form-input" value={newSupCap} onChange={(e) => setNewSupCap(e.target.value)} placeholder="300" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cant. Restante *</label>
                    <input type="number" className="form-input" value={newSupRem} onChange={(e) => setNewSupRem(e.target.value)} placeholder="300" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unidad</label>
                    <select className="form-select" value={newSupUnit} onChange={(e) => setNewSupUnit(e.target.value)}>
                      <option value="g">gramos (g)</option>
                      <option value="caps">cápsulas</option>
                      <option value="scoops">scoops</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Enlace Recompra (WhatsApp / Tienda)</label>
                  <input type="url" className="form-input" value={newSupLink} onChange={(e) => setNewSupLink(e.target.value)} placeholder="https://wa.me/..." />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-end" }}>
                  Agregar al Stock
                </button>
              </form>
            )}

            {/* Inventory list */}
            {supplements.length === 0 ? (
              <div style={{ color: "var(--text-dark)", textAlign: "center", padding: "20px", fontStyle: "italic" }}>
                No hay suplementos registrados en inventario.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {supplements.map((sup) => {
                  const percent = Math.min(100, Math.round((sup.remainingQuantity / sup.totalCapacity) * 100));
                  const isLow = sup.remainingQuantity <= (sup.totalCapacity * 0.15) || percent <= 15;

                  return (
                    <div key={sup.id} style={{ background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div>
                          <h5 style={{ fontWeight: 600, fontSize: "1rem" }}>{sup.name}</h5>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{sup.brand || "Genérico"}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: 700, color: isLow ? "var(--error)" : "var(--primary)" }}>
                            {sup.remainingQuantity} / {sup.totalCapacity} {sup.unit}
                          </span>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-dark)" }}>{percent}% restante</div>
                        </div>
                      </div>

                      {/* Stock progress bar */}
                      <div style={{ height: "6px", width: "100%", background: "rgba(112, 128, 144, 0.15)", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
                        <div style={{ height: "100%", width: `${percent}%`, background: isLow ? "var(--error)" : "var(--primary)", transition: "width 0.3s" }} />
                      </div>

                      {/* Stock alerts & Reorder */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                        <button
                          className="btn"
                          style={{ padding: "4px 8px", fontSize: "0.75rem", background: "rgba(255, 69, 0, 0.08)", color: "var(--error)" }}
                          onClick={() => handleDeleteSupplement(sup.id)}
                        >
                          Eliminar
                        </button>
                        {isLow && sup.purchaseLink && (
                          <a
                            href={sup.purchaseLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.75rem", display: "inline-flex", gap: "4px" }}
                          >
                            ⚡ Recomprar
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : (
        <CalorieCounter patientId={patientId} />
      )}

    </div>
  );
};

export default AthleteView;
