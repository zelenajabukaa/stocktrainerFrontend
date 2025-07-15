
import React from 'react';
import './css/home.css';

const Home: React.FC = () => {
  // Platzhalter für Username und Level
  const username = "Username";
  const level = 1;
  const ingameCurrency = 0;

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
      </div>
    </div>
  );
};

export default Home;
