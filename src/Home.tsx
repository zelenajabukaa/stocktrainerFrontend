import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/home.css';

const Home: React.FC = () => {
  // Platzhalter für Username und Level
  const username = "Username";
  const level = 1;
  const ingameCurrency = 0;
  const navigate = useNavigate();

  const handleButtonClick = (label: string) => {
    if (label === 'Neues Spiel') {
      navigate('/game/monthly');
    }
    // ggf. weitere Navigationen für andere Buttons
  };

  return (
    <div className="main-bg">
      {/* Header mit Level, Username und Freunde-Button */}
      <div className="header-area">
        <div className="lvl-badge">Lvl {level}</div>
        <div className="ingame-currency">Ingame Währung: {ingameCurrency}</div>
        <div className="center-col">
          <div className="username">{username}</div>
          <button className="friends-btn">Freunde</button>
        </div>
      </div>

      {/* Main Content: Hauptbereich und Sidebar füllen den Rest */}
      <div className="main-content">
        <div className="card card-main">Hauptbereich</div>
        <div className="card card-side">Sidebar</div>

        <div className="card card-side">
          {['Neues Spiel', 'Levelbelohnungen', 'Quests', 'Abzeichen', 'Auswertungen', 'Einstellungen'].map((label, idx) => (
            <button
              className="friends-btn friends-btn-large"
              key={idx}
              onClick={() => handleButtonClick(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
