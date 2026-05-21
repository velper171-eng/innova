import React, { useState, useEffect, useRef } from "react";

const API_BASE = "/api";

const CalorieCounter = ({ patientId, isAdminMode = false }) => {
  const [logs, setLogs] = useState([]);
  const [calorieGoal, setCalorieGoal] = useState(() => {
    const saved = localStorage.getItem(`calorie_goal_${patientId}`);
    return saved ? parseInt(saved, 10) : 2000;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(calorieGoal);
  
  // Selected Date
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Form inputs
  const [foodName, setFoodName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [preparation, setPreparation] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Status states
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchLogs();
  }, [patientId]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/calories/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Error fetching calorie logs:", err);
    }
  };

  const handleGoalSave = (e) => {
    e.preventDefault();
    const g = parseInt(goalInput, 10) || 2000;
    setCalorieGoal(g);
    localStorage.setItem(`calorie_goal_${patientId}`, g.toString());
    setIsEditingGoal(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setResult(null);
    setErrorMsg("");

    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.append("foodName", foodName);
    formData.append("ingredients", ingredients);
    formData.append("preparation", preparation);

    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/calories/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al analizar el alimento");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error al conectar con el servidor de análisis");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToLog = async () => {
    if (!result) return;
    setSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/calories/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          foodName: result.foodName,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          ingredients: result.ingredients,
          preparation: result.preparation,
          imagePath: result.imagePath
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al guardar el registro");
      }

      await fetchLogs();
      // Clear analysis result and input fields
      setResult(null);
      setFoodName("");
      setIngredients("");
      setPreparation("");
      handleClearImage();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error al guardar en el diario");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro de calorías?")) return;
    try {
      const res = await fetch(`${API_BASE}/calories/logs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logs by selected date
  const filteredLogs = logs.filter(log => log.date === selectedDate);
  const totalCaloriesToday = filteredLogs.reduce((sum, log) => sum + log.calories, 0);
  const totalProteinToday = filteredLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCarbsToday = filteredLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const totalFatToday = filteredLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

  // Math for Concentric Rings
  const pctCalories = Math.min(100, Math.round((totalCaloriesToday / calorieGoal) * 100));
  const pctProtein = Math.min(100, Math.round((totalProteinToday / 150) * 100));
  const pctCarbs = Math.min(100, Math.round((totalCarbsToday / 250) * 100));
  const pctFat = Math.min(100, Math.round((totalFatToday / 80) * 100));

  const getRingOffset = (pct, r) => {
    const circ = 2 * Math.PI * r;
    return circ - (pct / 100) * circ;
  };

  // Helper to build past 7 days calorie compliance
  const getWeeklyData = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates.map(d => {
      const dayLogs = logs.filter(log => log.date === d);
      const dayCalories = dayLogs.reduce((sum, log) => sum + log.calories, 0);
      const dayName = new Date(d + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short" });
      return {
        date: d,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1, 3),
        calories: dayCalories
      };
    });
  };
  const weeklyData = getWeeklyData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
      
      {/* 1. Nutrition Dashboard Card */}
      <div className="glass-card calorie-dashboard-grid">
        
        {/* Left Side: Concentric ring progress */}
        <div className="calorie-summary-left" style={{ flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", width: "140px", height: "140px" }}>
            <svg height="140" width="140" style={{ transform: "rotate(-90deg)" }}>
              {/* Background rings */}
              <circle stroke="rgba(0, 0, 0, 0.05)" fill="transparent" strokeWidth="6" r="58" cx="70" cy="70" />
              <circle stroke="rgba(0, 0, 0, 0.05)" fill="transparent" strokeWidth="6" r="48" cx="70" cy="70" />
              <circle stroke="rgba(0, 0, 0, 0.05)" fill="transparent" strokeWidth="6" r="38" cx="70" cy="70" />
              <circle stroke="rgba(0, 0, 0, 0.05)" fill="transparent" strokeWidth="6" r="28" cx="70" cy="70" />

              {/* Progress rings */}
              <circle
                stroke="#00f2fe" fill="transparent" strokeWidth="6" r="58" cx="70" cy="70"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 58}
                style={{ strokeDashoffset: getRingOffset(pctCalories, 58), transition: "stroke-dashoffset 0.5s ease", filter: "drop-shadow(0 0 4px #00f2fe)" }}
              />
              <circle
                stroke="#f43f5e" fill="transparent" strokeWidth="6" r="48" cx="70" cy="70"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 48}
                style={{ strokeDashoffset: getRingOffset(pctProtein, 48), transition: "stroke-dashoffset 0.5s ease", filter: "drop-shadow(0 0 4px #f43f5e)" }}
              />
              <circle
                stroke="#10b981" fill="transparent" strokeWidth="6" r="38" cx="70" cy="70"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 38}
                style={{ strokeDashoffset: getRingOffset(pctCarbs, 38), transition: "stroke-dashoffset 0.5s ease", filter: "drop-shadow(0 0 4px #10b981)" }}
              />
              <circle
                stroke="#fbbf24" fill="transparent" strokeWidth="6" r="28" cx="70" cy="70"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 28}
                style={{ strokeDashoffset: getRingOffset(pctFat, 28), transition: "stroke-dashoffset 0.5s ease", filter: "drop-shadow(0 0 4px #fbbf24)" }}
              />
            </svg>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
                {totalCaloriesToday}
              </span>
              <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                kcal
              </span>
            </div>
          </div>

          {/* Micro Legend */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00f2fe" }} /> kcal
            </span>
            <span style={{ fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f43f5e" }} /> Prot
            </span>
            <span style={{ fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} /> Carb
            </span>
            <span style={{ fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fbbf24" }} /> Gras
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="glow-text" style={{ fontSize: "1.3rem", margin: 0 }}>Consumo Diario</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{selectedDate}</span>
          </div>

          {/* Calories limit controller */}
          {isEditingGoal ? (
            <form onSubmit={handleGoalSave} style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <input
                type="number"
                className="form-input"
                value={goalInput}
                onChange={(e) => setGoalInput(parseInt(e.target.value) || "")}
                style={{ padding: "6px 10px", fontSize: "0.85rem", maxWidth: "100px" }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                Listo
              </button>
            </form>
          ) : (
            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Meta diaria: <strong>{calorieGoal} kcal</strong> ({pctCalories}%)</span>
              {!isAdminMode && (
                <button
                  type="button"
                  onClick={() => {
                    setGoalInput(calorieGoal);
                    setIsEditingGoal(true);
                  }}
                  style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  ✏️
                </button>
              )}
            </div>
          )}

          {/* Selected Date Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            <label className="form-label" style={{ margin: 0, fontSize: "0.75rem" }}>Ver fecha:</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: "4px 8px", fontSize: "0.8rem", maxWidth: "140px", height: "auto" }}
            />
          </div>
        </div>

        {/* Right Side: Macronutrients progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
          {/* Protein */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Proteínas (4 kcal/g)</span>
              <span style={{ color: "#f43f5e", fontWeight: 700 }}>{totalProteinToday.toFixed(1)}g / 150g</span>
            </div>
            <div style={{ height: "6px", width: "100%", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, (totalProteinToday / 150) * 100)}%`, background: "#f43f5e", transition: "width 0.3s" }} />
            </div>
          </div>
          {/* Carbs */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Carbohidratos (4 kcal/g)</span>
              <span style={{ color: "#10b981", fontWeight: 700 }}>{totalCarbsToday.toFixed(1)}g / 250g</span>
            </div>
            <div style={{ height: "6px", width: "100%", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, (totalCarbsToday / 250) * 100)}%`, background: "#10b981", transition: "width 0.3s" }} />
            </div>
          </div>
          {/* Fat */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Grasas (9 kcal/g)</span>
              <span style={{ color: "#fbbf24", fontWeight: 700 }}>{totalFatToday.toFixed(1)}g / 80g</span>
            </div>
            <div style={{ height: "6px", width: "100%", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, (totalFatToday / 80) * 100)}%`, background: "#fbbf24", transition: "width 0.3s" }} />
            </div>
          </div>
        </div>

      </div>

      {/* 1b. Weekly Compliance Bar Chart */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h4 className="glow-text" style={{ fontSize: "1.15rem", margin: 0 }}>Cumplimiento Semanal de Calorías</h4>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
          Consumo calórico de los últimos 7 días. La línea punteada horizontal marca la meta diaria.
        </p>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: "150px",
          padding: "16px 0 10px 0",
          position: "relative",
          marginTop: "10px"
        }}>
          {/* Dotted target line at 100% height (represented as 80px above baseline) */}
          <div style={{ position: "absolute", bottom: "90px", left: 0, right: 0, borderBottom: "1px dashed #00f2fe", opacity: 0.6, zIndex: 1 }} />
          <span style={{ position: "absolute", bottom: "95px", right: 0, fontSize: "0.65rem", color: "#00f2fe", fontWeight: 600, zIndex: 1 }}>Meta</span>

          {weeklyData.map((wd, idx) => {
            const ratio = wd.calories / calorieGoal;
            const barHeight = Math.min(110, Math.round(ratio * 80)); // 80px represents 100%
            const isGoalMet = wd.calories >= calorieGoal;
            
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1, zIndex: 2 }}>
                <div style={{ height: "110px", width: "18px", background: "rgba(0, 0, 0, 0.03)", border: "1px solid var(--border-color)", borderRadius: "9px", display: "flex", alignItems: "flex-end", overflow: "hidden", position: "relative" }}>
                  <div style={{
                    height: `${barHeight}px`,
                    width: "100%",
                    background: isGoalMet ? "#10b981" : "#00f2fe",
                    borderRadius: "8px",
                    boxShadow: `0 0 8px ${isGoalMet ? "#10b981" : "#00f2fe"}`,
                    transition: "height 0.5s ease"
                  }} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: wd.date === selectedDate ? "bold" : "normal" }}>{wd.dayName}</span>
                <span style={{ fontSize: "0.65rem", color: wd.date === selectedDate ? "var(--text-main)" : "var(--text-muted)", fontWeight: "bold" }}>{wd.calories}</span>
              </div>
            );
          })}
        </div>
      </div>


      {/* 2. Interactive Analyzer (Only in Athlete mode, or Coach mock view) */}
      {!isAdminMode && (
        <div className="calorie-analyzer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* Form to submit food image & info */}
          <form onSubmit={handleAnalyze} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 className="glow-text" style={{ fontSize: "1.2rem", margin: 0 }}>Analizar Alimento con AI</h4>
            
            {/* Image upload preview area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed var(--primary)",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                background: "var(--bg-main)",
                transition: "all var(--transition-fast)",
                position: "relative",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  setImageFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearImage();
                    }}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(0,0,0,0.7)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "2.5rem" }}>📷</span>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: 500 }}>
                    Toma o sube una foto del plato
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Arrastra la imagen o haz clic para abrir tu cámara/galería
                  </span>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            {/* Text details for refinement */}
            <div className="form-group">
              <label className="form-label">Nombre del Plato (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Pollo a la plancha con arroz blanco"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Ingredientes y Cantidades (Opcional)</span>
                <span style={{ fontSize: "0.7rem", color: "var(--primary)" }}>✓ Más Preciso</span>
              </label>
              <textarea
                className="form-input"
                placeholder="Ej: 150g pechuga de pollo, 1 taza de arroz blanco cocido, 1/2 aguacate picado"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                rows={3}
                style={{ resize: "none" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preparación (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Pollo cocinado con 1 cucharada de aceite de oliva, arroz hervido con sal"
                value={preparation}
                onChange={(e) => setPreparation(e.target.value)}
              />
            </div>

            {errorMsg && (
              <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255, 69, 0, 0.08)", border: "1px solid rgba(255, 69, 0, 0.2)", color: "var(--error)", fontSize: "0.85rem" }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={analyzing}
              style={{ padding: "12px", fontSize: "1rem" }}
            >
              {analyzing ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  Analizando Plato...
                </div>
              ) : (
                "🥗 Analizar Plato con AI"
              )}
            </button>
          </form>

          {/* Results column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {result ? (
              <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                  <div>
                    <h4 style={{ fontSize: "1.2rem", color: "var(--text-main)" }}>Resultado del Análisis</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Plato: {result.foodName}</span>
                  </div>
                  {result.simulated ? (
                    <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "6px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "var(--warning)", fontWeight: 600 }}>
                      Simulado Local
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "6px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--success)", fontWeight: 600 }}>
                      Gemini AI Real
                    </span>
                  )}
                </div>

                {/* Micro KPIs layout */}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {/* Calories ring card */}
                  <div style={{ flex: 1, minWidth: "100px", padding: "12px", background: "var(--primary-glow)", border: "1px solid var(--primary)", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Calorías</span>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>
                      {result.calories} kcal
                    </div>
                  </div>

                  {/* Protein card */}
                  <div style={{ flex: 1, minWidth: "80px", padding: "12px", background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Proteína</span>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--primary)", marginTop: "4px" }}>
                      {result.protein}g
                    </div>
                  </div>

                  {/* Carbs card */}
                  <div style={{ flex: 1, minWidth: "80px", padding: "12px", background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Carbos</span>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginTop: "4px" }}>
                      {result.carbs}g
                    </div>
                  </div>

                  {/* Fat card */}
                  <div style={{ flex: 1, minWidth: "80px", padding: "12px", background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Grasa</span>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fbbf24", marginTop: "4px" }}>
                      {result.fat}g
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Desglose de Ingredientes Estimados:</label>
                    <textarea
                      className="form-input"
                      value={result.ingredients || ""}
                      onChange={(e) => setResult(prev => ({ ...prev, ingredients: e.target.value }))}
                      rows={4}
                      style={{ fontSize: "0.85rem", resize: "none", background: "#ffffff", border: "1px dashed var(--border-color)" }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Preparación:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={result.preparation || ""}
                      onChange={(e) => setResult(prev => ({ ...prev, preparation: e.target.value }))}
                      style={{ fontSize: "0.85rem", background: "#ffffff", border: "1px dashed var(--border-color)" }}
                    />
                  </div>
                </div>
 
                {/* Action buttons */}
                <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setResult(null)}
                    style={{ flex: 1, padding: "8px 16px", fontSize: "0.85rem" }}
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={saving}
                    onClick={handleSaveToLog}
                    style={{ flex: 2, padding: "8px 16px", fontSize: "0.85rem" }}
                  >
                    {saving ? "Guardando..." : "✓ Guardar en mi Diario"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 20px", flex: 1 }}>
                <span style={{ fontSize: "2rem" }}>🥗</span>
                <h5 style={{ fontSize: "1rem", color: "var(--text-main)", marginTop: "12px", marginBottom: "6px" }}>
                  Estimador Inteligente Inactivo
                </h5>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "320px", margin: 0 }}>
                  Completa los campos a la izquierda y sube una foto de tu alimento para recibir una estimación del valor calórico y nutricional.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. Daily Logs Timeline / History List */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h4 className="glow-text" style={{ fontSize: "1.2rem", margin: 0 }}>
          {isAdminMode ? "Diario de Alimentos Registrados" : "Mi Historial de Alimentos de Hoy"}
        </h4>

        {filteredLogs.length === 0 ? (
          <div style={{ color: "var(--text-dark)", textAlign: "center", padding: "40px", fontStyle: "italic", fontSize: "0.9rem" }}>
            Aún no se han registrado comidas en la fecha seleccionada ({selectedDate}).
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "center"
                }}
              >
                {/* Food image if present */}
                {log.imagePath && (
                  <div style={{ width: "64px", height: "64px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)", flexShrink: 0 }}>
                    <img
                      src={`${API_BASE}${log.imagePath}`}
                      alt={log.foodName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h5 style={{ fontSize: "1.05rem", color: "var(--text-main)", fontWeight: 600 }}>{log.foodName}</h5>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-dark)" }}>
                        Registrado a las: {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.1rem" }}>
                        {log.calories} kcal
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <span>P: <strong>{log.protein ? `${log.protein}g` : "N/A"}</strong></span>
                    <span>C: <strong>{log.carbs ? `${log.carbs}g` : "N/A"}</strong></span>
                    <span>G: <strong>{log.fat ? `${log.fat}g` : "N/A"}</strong></span>
                  </div>

                  {/* Collapsible/Show ingredients list */}
                  {(log.ingredients || log.preparation) && (
                    <div style={{ marginTop: "10px", padding: "10px", background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.8rem" }}>
                      {log.ingredients && (
                        <div style={{ whiteSpace: "pre-line", color: "var(--text-muted)" }}>
                          <strong>Ingredientes:</strong><br />
                          {log.ingredients}
                        </div>
                      )}
                      {log.preparation && (
                        <div style={{ marginTop: "6px", color: "var(--text-muted)" }}>
                          <strong>Preparación:</strong> {log.preparation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
 
                {!isAdminMode && (
                  <button
                    className="btn"
                    style={{ padding: "8px", background: "rgba(255, 69, 0, 0.08)", color: "var(--error)", borderRadius: "50%", width: "36px", height: "36px", flexShrink: 0 }}
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Embedded CSS animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default CalorieCounter;
