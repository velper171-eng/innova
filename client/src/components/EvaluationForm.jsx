import React, { useState, useEffect } from "react";
import { calculateSomatotype, calculateBodyFat } from "../utils/calculator";

const EvaluationForm = ({ onSubmit, onCancel, patient }) => {
  // Tabs: "basic", "skinfolds", "girths_diameters"
  const [activeTab, setActiveTab] = useState("basic");

  // Fields state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");

  // Skinfolds (mm)
  const [skinfoldTriceps, setSkinfoldTriceps] = useState("");
  const [skinfoldBiceps, setSkinfoldBiceps] = useState("");
  const [skinfoldSubescapular, setSkinfoldSubescapular] = useState("");
  const [skinfoldSupraspinale, setSkinfoldSupraspinale] = useState("");
  const [skinfoldCrestaIliaca, setSkinfoldCrestaIliaca] = useState("");
  const [skinfoldAbdominal, setSkinfoldAbdominal] = useState("");
  const [skinfoldThigh, setSkinfoldThigh] = useState("");
  const [skinfoldCalf, setSkinfoldCalf] = useState("");

  // Perimeters (cm)
  const [girthArmRelaxed, setGirthArmRelaxed] = useState("");
  const [girthArmContracted, setGirthArmContracted] = useState("");
  const [girthWaist, setGirthWaist] = useState("");
  const [girthHip, setGirthHip] = useState("");
  const [girthThigh, setGirthThigh] = useState("");
  const [girthCalf, setGirthCalf] = useState("");

  // Diameters (cm)
  const [diameterHumerus, setDiameterHumerus] = useState("");
  const [diameterBiestiloideo, setDiameterBiestiloideo] = useState("");
  const [diameterFemur, setDiameterFemur] = useState("");

  // Live calculation results
  const [results, setResults] = useState(null);

  // Auto-calculate age from patient birthdate
  useEffect(() => {
    if (patient && patient.birthdate) {
      const birth = new Date(patient.birthdate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge > 0 ? calculatedAge : 20);
    }
  }, [patient]);

  // Handle calculations whenever numeric inputs change
  useEffect(() => {
    const data = {
      age: parseInt(age) || 20,
      gender: patient ? patient.gender : "male",
      height: parseFloat(height) || 0,
      weight: parseFloat(weight) || 0,
      skinfoldTriceps: parseFloat(skinfoldTriceps) || 0,
      skinfoldBiceps: parseFloat(skinfoldBiceps) || 0,
      skinfoldSubescapular: parseFloat(skinfoldSubescapular) || 0,
      skinfoldSupraspinale: parseFloat(skinfoldSupraspinale) || 0,
      skinfoldCrestaIliaca: parseFloat(skinfoldCrestaIliaca) || 0,
      skinfoldAbdominal: parseFloat(skinfoldAbdominal) || 0,
      skinfoldThigh: parseFloat(skinfoldThigh) || 0,
      skinfoldCalf: parseFloat(skinfoldCalf) || 0,
      girthArmRelaxed: parseFloat(girthArmRelaxed) || 0,
      girthArmContracted: parseFloat(girthArmContracted) || 0,
      girthWaist: parseFloat(girthWaist) || 0,
      girthHip: parseFloat(girthHip) || 0,
      girthThigh: parseFloat(girthThigh) || 0,
      girthCalf: parseFloat(girthCalf) || 0,
      diameterHumerus: parseFloat(diameterHumerus) || 0,
      diameterBiestiloideo: parseFloat(diameterBiestiloideo) || 0,
      diameterFemur: parseFloat(diameterFemur) || 0,
    };

    if (data.height > 0 && data.weight > 0) {
      const somatotype = calculateSomatotype(data);
      const fat = calculateBodyFat(data);
      
      let fatMass = 0;
      let leanMass = 0;
      if (fat && fat.bodyFat > 0) {
        fatMass = (data.weight * fat.bodyFat) / 100;
        leanMass = data.weight - fatMass;
      }

      setResults({
        somatotype,
        fat,
        fatMass: fatMass.toFixed(2),
        leanMass: leanMass.toFixed(2),
      });
    } else {
      setResults(null);
    }
  }, [
    weight,
    height,
    age,
    skinfoldTriceps,
    skinfoldBiceps,
    skinfoldSubescapular,
    skinfoldSupraspinale,
    skinfoldCrestaIliaca,
    skinfoldAbdominal,
    skinfoldThigh,
    skinfoldCalf,
    girthArmRelaxed,
    girthArmContracted,
    girthWaist,
    girthHip,
    girthThigh,
    girthCalf,
    diameterHumerus,
    diameterBiestiloideo,
    diameterFemur,
    patient,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight || !height || !age || !date) {
      alert("Por favor rellene los campos básicos obligatorios.");
      return;
    }

    onSubmit({
      date,
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: parseInt(age),
      skinfoldTriceps: parseFloat(skinfoldTriceps) || 0,
      skinfoldBiceps: parseFloat(skinfoldBiceps) || 0,
      skinfoldSubescapular: parseFloat(skinfoldSubescapular) || 0,
      skinfoldSupraspinale: parseFloat(skinfoldSupraspinale) || 0,
      skinfoldCrestaIliaca: parseFloat(skinfoldCrestaIliaca) || 0,
      skinfoldAbdominal: parseFloat(skinfoldAbdominal) || 0,
      skinfoldThigh: parseFloat(skinfoldThigh) || 0,
      skinfoldCalf: parseFloat(skinfoldCalf) || 0,
      girthArm: parseFloat(girthArmContracted) || 0, // Backward compatibility
      girthArmRelaxed: parseFloat(girthArmRelaxed) || 0,
      girthArmContracted: parseFloat(girthArmContracted) || 0,
      girthWaist: parseFloat(girthWaist) || 0,
      girthHip: parseFloat(girthHip) || 0,
      girthThigh: parseFloat(girthThigh) || 0,
      girthCalf: parseFloat(girthCalf) || 0,
      diameterHumerus: parseFloat(diameterHumerus) || 0,
      diameterBiestiloideo: parseFloat(diameterBiestiloideo) || 0,
      diameterFemur: parseFloat(diameterFemur) || 0,
    });
  };

  return (
    <div className="grid-1fr-320px animate-fade-in">
      <form onSubmit={handleSubmit} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 className="glow-text" style={{ fontSize: "1.5rem" }}>
          Nueva Evaluación Antropométrica
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "-8px" }}>
          Ingresa los datos del paciente para realizar las estimaciones.
        </p>

        {/* Tab Selector */}
        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "basic" ? "active" : ""}`}
            onClick={() => setActiveTab("basic")}
          >
            Básicos
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "skinfolds" ? "active" : ""}`}
            onClick={() => setActiveTab("skinfolds")}
          >
            Pliegues (mm)
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "perimeters" ? "active" : ""}`}
            onClick={() => setActiveTab("perimeters")}
          >
            Perímetros (cm)
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "diameters" ? "active" : ""}`}
            onClick={() => setActiveTab("diameters")}
          >
            Diámetros (cm)
          </button>
        </div>

        {/* Tab 1: Basic */}
        {activeTab === "basic" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Fecha de Evaluación *</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid-2-cols">
              <div className="form-group">
                <label className="form-label">Peso (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ej. 70.5"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Altura (cm) *</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ej. 175"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Edad Registrada *</label>
              <input
                type="number"
                className="form-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Tab 2: Skinfolds */}
        {activeTab === "skinfolds" && (
          <div className="grid-2-cols">
            <div className="form-group">
              <label className="form-label">Tríceps (mm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={skinfoldTriceps}
                onChange={(e) => setSkinfoldTriceps(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bíceps (mm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={skinfoldBiceps}
                onChange={(e) => setSkinfoldBiceps(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subescapular (mm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={skinfoldSubescapular}
                onChange={(e) => setSkinfoldSubescapular(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Supraespinal (mm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={skinfoldSupraspinale}
                onChange={(e) => setSkinfoldSupraspinale(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cresta Ilíaca (mm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={skinfoldCrestaIliaca}
                onChange={(e) => setSkinfoldCrestaIliaca(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Abdominal (mm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={skinfoldAbdominal}
                onChange={(e) => setSkinfoldAbdominal(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Muslo Medial (mm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={skinfoldThigh}
                onChange={(e) => setSkinfoldThigh(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pantorrilla (mm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={skinfoldCalf}
                onChange={(e) => setSkinfoldCalf(e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Perimeters */}
        {activeTab === "perimeters" && (
          <div className="grid-2-cols">
            <div className="form-group">
              <label className="form-label">Brazo Relajado (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={girthArmRelaxed}
                onChange={(e) => setGirthArmRelaxed(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Brazo Contraído (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={girthArmContracted}
                onChange={(e) => setGirthArmContracted(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cintura (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={girthWaist}
                onChange={(e) => setGirthWaist(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cadera (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={girthHip}
                onChange={(e) => setGirthHip(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Muslo Medio (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={girthThigh}
                onChange={(e) => setGirthThigh(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pantorrilla (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={girthCalf}
                onChange={(e) => setGirthCalf(e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Diameters */}
        {activeTab === "diameters" && (
          <div className="grid-2-cols">
            <div className="form-group">
              <label className="form-label">Bicondilar Húmero (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={diameterHumerus}
                onChange={(e) => setDiameterHumerus(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Biestiloideo Muñeca (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={diameterBiestiloideo}
                onChange={(e) => setDiameterBiestiloideo(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bicondilar Fémur (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={diameterFemur}
                onChange={(e) => setDiameterFemur(e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar Evaluación
          </button>
        </div>
      </form>

      {/* Live Preview Sidebar */}
      <div className="glass-card" style={{ height: "fit-content", background: "rgba(10, 15, 30, 0.8)", border: "1px solid rgba(0, 242, 254, 0.15)" }}>
        <h4 className="glow-text" style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
          Cálculos en Tiempo Real
        </h4>

        {results ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "0.9rem" }}>
            {/* Somatotype values */}
            {results.somatotype && (
              <div>
                <span style={{ color: "var(--text-muted)" }}>Somatotipo (Endo-Meso-Ecto):</span>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--primary)", marginTop: "4px" }}>
                  {results.somatotype.endomorphy.toFixed(1)} - {results.somatotype.mesomorphy.toFixed(1)} - {results.somatotype.ectomorphy.toFixed(1)}
                </div>
                <div style={{ color: "var(--text-main)", marginTop: "2px", fontWeight: "600" }}>
                  {results.somatotype.category}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dark)" }}>
                  Coord X: {results.somatotype.xCoord} | Coord Y: {results.somatotype.yCoord}
                </div>
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)" }} />

            {/* Fat values */}
            {results.fat ? (
              <div>
                <span style={{ color: "var(--text-muted)" }}>Porcentaje de Grasa:</span>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--accent)", marginTop: "4px" }}>
                  {results.fat.bodyFat}%
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dark)" }}>
                  Fórmula: {results.fat.formulaUsed}
                </div>
                <div className="grid-2-cols" style={{ marginTop: "8px" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Masa Grasa</span>
                    <div style={{ fontWeight: "600" }}>{results.fatMass} kg</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Masa Magra</span>
                    <div style={{ fontWeight: "600" }}>{results.leanMass} kg</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.8rem" }}>
                Rellene los pliegues para calcular la grasa (Faulkner: Tríceps, Subescapular, Supraespinal, Cresta Ilíaca; Durnin-Womersley: Bíceps, Tríceps, Subescapular, Supraespinal).
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.9rem" }}>
            Ingresa Peso y Altura para ver los cálculos automáticos.
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationForm;
