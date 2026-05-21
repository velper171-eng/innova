import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Register fields
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        onLogin(data.user, rememberMe);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Usuario o contraseña incorrectos");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          country,
          phone
        })
      });

      if (res.ok) {
        setSuccess("¡Registro exitoso! Iniciando sesión...");
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        
        if (loginRes.ok) {
          const data = await loginRes.json();
          onLogin(data.user, rememberMe);
        } else {
          setIsLogin(true);
          setError("Registro completado. Por favor inicia sesión.");
          setLoading(false);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Error en el registro");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Error de red al registrarse");
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    
    setTimeout(async () => {
      try {
        const googleUser = {
          name: "Atleta Google",
          email: "atleta.google@gmail.com",
          password: "google_mock_password_2026",
          country: "Colombia",
          phone: "+57 300 123 4567"
        };
        
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(googleUser)
        }).catch(() => {});
        
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: googleUser.email,
            password: googleUser.password
          })
        });
        
        if (loginRes.ok) {
          const data = await loginRes.json();
          onLogin(data.user, rememberMe);
        } else {
          const errData = await loginRes.json().catch(() => ({}));
          setError(errData.error || "Error al autenticar con Google");
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError("Error de red al autenticar con Google");
        setLoading(false);
      }
    }, 1000);
  };

  const scrollToLogin = () => {
    const loginSection = document.getElementById("login-section");
    if (loginSection) {
      loginSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="login-landing-container">
      {/* Styles Autocontenidos - Premium Aesthetics */}
      <style>{`
        .login-landing-container {
          --sano-cream: #FAF9F6;
          --sano-dark: #121A1A;
          --sano-teal: #008080;
          --sano-teal-hover: #006666;
          --sano-lime: #32CD32;
          --sano-lime-glow: rgba(50, 205, 50, 0.15);
          --sano-glass-border: rgba(18, 26, 26, 0.06);
          --sano-card-shadow: 0 10px 40px rgba(47, 79, 79, 0.04);
          
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: var(--sano-cream);
          color: var(--sano-dark);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* Ambient Background Glows */
        .ambient-glows {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .glow-1 {
          position: absolute;
          top: -20vh;
          right: -10vw;
          width: 50vw;
          height: 60vh;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 128, 128, 0.08) 0%, rgba(250, 249, 246, 0) 70%);
          filter: blur(80px);
        }
        .glow-2 {
          position: absolute;
          top: 40vh;
          left: -15vw;
          width: 60vw;
          height: 70vh;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(50, 205, 50, 0.06) 0%, rgba(250, 249, 246, 0) 70%);
          filter: blur(100px);
        }

        /* Sticky Header */
        .landing-header {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          background: rgba(250, 249, 246, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--sano-glass-border);
          z-index: 1000;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .logo-dot {
          width: 12px;
          height: 12px;
          background: var(--sano-teal);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--sano-teal);
          animation: pulse 2s infinite;
        }
        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--sano-dark);
        }
        .logo-badge {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--sano-teal);
          background: rgba(0, 128, 128, 0.08);
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header-btn {
          background: var(--sano-teal);
          color: white;
          border: none;
          padding: 10px 24px;
          font-weight: 700;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: inherit;
        }
        .header-btn:hover {
          background: var(--sano-teal-hover);
          transform: translateY(-1px);
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 60px 24px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
        }
        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .hero-tag {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--sano-teal);
          margin-bottom: 16px;
          background: rgba(0, 128, 128, 0.08);
          padding: 6px 14px;
          border-radius: 30px;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1.5px;
          color: var(--sano-dark);
          margin-bottom: 20px;
        }
        .hero-gradient-text {
          background: linear-gradient(135deg, var(--sano-teal) 0%, var(--sano-lime) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-style: italic;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--text-muted);
          margin-bottom: 32px;
          max-width: 520px;
        }
        
        /* Stats Row */
        .stats-row {
          display: flex;
          gap: 16px;
          margin-bottom: 40px;
          width: 100%;
          max-width: 520px;
        }
        .stat-card {
          flex: 1;
          background: white;
          border: 1px solid var(--sano-glass-border);
          border-radius: 20px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: var(--sano-card-shadow);
        }
        .stat-val {
          font-size: 2rem;
          font-weight: 900;
          color: var(--sano-teal);
          line-height: 1;
        }
        .stat-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-muted);
        }
        .stars-container {
          display: flex;
          gap: 2px;
          align-items: center;
        }
        
        .hero-cta-btn {
          width: 100%;
          max-width: 320px;
          background: var(--sano-teal);
          color: white;
          border: none;
          padding: 18px 24px;
          font-size: 1.1rem;
          font-weight: 800;
          border-radius: 24px;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(0, 128, 128, 0.25);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: inherit;
        }
        .hero-cta-btn:hover {
          background: var(--sano-teal-hover);
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(0, 128, 128, 0.35);
        }
        .hero-cta-btn:active {
          transform: scale(0.97);
        }
        .arrow-icon {
          transition: transform 0.25s ease;
        }
        .hero-cta-btn:hover .arrow-icon {
          transform: translateX(4px);
        }

        /* Mockup iPhone Container */
        .mockup-container {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        .iphone-frame {
          width: 310px;
          height: 620px;
          background: #000;
          border-radius: 46px;
          padding: 11px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15), 0 0 0 4px #2a2a2a;
          position: relative;
          z-index: 5;
          animation: float 6s ease-in-out infinite;
        }
        .iphone-screen {
          width: 100%;
          height: 100%;
          background: #f4f7f6;
          border-radius: 36px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          font-family: 'Outfit', sans-serif;
          user-select: none;
        }
        .iphone-notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 110px;
          height: 25px;
          background: #000;
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
          z-index: 100;
        }
        
        /* Simulated App Content */
        .app-header {
          background: white;
          padding: 30px 16px 12px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .app-user-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #2F4F4F;
        }
        .app-status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--sano-lime);
          box-shadow: 0 0 6px var(--sano-lime);
        }
        .app-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .app-card {
          background: white;
          border-radius: 16px;
          padding: 12px;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 4px 12px rgba(0,0,0,0.015);
        }
        .app-card-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #708090;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        
        /* Circular Calorie Ring */
        .mini-calorie-summary {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mini-circle-container {
          position: relative;
          width: 54px;
          height: 54px;
        }
        .circle-svg {
          transform: rotate(-90deg);
        }
        .mini-val {
          font-size: 0.95rem;
          font-weight: 800;
          color: #2F4F4F;
        }
        .mini-label {
          font-size: 0.7rem;
          color: #708090;
        }
        
        /* Somatocarta mockup grid */
        .mini-somatochart {
          width: 100%;
          aspect-ratio: 1.5;
          border: 1px dashed rgba(0,0,0,0.1);
          border-radius: 8px;
          position: relative;
          background: rgba(0,0,0,0.01);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .somatochart-grid-line-x {
          position: absolute;
          top: 50%;
          left: 5%;
          right: 5%;
          height: 1px;
          background: rgba(0,0,0,0.05);
        }
        .somatochart-grid-line-y {
          position: absolute;
          left: 50%;
          top: 5%;
          bottom: 5%;
          width: 1px;
          background: rgba(0,0,0,0.05);
        }
        .somatochart-point {
          position: absolute;
          top: 35%;
          left: 58%;
          width: 8px;
          height: 8px;
          background: var(--sano-teal);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--sano-teal);
        }
        .somatochart-label-meso {
          position: absolute;
          top: 4px;
          font-size: 0.6rem;
          font-weight: 600;
          color: #708090;
        }
        
        /* Supplement stock */
        .mini-stock-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .mini-stock-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .mini-progress-bar-bg {
          height: 6px;
          width: 100%;
          background: rgba(0,0,0,0.05);
          border-radius: 3px;
          overflow: hidden;
        }
        .mini-progress-bar-fill {
          height: 100%;
          width: 82%;
          background: var(--sano-teal);
          border-radius: 3px;
        }

        /* Features Section */
        .features-section {
          background: white;
          padding: 80px 24px 60px 24px;
          border-top: 1px solid var(--sano-glass-border);
          border-bottom: 1px solid var(--sano-glass-border);
          position: relative;
          z-index: 10;
        }
        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .features-header {
          text-align: center;
          margin-bottom: 50px;
        }
        .features-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -1px;
          color: var(--sano-dark);
          line-height: 1.2;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .feature-card {
          border-radius: 28px;
          padding: 24px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 16px;
          height: 100%;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.08);
        }
        .card-blue {
          background: rgba(79, 70, 229, 0.05);
        }
        .card-green {
          background: rgba(16, 185, 129, 0.05);
        }
        .card-amber {
          background: rgba(245, 158, 11, 0.05);
        }
        .card-rose {
          background: rgba(244, 63, 94, 0.05);
        }
        .card-violet {
          background: rgba(139, 92, 246, 0.05);
        }
        
        .feature-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }
        .feature-card:hover .feature-icon-wrapper {
          transform: scale(1.1);
        }
        
        .icon-blue { background: rgba(79, 70, 229, 0.1); color: rgb(79, 70, 229); }
        .icon-green { background: rgba(16, 185, 129, 0.1); color: rgb(16, 185, 129); }
        .icon-amber { background: rgba(245, 158, 11, 0.1); color: rgb(245, 158, 11); }
        .icon-rose { background: rgba(244, 63, 94, 0.1); color: rgb(244, 63, 94); }
        .icon-violet { background: rgba(139, 92, 246, 0.1); color: rgb(139, 92, 246); }

        .feature-card-title {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .title-blue { color: rgb(67, 56, 202); }
        .title-green { color: rgb(15, 118, 110); }
        .title-amber { color: rgb(180, 83, 9); }
        .title-rose { color: rgb(190, 24, 74); }
        .title-violet { color: rgb(109, 40, 217); }

        .feature-card-desc {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #708090;
          font-weight: 500;
        }

        /* Login Form Section */
        .login-section {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .login-card {
          width: 100%;
          max-width: 460px;
          background: white;
          border: 1px solid var(--sano-glass-border);
          border-radius: 32px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(47, 79, 79, 0.08);
          position: relative;
          overflow: hidden;
          text-align: center;
        }
        .login-title {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--sano-dark);
          margin-bottom: 8px;
        }
        .login-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 28px;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .input-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--sano-dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .input-field-wrapper {
          position: relative;
          width: 100%;
        }
        .input-field {
          width: 100%;
          padding: 14px 16px;
          background: #f8faf9;
          border: 1px solid var(--sano-glass-border);
          border-radius: 14px;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--sano-dark);
          outline: none;
          transition: all 0.2s ease;
        }
        .input-field:focus {
          background: white;
          border-color: var(--sano-teal);
          box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.12);
        }
        
        /* Checkbox option */
        .options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: -4px;
        }
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
          cursor: pointer;
        }
        .checkbox-input {
          width: 16px;
          height: 16px;
          accent-color: var(--sano-teal);
          cursor: pointer;
        }
        
        .error-message {
          background: rgba(255, 69, 0, 0.08);
          border: 1px solid rgba(255, 69, 0, 0.2);
          color: var(--error);
          padding: 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .submit-btn {
          width: 100%;
          background: var(--sano-teal);
          color: white;
          border: none;
          padding: 16px;
          font-size: 1rem;
          font-weight: 800;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 6px 15px rgba(0, 128, 128, 0.15);
          font-family: inherit;
        }
        .submit-btn:hover {
          background: var(--sano-teal-hover);
          transform: translateY(-1px);
        }
        .submit-btn:active {
          transform: scale(0.98);
        }
        .submit-btn:disabled {
          background: #a3c2c2;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Spinner */
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .login-tabs {
          display: flex;
          border-bottom: 1px solid var(--sano-glass-border);
          margin-bottom: 24px;
        }
        .login-tab {
          flex: 1;
          padding: 12px;
          text-align: center;
          font-weight: 700;
          cursor: pointer;
          color: #708090;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.2s ease;
        }
        .login-tab.active {
          color: var(--sano-teal);
          border-bottom-color: var(--sano-teal);
        }
        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: white;
          color: var(--sano-dark);
          border: 1px solid var(--sano-glass-border);
          padding: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          margin-top: 12px;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .google-btn:hover {
          background: #f8faf9;
          border-color: rgba(0,0,0,0.12);
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: #708090;
          font-size: 0.8rem;
          margin: 16px 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--sano-glass-border);
        }
        .divider:not(:empty)::before {
          margin-right: .5em;
        }
        .divider:not(:empty)::after {
          margin-left: .5em;
        }

        /* Footer */
        .landing-footer {
          padding: 40px 24px;
          border-top: 1px solid var(--sano-glass-border);
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
          position: relative;
          z-index: 10;
        }

        /* Keyframes */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(0, 128, 128, 0.5); }
          50% { transform: scale(1.15); box-shadow: 0 0 18px rgba(0, 128, 128, 0.8); }
          100% { transform: scale(1); box-shadow: 0 0 10px rgba(0, 128, 128, 0.5); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .hero-section {
            grid-template-columns: 1fr;
            padding-top: 50px;
            gap: 50px;
            text-align: center;
          }
          .hero-content {
            align-items: center;
            text-align: center;
          }
          .hero-title {
            font-size: 2.8rem;
          }
          .hero-subtitle {
            margin-left: auto;
            margin-right: auto;
          }
          .stats-row {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-cta-btn {
            margin-left: auto;
            margin-right: auto;
          }
          .features-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        
        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 2.2rem;
          }
          .landing-header {
            padding: 16px 20px;
          }
          .login-card {
            padding: 30px 20px;
          }
        }
      `}</style>

      {/* Ambient decorative glow elements */}
      <div className="ambient-glows">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
      </div>

      {/* Navigation Header */}
      <header className="landing-header">
        <div className="logo-container" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="logo-dot"></div>
          <span className="logo-text">INNOVA</span>
          <span className="logo-badge">CRM</span>
        </div>
        <button type="button" className="header-btn" onClick={scrollToLogin}>
          Acceder
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-tag">Consola de Logística Deportiva</div>
          <h1 className="hero-title">
            Tu CRM Deportivo e Inteligencia Antropométrica <br />
            <span className="hero-gradient-text">Potenciada con IA</span>
          </h1>
          <p className="hero-subtitle">
            La plataforma definitiva para preparadores físicos y nutricionistas. Diseña somatocartas, 
            monitorea macronutrientes, prescribe suplementos con alertas inteligentes y analiza biomecánica en tiempo real.
          </p>

          {/* Social Proof Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-val">1k+</span>
              <span className="stat-label">atletas activos de alto rendimiento</span>
            </div>
            <div className="stat-card">
              <div className="stars-container">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#F3C80A" stroke="#F3C80A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <span className="stat-label">Valorado con 4.9/5 estrellas</span>
            </div>
          </div>

          <button type="button" className="hero-cta-btn" onClick={scrollToLogin}>
            Ingresar al Portal
            <span className="arrow-icon">→</span>
          </button>
        </div>

        {/* Mockup iPhone Container */}
        <div className="mockup-container">
          <div className="iphone-frame">
            <div className="iphone-screen">
              <div className="iphone-notch"></div>
              
              {/* Simulated App Header */}
              <div className="app-header">
                <span className="app-user-name">Atleta: Carlos Mendoza</span>
                <div className="app-status-indicator"></div>
              </div>
              
              {/* Simulated App Body */}
              <div className="app-body">
                {/* 1. Nutrition Summary */}
                <div className="app-card">
                  <div className="app-card-title">Balance Calórico</div>
                  <div className="mini-calorie-summary">
                    <div className="mini-circle-container">
                      <svg className="circle-svg" width="54" height="54">
                        <circle cx="27" cy="27" r="23" stroke="#e6e6e6" strokeWidth="3" fill="transparent" />
                        <circle cx="27" cy="27" r="23" stroke="var(--sano-teal)" strokeWidth="4" fill="transparent" 
                                strokeDasharray="144" strokeDashoffset="40" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="mini-val">1,840 Kcal</div>
                      <div className="mini-label">Consumidas de 2,500</div>
                    </div>
                  </div>
                </div>

                {/* 2. Somatochart */}
                <div className="app-card">
                  <div className="app-card-title">Somatocarta</div>
                  <div className="mini-somatochart">
                    <div className="somatochart-grid-line-x"></div>
                    <div className="somatochart-grid-line-y"></div>
                    <div className="somatochart-point"></div>
                    <span className="somatochart-label-meso">Mesomorfo</span>
                  </div>
                </div>

                {/* 3. Supplement Inventory */}
                <div className="app-card">
                  <div className="app-card-title">Stock de Suplemento</div>
                  <div className="mini-stock-item">
                    <div className="mini-stock-header">
                      <span>Creatina Creapure</span>
                      <span style={{ color: "var(--sano-teal)", fontWeight: 700 }}>82%</span>
                    </div>
                    <div className="mini-progress-bar-bg">
                      <div className="mini-progress-bar-fill"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              Todo lo que necesitas para optimizar tu <br />
              <span style={{fontWeight: 900}}>preparación deportiva.</span>
            </h2>
          </div>

          <div className="features-grid">
            {/* Card 1 */}
            <div className="feature-card card-blue">
              <div className="feature-icon-wrapper icon-blue">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <h3 className="feature-card-title title-blue">Somatocarta & Historial</h3>
              <p className="feature-card-desc">
                Visualización instantánea del somatotipo y la evolución antropométrica. Gráficas precisas de porcentaje de grasa y peso.
              </p>
            </div>

            {/* Card 2 */}
            <div className="feature-card card-green">
              <div className="feature-icon-wrapper icon-green">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="feature-card-title title-green">Suplementación Logística</h3>
              <p className="feature-card-desc">
                Planificación exacta de dosis de suplementos por ciclo. Sistema integrado de alerta de reposición por volumen de stock.
              </p>
            </div>

            {/* Card 3 */}
            <div className="feature-card card-amber">
              <div className="feature-icon-wrapper icon-amber">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path d="M18 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path d="M4 9h16"/><path d="M4 12h16"/><path d="M10 3h4v12h-4z"/></svg>
              </div>
              <h3 className="feature-card-title title-amber">Entrenamientos Adaptados</h3>
              <p className="feature-card-desc">
                Diseño a medida de planes de fuerza y acondicionamiento. Periodización inteligente de repeticiones y cargas de peso.
              </p>
            </div>

            {/* Card 4 */}
            <div className="feature-card card-rose">
              <div className="feature-icon-wrapper icon-rose">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2 H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
              </div>
              <h3 className="feature-card-title title-rose">Biomecánica & Postura</h3>
              <p className="feature-card-desc">
                Análisis técnico automatizado mediante visión artificial. Evaluación del rango de movimiento y corrección en tiempo real.
              </p>
            </div>

            {/* Card 5 */}
            <div className="feature-card card-violet">
              <div className="feature-icon-wrapper icon-violet">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3 className="feature-card-title title-violet">Balance Nutricional</h3>
              <p className="feature-card-desc">
                Contador logístico de calorías diarias ingeridas y quemadas. Reportes de macronutrientes personalizados según la disciplina.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Login Portal Section */}
      <section className="login-section" id="login-section">
        <div className="login-card">
          <div className="login-tabs">
            <div 
              className={`login-tab ${isLogin ? "active" : ""}`} 
              onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
            >
              Ingresar
            </div>
            <div 
              className={`login-tab ${!isLogin ? "active" : ""}`} 
              onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
            >
              Registrarse (Gratis)
            </div>
          </div>

          <h2 className="login-title">
            {isLogin ? "Acceso al Portal Innova" : "Crea tu Cuenta Gratis"}
          </h2>
          <p className="login-desc">
            {isLogin 
              ? "Ingresa tus credenciales de atleta o administrador." 
              : "Accede a tu propio portal de entrenamiento independiente."}
          </p>
          
          {isLogin ? (
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <div className="input-group">
                <label className="input-label">Correo Electrónico / Usuario</label>
                <div className="input-field-wrapper">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. atleta@correo.com o admin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Contraseña</label>
                <div className="input-field-wrapper">
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="options-row">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  Mantener mi sesión iniciada
                </label>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Iniciando Sesión...
                  </>
                ) : (
                  "Ingresar a la Plataforma"
                )}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <label className="input-label">Nombre Completo</label>
                <div className="input-field-wrapper">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Correo Electrónico</label>
                <div className="input-field-wrapper">
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Ej. juan@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="input-group">
                  <label className="input-label">País</label>
                  <div className="input-field-wrapper">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej. México"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Celular</label>
                  <div className="input-field-wrapper">
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="Ej. +5212345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="input-group">
                  <label className="input-label">Contraseña</label>
                  <div className="input-field-wrapper">
                    <input
                      type="password"
                      className="input-field"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Confirmar</label>
                  <div className="input-field-wrapper">
                    <input
                      type="password"
                      className="input-field"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message" style={{ background: "rgba(50, 205, 50, 0.08)", border: "1px solid rgba(50, 205, 50, 0.2)", color: "var(--sano-teal)", padding: "12px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "600" }}>{success}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Creando Cuenta...
                  </>
                ) : (
                  "Comenzar Prueba Gratis"
                )}
              </button>
            </form>
          )}

          <div className="divider">o bien</div>

          <button type="button" className="google-btn" onClick={handleGoogleAuth} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            {isLogin ? "Ingresar con Google" : "Registrarse con Google"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 INNOVA Logistics & Performance. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
