

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/login.module.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: implement logic
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: implement logic
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement login logic
    // Hier direkt weiterleiten zu /home
    navigate("/home");
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-title-fixed']}>
        <h1>Stocktrainer</h1>
      </div>
      <div className={styles['login-form-wrapper']}>
        <form className={styles['login-form']} onSubmit={handleSubmit}>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
