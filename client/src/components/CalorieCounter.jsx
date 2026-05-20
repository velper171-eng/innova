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

  // Math for Ring Progress
  const percentCompleted = Math.min(100, Math.round((totalCaloriesToday / calorieGoal) * 100));
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentCompleted / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
      
      {/* 1. Nutrition Dashboard Card */}
      <div className="glass-card" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        
        {/* Left Side: Summary ring progress */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ position: "relative", width: "120px", height: "120px" }}>
            <svg height="120" width="120" style={{ transform: "rotate(-90deg)" }}>
              <circle
                stroke="rgba(255,255,255,0.05)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={60}
                cy={60}
              />
              <circle
                stroke="var(--primary)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease-in-out" }}
                r={normalizedRadius}
                cx={60}
                cy={60}
                strokeLinecap="round"
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
              <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)" }}>
                {totalCaloriesToday}
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                kcal
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
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
                <span>Meta diaria: <strong>{calorieGoal} kcal</strong> ({percentCompleted}%)</span>
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
        </div>

        {/* Right Side: Macronutrients progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
          {/* Protein */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Proteínas (4 kcal/g)</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>{totalProteinToday.toFixed(1)}g</span>
            </div>
            <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, (totalProteinToday / 150) * 100)}%`, background: "var(--primary)", transition: "width 0.3s" }} />
            </div>
          </div>
          {/* Carbs */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Carbohidratos (4 kcal/g)</span>
              <span style={{ color: "var(--accent)", fontWeight: 700 }}>{totalCarbsToday.toFixed(1)}g</span>
            </div>
            <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, (totalCarbsToday / 250) * 100)}%`, background: "var(--accent)", transition: "width 0.3s" }} />
            </div>
          </div>
          {/* Fat */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Grasas (9 kcal/g)</span>
              <span style={{ color: "#fbbf24", fontWeight: 700 }}>{totalFatToday.toFixed(1)}g</span>
            </div>
            <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, (totalFatToday / 80) * 100)}%`, background: "#fbbf24", transition: "width 0.3s" }} />
            </div>
          </div>
        </div>

      </div>

      {/* 2. Interactive Analyzer (Only in Athlete mode, or Coach mock view) */}
      {!isAdminMode && (
        <div className="grid-2-cols" style={{ gap: "24px" }}>
          
          {/* Form to submit food image & info */}
          <form onSubmit={handleAnalyze} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 className="glow-text" style={{ fontSize: "1.2rem", margin: 0 }}>Analizar Alimento con AI</h4>
            
            {/* Image upload preview area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed rgba(0, 242, 254, 0.2)",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(255,255,255,0.01)",
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
                  <span style={{ fontSize: "0.75rem", color: "var(--text-dark)" }}>
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
              <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "var(--error)", fontSize: "0.85rem" }}>
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
                  <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid #030712", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
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
                  <div style={{ flex: 1, minWidth: "100px", padding: "12px", background: "rgba(0, 242, 254, 0.03)", border: "1px solid rgba(0, 242, 254, 0.15)", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Calorías</span>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>
                      {result.calories} kcal
                    </div>
                  </div>

                  {/* Protein card */}
                  <div style={{ flex: 1, minWidth: "80px", padding: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Proteína</span>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--primary)", marginTop: "4px" }}>
                      {result.protein}g
                    </div>
                  </div>

                  {/* Carbs card */}
                  <div style={{ flex: 1, minWidth: "80px", padding: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Carbos</span>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", marginTop: "4px" }}>
                      {result.carbs}g
                    </div>
                  </div>

                  {/* Fat card */}
                  <div style={{ flex: 1, minWidth: "80px", padding: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Grasa</span>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fbbf24", marginTop: "4px" }}>
                      {result.fat}g
                    </div>
                  </div>
                </div>

                {/* Details textareas */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Desglose de Ingredientes Estimados:</label>
                    <textarea
                      className="form-input"
                      value={result.ingredients || ""}
                      onChange={(e) => setResult(prev => ({ ...prev, ingredients: e.target.value }))}
                      rows={4}
                      style={{ fontSize: "0.85rem", resize: "none", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Preparación:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={result.preparation || ""}
                      onChange={(e) => setResult(prev => ({ ...prev, preparation: e.target.value }))}
                      style={{ fontSize: "0.85rem", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
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
                  background: "rgba(255, 255, 255, 0.01)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "center"
                }}
              >
                {/* Food image if present */}
                {log.imagePath && (
                  <div style={{ width: "64px", height: "64px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
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
                    <div style={{ marginTop: "10px", padding: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "8px", fontSize: "0.8rem" }}>
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
                    style={{ padding: "8px", background: "rgba(244,63,94,0.1)", color: "var(--error)", borderRadius: "50%", width: "36px", height: "36px", flexShrink: 0 }}
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
