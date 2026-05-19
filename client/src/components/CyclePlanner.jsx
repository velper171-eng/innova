import React, { useState, useEffect } from "react";

const CyclePlanner = ({ patientId, supplements = [], onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [supplementId, setSupplementId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [presetName, setPresetName] = useState("creatine_loading");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !startDate || !presetName) {
      setError("Por favor complete todos los campos obligatorios.");
      return;
    }

    onSubmit({
      name,
      supplementId: supplementId ? parseInt(supplementId) : null,
      startDate,
      presetName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h3 className="glow-text" style={{ fontSize: "1.5rem" }}>
        Programar Ciclo de Suplementación
      </h3>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "-8px" }}>
        Define el protocolo del atleta. El sistema estructurará automáticamente las fases según el peso registrado.
      </p>

      {error && (
        <div style={{ color: "var(--error)", padding: "10px", borderRadius: "6px", background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)" }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Nombre del Ciclo *</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Creatina Carga + Mantenimiento"
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="form-group">
          <label className="form-label">Suplemento del Inventario</label>
          <select
            className="form-select"
            value={supplementId}
            onChange={(e) => setSupplementId(e.target.value)}
          >
            <option value="">-- No vincular a inventario --</option>
            {supplements.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name} ({sup.brand || "Genérico"}) - {sup.remainingQuantity} {sup.unit} restantes
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Fecha de Inicio *</label>
          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Protocolo / Preset *</label>
        <select
          className="form-select"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
        >
          <option value="creatine_loading">Fase de Carga de Creatina (7 días carga escalada + mantenimiento)</option>
          <option value="creatine_standard">Creatina Mantenimiento Continuo (5g/día)</option>
          <option value="whey_protein">Proteína de Suero Convencional (30g/scoop diario)</option>
          <option value="pre_workout">Pre-Entrenamiento (10g scoop antes de entrenar)</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Activar Protocolo
        </button>
      </div>
    </form>
  );
};

export default CyclePlanner;
