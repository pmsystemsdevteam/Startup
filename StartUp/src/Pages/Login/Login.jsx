import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.scss";
import back from "../../Video/back.gif";
import logo from "../../Image/PmsLogo.png";
import { loginUsernamePassword } from "../../api";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState("");

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setAuthErr("");
    setLoading(true);
    try {
      await loginUsernamePassword(username, password);
      navigate("/"); // ✅ uğurlu girişdən sonra yönləndirmə
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        "Giriş alınmadı. Username və şifrəni yoxlayın.";
      setAuthErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login">
      {/* Sol: Auth Card */}
      <div className="auth-card">
        <h1>Hesabına daxil ol</h1>

        <form onSubmit={submitHandler} className="form" autoComplete="on">
          <div className="field">
            <label htmlFor="username">İstifadəçi adı</label>
            <input
              id="username"
              type="text"
              placeholder="İstifadəçi adını daxil edin"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="field" style={{ marginTop: 10 }}>
            <label htmlFor="password">Şifrə</label>
            <div className="password">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="******"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
                title={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
              >
                {showPassword ? (
                  // eye-off
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M2 2l20 20M10.6 10.7A3 3 0 0012 15a3 3 0 002.7-4.4M9.9 5.3A10.9 10.9 0 0112 5c5.5 0 10 4.5 10 7-.3.9-1.2 2.3-2.7 3.6M6.5 6.9C3.5 8.7 2 11 2 12c0 .8 1.5 3.3 4.2 5.1A13.7 13.7 0 0012 19c1 0 1.9-.1 2.8-.3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  // eye
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {authErr && <div className="error">{authErr}</div>}

          <button type="submit" className="submit" disabled={loading}>
            {loading ? "Giriş edilir..." : "Daxil ol"}
          </button>
        </form>
      </div>

      {/* Sağ: Brand Panel */}
      <div
        className="brand-panel"
        style={{
          backgroundImage: `url(${back})`,
        }}
      >
        <img src={logo} alt="Logo" />
      </div>
    </div>
  );
}

export default Login;
