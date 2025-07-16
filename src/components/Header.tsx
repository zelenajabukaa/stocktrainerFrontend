// Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Header.module.css';
import coin from '../assets/coin.png';


const Header: React.FC<{ username: string; level: number; ingameCurrency: number }> = ({ username, level, ingameCurrency }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  

  async function handleLogout() {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    } catch (e) {
      alert('Logout fehlgeschlagen');
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <header className={styles.headerBar}>
      <div className={styles.leftInfo}>
        <div className={styles.ingameCurrency}>
        <img src={coin} alt="Coin" />
        {ingameCurrency}
        </div>
        <div className={styles.levelBadge}>Lvl {level}</div>
      </div>
      
      <div className={styles.avatarMenuWrapper} ref={menuRef}>
        <button className={styles.homeLinkBtn} onClick={() => navigate('/home')} aria-label="Home">
          Home
        </button>
        <button
          className={styles.avatarCircle}
          onClick={() => setOpen((v) => !v)}
          aria-label="Optionen"
        >
          <span className={styles.avatarInitials}>A</span>
        </button>
        {open && (
          <div className={styles.menuDropdown}>
            <button className={styles.menuItem}>Einstellungen</button>
            <button className={styles.menuItem}>Avatar ändern</button>
            <button className={styles.menuItem} onClick={handleLogout}>Ausloggen</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;