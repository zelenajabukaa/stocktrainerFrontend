import React from 'react';
import Header from './components/Header';
import { useNavigate } from 'react-router-dom';
import './css/home.css';

const Home: React.FC = () => {
  // Platzhalter für Username und Level
  let username = "Username";
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      if (userObj.username) username = userObj.username;
    }
  } catch {}
  const level = 1;
  const ingameCurrency = 0;
  const navigate = useNavigate();

  const handleButtonClick = (label: string) => {
    if (label === 'Neues Spiel') {
      navigate('/game/monthly');
    }
    else if (label === 'Quests') {
      navigate('/quests');}
    // ggf. weitere Navigationen für andere Buttons
  };

  return (
    <div className="main-bg">
      <Header />
      {/* Header mit Level, Username und Freunde-Button */}
      <div className="header-area">
        <div style={{ position: 'absolute', top: '2.5rem', right: '3rem', display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <div className="ingame-currency">Ingame Währung: {ingameCurrency} </div>
          <div className="lvl-badge">Lvl {level}</div>
        </div>
        <div className="center-col">
          <div className="username">{username}</div>
          <button className="friends-btn">Freunde</button>
        </div>
      </div>

      {/* Main Content: Hauptbereich und Sidebar füllen den Rest */}
      <div className="main-content">
        <div className="card card-main">Hauptbereich</div>
        <div className="card card-side card-side-vertical">
          <div className="sidebar-btns sidebar-btns-fill">
            {['Neues Spiel', 'Levelbelohnungen', 'Quests', 'Abzeichen', 'Auswertungen'].map((label, idx) => (
              <button
                className="friends-btn friends-btn-large sidebar-btn sidebar-btn-fill"
                key={idx}
                onClick={() => handleButtonClick(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
