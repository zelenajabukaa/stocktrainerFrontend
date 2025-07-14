
import React from 'react';
import '../css/header.css';

const Header: React.FC<{ level?: number; username?: string }> = ({ level = 1, username = "Username" }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <header className="header-bar">
      {/* Username mittig */}
      <div className="username">{username}</div>
      {/* Rechts: Level-Badge und Kreis nebeneinander */}
      <div className="right-group" ref={menuRef}>
        <div className="lvl-badge">Lvl {level}</div>
        <button
          className="menu-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Menü öffnen"
        >
          R
        </button>
        {/* Dropdown-Menü */}
        {menuOpen && (
          <div className="dropdown-menu">
            <button>Profil</button>
            <button>Einstellungen</button>
            <button>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
