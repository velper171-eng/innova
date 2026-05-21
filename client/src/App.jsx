import React, { useState, useEffect } from "react";
import PatientForm from "./components/PatientForm";
import EvaluationForm from "./components/EvaluationForm";
import Somatochart from "./components/Somatochart";
import BodyTrendChart from "./components/BodyTrendChart";
import CyclePlanner from "./components/CyclePlanner";
import AthleteView from "./components/AthleteView";
import PostureAnalyzer from "./components/PostureAnalyzer";
import CalorieCounter from "./components/CalorieCounter";
import TrainingPlanner from "./components/TrainingPlanner";
import Login from "./components/Login";

const API_BASE = "/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("innova_auth") === "true" || sessionStorage.getItem("innova_auth") === "true";
  });

  const handleLoginSuccess = (rememberMe) => {
    setIsAuthenticated(true);
    if (rememberMe) {
      localStorage.setItem("innova_auth", "true");
    } else {
      sessionStorage.setItem("innova_auth", "true");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("innova_auth");
    sessionStorage.removeItem("innova_auth");
  };

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // UI states
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [isAddingEvaluation, setIsAddingEvaluation] = useState(false);
  const [isAddingCycle, setIsAddingCycle] = useState(false);
  const [isAthleteView, setIsAthleteView] = useState(false);
  const [activeTab, setActiveTab] = useState("anthropometry"); // "anthropometry", "supplementation", "posture", "nutrition"
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch all patients on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPatients();
    }
  }, [isAuthenticated]);

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  const fetchPatientDetail = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/patients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPatient(data);
      }
    } catch (err) {
      console.error("Error fetching patient details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (patientData) => {
    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      if (res.ok) {
        const newPatient = await res.json();
        setIsAddingPatient(false);
        fetchPatients();
        fetchPatientDetail(newPatient.id);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error al crear paciente: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Error creating patient:", err);
      alert("Error de conexión al crear el paciente");
    }
  };

  const handleUpdatePatient = async (patientData) => {
    try {
      const res = await fetch(`${API_BASE}/patients/${selectedPatient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      if (res.ok) {
        setIsEditingPatient(false);
        fetchPatients();
        fetchPatientDetail(selectedPatient.id);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error al actualizar paciente: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Error updating patient:", err);
      alert("Error de conexión al actualizar el paciente");
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este paciente y todo su historial?")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/patients/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedPatient(null);
        fetchPatients();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error al eliminar paciente: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Error deleting patient:", err);
      alert("Error de conexión al eliminar el paciente");
    }
  };

  const handleCreateEvaluation = async (evalData) => {
    try {
      const res = await fetch(`${API_BASE}/patients/${selectedPatient.id}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evalData),
      });
      if (res.ok) {
        setIsAddingEvaluation(false);
        fetchPatientDetail(selectedPatient.id);
        fetchPatients();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error al guardar evaluación: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Error creating evaluation:", err);
      alert("Error de conexión al guardar la evaluación");
    }
  };

  const handleDeleteEvaluation = async (evalId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta evaluación?")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/evaluations/${evalId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPatientDetail(selectedPatient.id);
        fetchPatients();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error al eliminar evaluación: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Error deleting evaluation:", err);
      alert("Error de conexión al eliminar la evaluación");
    }
  };

  const handleCreateCycle = async (cycleData) => {
    try {
      const res = await fetch(`${API_BASE}/patients/${selectedPatient.id}/cycles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cycleData),
      });
      if (res.ok) {
        setIsAddingCycle(false);
        fetchPatientDetail(selectedPatient.id);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error al crear el ciclo: ${errorData.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Error creating cycle:", err);
      alert("Error de conexión al crear el ciclo");
    }
  };

  const handleDeleteCycle = async (cycleId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este ciclo?")) return;
    try {
      const res = await fetch(`${API_BASE}/cycles/${cycleId}`, { method: "DELETE" });
      if (res.ok) {
        fetchPatientDetail(selectedPatient.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter patients by search query
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // If in Mobile PWA simulation, render fullscreen AthleteView
  if (isAthleteView && selectedPatient) {
    return (
      <div style={{ minHeight: "100vh", padding: "20px", background: "var(--grad-dark)" }}>
        <AthleteView
          patientId={selectedPatient.id}
          onBack={() => {
            setIsAthleteView(false);
            fetchPatientDetail(selectedPatient.id);
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation */}
      <header
        style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-color)",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Toggle Sidebar Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: "8px",
              transition: "all var(--transition-fast)",
            }}
            className="sidebar-toggle-btn"
            title="Toggle Sidebar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "var(--primary)",
                borderRadius: "50%",
                boxShadow: "0 0 10px var(--primary)",
              }}
            />
            <h1 className="glow-text" style={{ fontSize: "1.5rem", fontWeight: 800 }}>
              INNOVA
            </h1>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "2px", marginLeft: "10px" }}>
              CRM & Suplementación
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Modo Administrador
          </div>
          <button
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 69, 0, 0.08)";
              e.target.style.borderColor = "rgba(255, 69, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "none";
              e.target.style.borderColor = "var(--border-color)";
            }}
            style={{
              background: "none",
              border: "1px solid var(--border-color)",
              color: "var(--error)",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Drawer Backdrop */}
      {isSidebarOpen && (
        <div className="drawer-backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Layout Grid */}
      <div className={`main-layout ${selectedPatient || isAddingPatient || isEditingPatient || isAddingEvaluation || isAddingCycle ? "has-active-content" : ""}`}>
        
        {/* Sidebar Drawer: Patient List & Search */}
        <aside className={`sidebar-drawer ${isSidebarOpen ? "open" : ""}`}>
          {/* Search bar & Add Button */}
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--primary)" }}>Panel de Pacientes</span>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  padding: "4px 8px"
                }}
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedPatient(null);
                setIsAddingPatient(true);
                setIsEditingPatient(false);
                setIsAddingEvaluation(false);
                setIsAddingCycle(false);
                setIsSidebarOpen(false);
              }}
            >
              + Nuevo Paciente
            </button>
          </div>

          {/* Patient Scroll List or Section Trigger */}
          {!(showHistory || searchQuery.trim() !== "") ? (
            <div style={{ padding: "10px", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                style={{
                  width: "100%",
                  padding: "20px 16px",
                  borderRadius: "12px",
                  background: "var(--bg-main)",
                  border: "1px dashed var(--primary)",
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                className="history-toggle-btn"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.2rem" }}>📁</span>
                  <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>Historial de Pacientes</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: "600" }}>Ver Historial</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  padding: "10px 20px 0 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  {searchQuery.trim() !== "" ? "Resultados de Búsqueda" : "Historial de Pacientes"}
                </span>
                {searchQuery.trim() === "" && (
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    Ocultar
                  </button>
                )}
              </div>

              {/* Patient Scroll List */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                {filteredPatients.length === 0 ? (
                  <div style={{ color: "var(--text-dark)", textAlign: "center", padding: "20px", fontSize: "0.9rem" }}>
                    No se encontraron pacientes
                  </div>
                ) : (
                  filteredPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        fetchPatientDetail(p.id);
                        setIsAddingPatient(false);
                        setIsEditingPatient(false);
                        setIsAddingEvaluation(false);
                        setIsAddingCycle(false);
                        setIsSidebarOpen(false);
                      }}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                        background: selectedPatient?.id === p.id ? "var(--primary-glow)" : "transparent",
                        border: `1px solid ${selectedPatient?.id === p.id ? "var(--primary)" : "transparent"}`,
                        marginBottom: "8px",
                      }}
                      className="patient-item"
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ color: selectedPatient?.id === p.id ? "var(--primary)" : "var(--text-main)", fontSize: "1rem" }}>
                          {p.name}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-main)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-color)" }}>
                          {p.gender === "male" ? "M" : "F"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        <span>{p.sport || "General"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="content-panel">
          {/* Mobile Back Button */}
          {(selectedPatient || isAddingPatient || isEditingPatient || isAddingEvaluation || isAddingCycle) && (
            <button
              className="btn btn-secondary mobile-back-btn"
              onClick={() => {
                setSelectedPatient(null);
                setIsAddingPatient(false);
                setIsEditingPatient(false);
                setIsAddingEvaluation(false);
                setIsAddingCycle(false);
              }}
            >
              ← Volver a Pacientes
            </button>
          )}
          
          {/* 1. Add Patient View */}
          {isAddingPatient && (
            <PatientForm
              onSubmit={handleCreatePatient}
              onCancel={() => setIsAddingPatient(false)}
            />
          )}

          {/* 2. Edit Patient View */}
          {isEditingPatient && (
            <PatientForm
              patient={selectedPatient}
              onSubmit={handleUpdatePatient}
              onCancel={() => setIsEditingPatient(false)}
            />
          )}

          {/* 3. Add Evaluation View */}
          {isAddingEvaluation && (
            <EvaluationForm
              patient={selectedPatient}
              onSubmit={handleCreateEvaluation}
              onCancel={() => setIsAddingEvaluation(false)}
            />
          )}

          {/* 4. Add Cycle View */}
          {isAddingCycle && selectedPatient && (
            <CyclePlanner
              patientId={selectedPatient.id}
              supplements={selectedPatient.supplements}
              onSubmit={handleCreateCycle}
              onCancel={() => setIsAddingCycle(false)}
            />
          )}

          {/* 5. Main Detail / History View */}
          {!isAddingPatient && !isEditingPatient && !isAddingEvaluation && !isAddingCycle && selectedPatient && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Header profile details */}
              <div className="glass-card profile-header-card">
                <div className="profile-details">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <h2 className="profile-name">{selectedPatient.name}</h2>
                    <span
                      style={{
                        background: "rgba(0,242,254,0.1)",
                        color: "var(--primary)",
                        padding: "4px 10px",
                        borderRadius: "10px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {selectedPatient.sport || "Sin Deporte"}
                    </span>
                  </div>
                  <div className="profile-info-row">
                    <span>Género: <strong>{selectedPatient.gender === "male" ? "Masculino" : "Femenino"}</strong></span>
                    <span>Nacimiento: <strong>{selectedPatient.birthdate}</strong></span>
                    {selectedPatient.email && <span>Email: <strong>{selectedPatient.email}</strong></span>}
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="btn btn-secondary" style={{ border: "1px solid var(--primary)", color: "var(--primary)" }} onClick={() => setIsAthleteView(true)}>
                    📱 Vista Móvil (Atleta PWA)
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsEditingPatient(true)}>
                    Editar Perfil
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeletePatient(selectedPatient.id)}>
                    Eliminar Paciente
                  </button>
                </div>
              </div>

              {/* CRM Section Toggles */}
              <div className="tabs">
                <button
                  className={`tab-btn ${activeTab === "anthropometry" ? "active" : ""}`}
                  onClick={() => setActiveTab("anthropometry")}
                >
                  Historial Antropométrico
                </button>
                <button
                  className={`tab-btn ${activeTab === "supplementation" ? "active" : ""}`}
                  onClick={() => setActiveTab("supplementation")}
                >
                  Ciclos de Suplementación
                </button>
                <button
                  className={`tab-btn ${activeTab === "training" ? "active" : ""}`}
                  onClick={() => setActiveTab("training")}
                >
                  🏋️ Plan de Entrenamiento
                </button>
                <button
                  className={`tab-btn ${activeTab === "posture" ? "active" : ""}`}
                  onClick={() => setActiveTab("posture")}
                >
                  Análisis Biomecánico
                </button>
                <button
                  className={`tab-btn ${activeTab === "nutrition" ? "active" : ""}`}
                  onClick={() => setActiveTab("nutrition")}
                >
                  Control de Nutrición
                </button>
              </div>

              {/* Sub-section 1: Anthropometry */}
              {activeTab === "anthropometry" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="animate-fade-in">
                  {/* Body Trend Chart */}
                  {selectedPatient.evaluations?.length >= 2 && (
                    <div className="glass-card">
                      <h3 className="glow-text" style={{ fontSize: "1.15rem", marginBottom: "4px" }}>
                        📈 Evolución Corporal
                      </h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px", marginTop: "-2px" }}>
                        Tendencia de peso y porcentaje de grasa a lo largo del tiempo.
                      </p>
                      <BodyTrendChart evaluations={selectedPatient.evaluations} />
                    </div>
                  )}

                  <div className="grid-1-2-cols">
                    {/* Somatochart */}
                    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <h3 className="glow-text" style={{ fontSize: "1.25rem" }}>
                        Somatocarta Histórica
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "-8px" }}>
                        La línea de tendencia conecta tus evaluaciones de forma cronológica. Pasa el cursor por los puntos para ver el desglose.
                      </p>
                      <Somatochart evaluations={selectedPatient.evaluations} />
                    </div>

                    {/* Evaluations timeline list */}
                    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 className="glow-text" style={{ fontSize: "1.25rem" }}>
                          Historial de Evaluaciones
                        </h3>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                          onClick={() => setIsAddingEvaluation(true)}
                        >
                          + Nueva Evaluación
                        </button>
                      </div>

                      <div style={{ flex: 1, overflowX: "auto" }}>
                        {selectedPatient.evaluations?.length === 0 ? (
                          <div style={{ color: "var(--text-dark)", textAlign: "center", padding: "40px", fontStyle: "italic" }}>
                            Aún no se han registrado evaluaciones para este paciente.
                          </div>
                        ) : (
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "left" }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-main)" }}>
                                <th style={{ padding: "12px 8px" }}>Fecha</th>
                                <th style={{ padding: "12px 8px" }}>Peso</th>
                                <th style={{ padding: "12px 8px" }}>Grasa %</th>
                                <th style={{ padding: "12px 8px" }}>Somatotipo</th>
                                <th style={{ padding: "12px 8px" }}>Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPatient.evaluations.map((ev) => (
                                <tr key={ev.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                  <td style={{ padding: "12px 8px", color: "var(--text-main)", fontWeight: 600 }}>{ev.date}</td>
                                  <td style={{ padding: "12px 8px" }}>{ev.weight} kg</td>
                                  <td style={{ padding: "12px 8px", color: "var(--warning)", fontWeight: 600 }}>
                                    {ev.bodyFat ? `${ev.bodyFat}%` : "N/A"}
                                  </td>
                                  <td style={{ padding: "12px 8px" }}>
                                    {ev.endomorphy.toFixed(1)} - {ev.mesomorphy.toFixed(1)} - {ev.ectomorphy.toFixed(1)}
                                  </td>
                                  <td style={{ padding: "12px 8px" }}>
                                    <button
                                      className="btn"
                                      style={{ padding: "4px 8px", fontSize: "0.75rem", background: "rgba(255,69,0,0.1)", color: "var(--error)" }}
                                      onClick={() => handleDeleteEvaluation(ev.id)}
                                    >
                                      Borrar
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-section 2: Supplementation Planner */}
              {activeTab === "supplementation" && (
                <div className="grid-1-2-1-cols animate-fade-in">
                  
                  {/* Cycles list */}
                  <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 className="glow-text" style={{ fontSize: "1.25rem" }}>
                        Ciclos Activos y Protocolos
                      </h3>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                        onClick={() => setIsAddingCycle(true)}
                      >
                        + Programar Ciclo
                      </button>
                    </div>

                    <div style={{ flex: 1, overflowX: "auto" }}>
                      {selectedPatient.cycles?.length === 0 ? (
                        <div style={{ color: "var(--text-dark)", textAlign: "center", padding: "40px", fontStyle: "italic" }}>
                          No hay ciclos de suplementación prescritos aún.
                        </div>
                      ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "left" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-main)" }}>
                              <th style={{ padding: "12px 8px" }}>Nombre Protocolo</th>
                              <th style={{ padding: "12px 8px" }}>Fecha Inicio</th>
                              <th style={{ padding: "12px 8px" }}>Suplemento</th>
                              <th style={{ padding: "12px 8px" }}>Estado</th>
                              <th style={{ padding: "12px 8px" }}>Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPatient.cycles.map((cyc) => (
                              <tr key={cyc.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <td style={{ padding: "12px 8px", color: "var(--text-main)", fontWeight: 600 }}>{cyc.name}</td>
                                <td style={{ padding: "12px 8px" }}>{cyc.startDate}</td>
                                <td style={{ padding: "12px 8px" }}>{cyc.supplement?.name || "Sin vincular"}</td>
                                <td style={{ padding: "12px 8px" }}>
                                  <span style={{ color: cyc.isActive ? "var(--success)" : "var(--text-dark)" }}>
                                    {cyc.isActive ? "Activo" : "Finalizado"}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 8px" }}>
                                  <button
                                    className="btn"
                                    style={{ padding: "4px 8px", fontSize: "0.75rem", background: "rgba(244,63,94,0.1)", color: "var(--error)" }}
                                    onClick={() => handleDeleteCycle(cyc.id)}
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Supplement Inventory Panel */}
                  <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h3 className="glow-text" style={{ fontSize: "1.25rem" }}>
                      Inventario de Suplementos (Stock)
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "-8px" }}>
                      Stock actual registrado del atleta. Los avisos de reposición automática se generan al quedar 5 días de consumo.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                      {selectedPatient.supplements?.length === 0 ? (
                        <div style={{ color: "var(--text-dark)", textAlign: "center", padding: "20px", fontStyle: "italic" }}>
                          No hay suplementos registrados en inventario.
                        </div>
                      ) : (
                        selectedPatient.supplements.map((sup) => {
                          const percent = Math.round((sup.remainingQuantity / sup.totalCapacity) * 100);
                          const isLow = sup.remainingQuantity <= (sup.totalCapacity * 0.15) || percent <= 15;
                          return (
                            <div key={sup.id} style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{sup.name}</span>
                                <span style={{ color: isLow ? "var(--error)" : "var(--primary)", fontWeight: 700 }}>
                                  {sup.remainingQuantity} / {sup.totalCapacity} {sup.unit}
                                </span>
                              </div>
                              <div style={{ height: "4px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", marginTop: "8px" }}>
                                <div style={{ height: "100%", width: `${percent}%`, background: isLow ? "var(--error)" : "var(--primary)" }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* Sub-section 3: Training Plan */}
              {activeTab === "training" && (
                <TrainingPlanner patientId={selectedPatient.id} isAdminMode={true} />
              )}

              {/* Sub-section 4: Posture Biomechanics */}
              {activeTab === "posture" && (
                <PostureAnalyzer patientId={selectedPatient.id} />
              )}

              {/* Sub-section 5: Nutrition Control */}
              {activeTab === "nutrition" && (
                <CalorieCounter patientId={selectedPatient.id} isAdminMode={true} />
              )}

            </div>
          )}

          {/* 6. Welcome Dashboard (When no patient is selected) */}
          {!isAddingPatient && !isEditingPatient && !isAddingEvaluation && !isAddingCycle && !selectedPatient && (
            <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "40px" }}>
              <div style={{ maxWidth: "600px" }}>
                <h2 className="glow-text" style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
                  Panel de Comando Antropométrico
                </h2>
                <p style={{ fontSize: "1.1rem", marginBottom: "24px" }}>
                  Bienvenido a la consola logística de rendimiento físico. Abre el panel desplegable con el botón de menú arriba a la izquierda para seleccionar un atleta, buscar o crear uno nuevo.
                </p>
              </div>

              {/* KPI cards */}
              <div className="grid-3-cols">
                <div className="glass-card" style={{ background: "var(--bg-main)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Pacientes</span>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--primary)", marginTop: "8px" }}>
                    {patients.length}
                  </div>
                </div>
                <div className="glass-card" style={{ background: "var(--bg-main)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Evaluaciones Registradas</span>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent)", marginTop: "8px" }}>
                    {patients.reduce((sum, p) => sum + (p._count?.evaluations || p.evaluations?.length || 0), 0)}
                  </div>
                </div>
                <div className="glass-card" style={{ background: "var(--bg-main)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Consola Activa</span>
                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--success)", marginTop: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", background: "var(--success)", borderRadius: "50%", boxShadow: "0 0 6px var(--success)" }} />
                    Conectado a SQLite
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;

