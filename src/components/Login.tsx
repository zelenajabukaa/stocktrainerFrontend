// src/components/Login.tsx (erweitert mit Registration)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, register as apiRegister } from "../utils/api";
import { setToken } from "../utils/auth";
import styles from "../css/login.module.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Input-Validierung
    if (!username.trim() || !password.trim()) {
      alert("Bitte fülle alle Felder aus");
      setLoading(false);
      return;
    }

    if (isRegistering && password.length < 6) {
      alert("Passwort muss mindestens 6 Zeichen lang sein");
      setLoading(false);
      return;
    }

    try {
      const data = isRegistering
        ? await apiRegister(username, password)
        : await apiLogin(username, password);

      // Token sicher speichern
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log(`${isRegistering ? 'Registrierung' : 'Login'} erfolgreich:`, data.user);
      navigate("/home");

    } catch (error) {
      console.error(`Fehler beim ${isRegistering ? 'Registrieren' : 'Login'}:`, error);
      alert(error instanceof Error ? error.message : `Serverfehler beim ${isRegistering ? 'Registrieren' : 'Login'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-title-fixed']}>
        <h1>Stocktrainer</h1>
      </div>
      <div className={styles['login-form-wrapper']}>
        <form className={styles['login-form']} onSubmit={handleSubmit}>
          <h2>{isRegistering ? 'Registrieren' : 'Login'}</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            autoComplete="username"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete={isRegistering ? "new-password" : "current-password"}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? (isRegistering ? 'Registriere...' : 'Logge ein...') : (isRegistering ? 'Registrieren' : 'Login')}
          </button>

          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            disabled={loading}
            className={styles['toggle-button']}
          >
            {isRegistering ? 'Bereits registriert? Zum Login' : 'Noch kein Account? Registrieren'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
