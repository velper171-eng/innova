import React, { useState, useEffect } from "react";

const PatientForm = ({ onSubmit, onCancel, patient = null }) => {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("male");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sport, setSport] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (patient) {
      setName(patient.name || "");
      setBirthdate(patient.birthdate || "");
      setGender(patient.gender || "male");
      setEmail(patient.email || "");
      setPhone(patient.phone || "");
      setSport(patient.sport || "");
    }
  }, [patient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !birthdate || !gender) {
      setError("El nombre, fecha de nacimiento y género son obligatorios.");
      return;
    }
    setError("");
    onSubmit({
      name,
      birthdate,
      gender,
      email,
      phone,
      sport,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h3 className="glow-text" style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
        {patient ? "Editar Paciente" : "Nuevo Paciente"}
      </h3>

      {error && (
        <div style={{ color: "var(--error)", padding: "10px", borderRadius: "6px", background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)" }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Nombre Completo *</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Juan Pérez"
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="form-group">
          <label className="form-label">Fecha de Nacimiento *</label>
          <input
            type="date"
            className="form-input"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Género *</label>
          <select
            className="form-select"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="form-group">
          <label className="form-label">Correo Electrónico</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan@ejemplo.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono</label>
          <input
            type="tel"
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+57 300 123 4567"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Deporte / Objetivo Principal</label>
        <input
          type="text"
          className="form-input"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          placeholder="Ej. Fisicoculturismo, Pérdida de grasa, Natación"
        />
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          {patient ? "Guardar Cambios" : "Crear Paciente"}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
