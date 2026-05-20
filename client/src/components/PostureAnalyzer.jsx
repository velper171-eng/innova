import React, { useState, useEffect, useRef } from "react";

const API_BASE = "/api";

const PostureAnalyzer = ({ patientId }) => {
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  
  // Video playback sync states
  const [currentFrameData, setCurrentFrameData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchJobs();
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [patientId]);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/posture/jobs`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        // If there's an active running job, start polling it
        const running = data.find(j => j.status === "pending" || j.status === "processing");
        if (running) {
          startPolling(running.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startPolling = (jobId) => {
    if (pollingInterval) clearInterval(pollingInterval);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/posture/jobs/${jobId}`);
        if (res.ok) {
          const job = await res.json();
          // Update active job if currently viewed
          if (activeJob && activeJob.id === job.id) {
            setActiveJob(job);
          }
          // Update jobs list
          setJobs(prev => prev.map(j => j.id === job.id ? job : j));

          if (job.status === "completed" || job.status === "failed") {
            clearInterval(interval);
            setPollingInterval(null);
            fetchJobs();
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    setPollingInterval(interval);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/posture`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newJob = await res.json();
        setJobs(prev => [newJob, ...prev]);
        setActiveJob(newJob);
        startPolling(newJob.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Zero-friction demo test
  const handleLoadDemoJob = async () => {
    setUploading(true);
    // Create a mock form submit to simulate S3 upload
    const mockFile = new File(["demo"], "squat_test.mp4", { type: "video/mp4" });
    const formData = new FormData();
    formData.append("video", mockFile);

    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/posture`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newJob = await res.json();
        setJobs(prev => [newJob, ...prev]);
        setActiveJob(newJob);
        setDemoMode(true);
        startPolling(newJob.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectJob = async (job) => {
    setLoadingState(true);
    try {
      const res = await fetch(`${API_BASE}/posture/jobs/${job.id}`);
      if (res.ok) {
        const detailedJob = await res.json();
        setActiveJob(detailedJob);
        if (detailedJob.status === "pending" || detailedJob.status === "processing") {
          startPolling(detailedJob.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingState(false);
    }
  };

  const [loadingState, setLoadingState] = useState(false);

  // Sync Canvas with Video timestamp
  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !activeJob || !activeJob.result) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentTime = video.currentTime;
    const fps = activeJob.result.fps || 30;
    const frameIndex = Math.floor(currentTime * fps);

    // Get current frame data
    const frameData = activeJob.result.frames.find(f => f.frame === frameIndex);
    if (!frameData) return;

    setCurrentFrameData(frameData);

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const joints = frameData.joints;
    const width = canvas.width;
    const height = canvas.height;

    // Helper: Map coordinates from percentage (0-100) to actual canvas pixels
    const mapPoint = (pt) => ({
      x: (pt.x / 100) * width,
      y: (pt.y / 100) * height
    });

    const lShoulder = mapPoint(joints.leftShoulder);
    const rShoulder = mapPoint(joints.rightShoulder);
    const lHip = mapPoint(joints.leftHip);
    const rHip = mapPoint(joints.rightHip);
    const lKnee = mapPoint(joints.leftKnee);
    const rKnee = mapPoint(joints.rightKnee);
    const lAnkle = mapPoint(joints.leftAnkle);
    const rAnkle = mapPoint(joints.rightAnkle);

    // Draw Skeleton Bones (Lines)
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    // Alerts check to draw custom glowing/warning colors
    const hasValgus = frameData.alerts.some(a => a.includes("Valgo"));
    const hasButtWink = frameData.alerts.some(a => a.includes("flexión") || a.includes("lumbar"));

    // Draw Spine Axis
    const midShoulder = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 };
    const midHip = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 };
    ctx.strokeStyle = hasButtWink ? "rgba(244, 63, 94, 0.85)" : "rgba(16, 185, 129, 0.8)";
    ctx.beginPath();
    ctx.moveTo(midShoulder.x, midShoulder.y);
    ctx.lineTo(midHip.x, midHip.y);
    ctx.stroke();

    // Draw Hips and Shoulders horizontal anchors
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.moveTo(lShoulder.x, lShoulder.y); ctx.lineTo(rShoulder.x, rShoulder.y);
    ctx.moveTo(lHip.x, lHip.y); ctx.lineTo(rHip.x, rHip.y);
    ctx.stroke();

    // Draw Legs
    ctx.strokeStyle = hasValgus ? "rgba(244, 63, 94, 0.9)" : "rgba(0, 242, 254, 0.8)";
    ctx.beginPath();
    // Left Leg
    ctx.moveTo(lHip.x, lHip.y);
    ctx.lineTo(lKnee.x, lKnee.y);
    ctx.lineTo(lAnkle.x, lAnkle.y);
    // Right Leg
    ctx.moveTo(rHip.x, rHip.y);
    ctx.lineTo(rKnee.x, rKnee.y);
    ctx.lineTo(rAnkle.x, rAnkle.y);
    ctx.stroke();

    // Draw Joint Nodes (Circles)
    const drawJoint = (pt, isAlerted) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = isAlerted ? "var(--error)" : "var(--primary)";
      ctx.shadowColor = isAlerted ? "var(--error)" : "var(--primary)";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    };

    drawJoint(lShoulder, false);
    drawJoint(rShoulder, false);
    drawJoint(lHip, hasButtWink);
    drawJoint(rHip, hasButtWink);
    drawJoint(lKnee, hasValgus);
    drawJoint(rKnee, hasValgus);
    drawJoint(lAnkle, false);
    drawJoint(rAnkle, false);

    // Draw Real-time Angle Overlays next to joints
    ctx.fillStyle = "white";
    ctx.font = "bold 13px sans-serif";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText(`${frameData.angles.kneeAngle}°`, lKnee.x + 12, lKnee.y + 4);
    ctx.fillText(`${frameData.angles.lumbarAngle}°`, lHip.x - 45, lHip.y + 4);
    ctx.shadowBlur = 0;

    // Flash Red border on active alert
    if (frameData.alerts.length > 0) {
      ctx.strokeStyle = "rgba(244, 63, 94, 0.3)";
      ctx.lineWidth = 8;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Adjust canvas size to match the scaled video element size
  const handleVideoLoadedMetadata = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
    }
  };

  // Hook resize to recalculate canvas overlay bounds
  useEffect(() => {
    const handleResize = () => {
      handleVideoLoadedMetadata();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeJob]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="animate-fade-in">
      
      {/* Top action row */}
      <div className="glass-card posture-header-card">
        <div>
          <h3 className="glow-text" style={{ fontSize: "1.4rem" }}>Análisis de Postura Biomecánico</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "-6px" }}>
            Ingesta de video y extracción de ángulos de sentadilla en segundo plano (MediaPipe).
          </p>
        </div>

        <div className="posture-header-actions">
          <button
            className="btn btn-secondary"
            style={{ border: "1px solid var(--accent)", color: "var(--accent)" }}
            onClick={handleLoadDemoJob}
            disabled={uploading}
          >
            {uploading ? "Subiendo..." : "⚡ Cargar Video Demo"}
          </button>
          
          <input
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Subir Video MP4
          </button>
        </div>
      </div>

      <div className="grid-300px-1-cols">
        
        {/* Left pane: Jobs history list */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "550px", overflowY: "auto" }}>
          <h4 style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
            Historial de Análisis
          </h4>

          {jobs.length === 0 ? (
            <div style={{ color: "var(--text-dark)", fontSize: "0.85rem", textAlign: "center", padding: "20px", fontStyle: "italic" }}>
              Ningún video analizado aún.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: activeJob?.id === job.id ? "var(--primary-glow)" : "var(--bg-main)",
                    border: `1px solid ${activeJob?.id === job.id ? "var(--primary)" : "var(--border-color)"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Análisis #{job.id}</span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: 600,
                        background:
                          job.status === "completed" ? "rgba(16,185,129,0.15)" :
                          job.status === "failed" ? "rgba(244,63,94,0.15)" :
                          "rgba(251,191,36,0.15)",
                        color:
                          job.status === "completed" ? "var(--success)" :
                          job.status === "failed" ? "var(--error)" :
                          "#fbbf24",
                      }}
                    >
                      {job.status === "completed" ? "Listo" :
                       job.status === "failed" ? "Fallo" :
                       `Procesando ${job.progress}%`}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dark)", marginTop: "6px" }}>
                    {new Date(job.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right pane: Interactive Viewer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Active queue loader state */}
          {activeJob && (activeJob.status === "pending" || activeJob.status === "processing") && (
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "40px", textAlign: "center" }}>
              <div className="glow-text" style={{ fontSize: "1.5rem" }}>
                Procesando en Cola de Servidores
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "500px" }}>
                El video ha sido recibido en el Data Lake y se está analizando fotograma a fotograma con MediaPipe Pose. La pantalla del usuario está desacoplada del proceso.
              </p>

              <div style={{ width: "100%", maxWidth: "400px", height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
                <div style={{ height: "100%", width: `${activeJob.progress}%`, background: "var(--primary)", boxShadow: "none", transition: "width 0.4s" }} />
              </div>
              
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Estado: <strong>{activeJob.status === "processing" ? "Analizando fotogramas" : "En espera en cola"} ({activeJob.progress}%)</strong>
              </div>
            </div>
          )}

          {/* Completed Job Player */}
          {activeJob && activeJob.status === "completed" && (
            <div className="grid-1-3-1-cols">
              
              {/* Left Column: Synchronized Video + Canvas Overlay */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div
                  style={{
                    position: "relative",
                    background: "black",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                    lineHeight: 0
                  }}
                >
                  <video
                    ref={videoRef}
                    src={demoMode ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" : `${API_BASE}${activeJob.videoPath}`}
                    style={{ width: "100%", display: "block" }}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    loop
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none"
                    }}
                  />
                </div>

                {/* Video controls */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (isPlaying) {
                        videoRef.current?.pause();
                        setIsPlaying(false);
                      } else {
                        videoRef.current?.play();
                        setIsPlaying(true);
                      }
                    }}
                  >
                    {isPlaying ? "⏸ Pausar" : "▶ Reproducir"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                      }
                    }}
                  >
                    🔁 Reiniciar
                  </button>
                </div>
              </div>

              {/* Right Column: Frame statistics and alert panels */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 className="glow-text" style={{ fontSize: "1.2rem" }}>Telemetría en Tiempo Real</h4>
                
                {currentFrameData ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    
                    {/* Angles panel */}
                    <div className="grid-2-cols" style={{ gap: "12px" }}>
                      <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Flexión Rodillas</span>
                        <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--primary)", marginTop: "4px" }}>
                          {currentFrameData.angles.kneeAngle}°
                        </div>
                      </div>
                      
                      <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Extensión Lumbar</span>
                        <div style={{ fontSize: "1.8rem", fontWeight: 700, color: currentFrameData.angles.lumbarAngle < 150 ? "var(--error)" : "var(--success)", marginTop: "4px" }}>
                          {currentFrameData.angles.lumbarAngle}°
                        </div>
                      </div>
                    </div>

                    {/* Alerts display */}
                    <div>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Alertas de Ejecución (Fotograma {currentFrameData.frame}):</span>
                      {currentFrameData.alerts.length === 0 ? (
                        <div style={{ marginTop: "8px", padding: "10px", borderRadius: "8px", background: "rgba(50, 205, 50, 0.05)", border: "1px solid rgba(50, 205, 50, 0.15)", color: "var(--success)", fontSize: "0.8rem" }}>
                          ✓ Postura dentro de rangos seguros.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                          {currentFrameData.alerts.map((al, aIdx) => (
                            <div key={aIdx} style={{ padding: "10px", borderRadius: "8px", background: "rgba(255, 69, 0, 0.08)", border: "1px solid rgba(255, 69, 0, 0.2)", color: "var(--error)", fontSize: "0.8rem", fontWeight: 600 }}>
                              🚨 {al}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Summary statistics */}
                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "14px", marginTop: "10px" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Resumen Diagnóstico:</span>
                      <ul style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px", paddingLeft: "16px", lineHeight: "1.6" }}>
                        <li>Flexión de rodilla máxima: <strong>{activeJob.result.summary.minKneeAngle}°</strong></li>
                        <li>Flexión lumbar máxima: <strong style={{ color: "var(--error)" }}>{activeJob.result.summary.minLumbarAngle}°</strong></li>
                        <li>Fallas articulares detectadas: <strong>Valgo Dinámico de Rodilla, Butt Wink Lumbar</strong></li>
                      </ul>
                    </div>

                  </div>
                ) : (
                  <div style={{ color: "var(--text-dark)", fontSize: "0.85rem", fontStyle: "italic", textAlign: "center", padding: "40px" }}>
                    Reproduce el video para sincronizar los datos de los sensores.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Prompt to select a job */}
          {!activeJob && (
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "80px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>🎥</div>
              <h4 style={{ fontSize: "1.2rem", color: "var(--text-main)" }}>Consola Biomecánica Inactiva</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "450px" }}>
                Selecciona un análisis previo de la lista lateral o sube un nuevo archivo de video para calcular las deformaciones angulares de la columna lumbar y rodillas.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default PostureAnalyzer;
