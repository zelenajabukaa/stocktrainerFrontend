import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import styles from '../css/Settings.module.css';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    id: number;
    username: string;
    level: number;
    ingameCurrency: number;
    xp: number;
  }>({
    id: 0,
    username: '',
    level: 0,
    ingameCurrency: 0,
    xp: 0,
  });

  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Loading states
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load user profile & user names
  const [userNames, setUserNames] = useState<Array<{ name_id: number; name: string; selected: boolean }>>([]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetch('http://localhost:3000/api/profile', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser({
            id: data.user.id,
            username: data.user.username ?? '',
            level: data.user.level ?? 0,
            ingameCurrency: data.user.ingameCurrency ?? 0,
            xp: data.user.xp_points ?? 0,
          });
          setNewUsername(data.user.username ?? '');
        }
      })
      .catch(() => {
        setError('Fehler beim Laden des Profils');
      });

    // Hole freigeschaltete Namenfarben
    const fetchUserNames = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/me/names', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const userNameRows = await res.json(); // [{name_id, bought, selected}]
        // Hole die Namen selbst
        const resNames = await fetch('http://localhost:3000/api/names', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const nameRows = await resNames.json(); // [{id, name, coins}]
        // Mappen
        const unlocked = userNameRows.filter((n: any) => n.bought).map((n: any) => ({
          name_id: n.name_id,
          name: nameRows.find((row: any) => row.id === n.name_id)?.name ?? '',
          selected: !!n.selected,
        }));
        setUserNames(unlocked);
      } catch (err) {
        setError('Fehler beim Laden der Namenfarben');
      }
    };
    fetchUserNames();
  }, [navigate]);
  // Namefarbe auswählen
  const handleSelectNameColor = async (name_id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/api/select-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name_id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserNames(prev => prev.map(n => ({ ...n, selected: n.name_id === name_id })));
        setMessage('Namefarbe erfolgreich ausgewählt');
      } else {
        setError(data.error || 'Fehler beim Auswählen der Namefarbe');
      }
    } catch (err) {
      setError('Serverfehler beim Auswählen der Namefarbe');
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Update username
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingUsername(true);
    setError('');
    setMessage('');

    if (!newUsername.trim()) {
      setError('Benutzername darf nicht leer sein');
      setIsUpdatingUsername(false);
      return;
    }

    if (newUsername === user.username) {
      setError('Neuer Benutzername ist identisch mit dem aktuellen');
      setIsUpdatingUsername(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(prev => ({ ...prev, username: newUsername }));
        setMessage('Benutzername erfolgreich aktualisiert');
        
        // Update localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          userObj.username = newUsername;
          localStorage.setItem('user', JSON.stringify(userObj));
        }
      } else {
        setError(data.error || 'Fehler beim Aktualisieren des Benutzernamens');
      }
    } catch (err) {
      setError('Serverfehler beim Aktualisieren des Benutzernamens');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setError('');
    setMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Alle Passwort-Felder müssen ausgefüllt werden');
      setIsUpdatingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Neues Passwort und Bestätigung stimmen nicht überein');
      setIsUpdatingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Neues Passwort muss mindestens 6 Zeichen lang sein');
      setIsUpdatingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Passwort erfolgreich aktualisiert');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Fehler beim Aktualisieren des Passworts');
      }
    } catch (err) {
      setError('Serverfehler beim Aktualisieren des Passworts');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeletingAccount(true);
    setError('');
    setMessage('');

    if (deleteConfirmation !== user.username) {
      setError('Bestätigung stimmt nicht mit dem Benutzernamen überein');
      setIsDeletingAccount(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
      } else {
        const data = await response.json();
        setError(data.error || 'Fehler beim Löschen des Kontos');
      }
    } catch (err) {
      setError('Serverfehler beim Löschen des Kontos');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <Header />
      <div className={styles.settingsContent}>
        <h1 className={styles.title}>Einstellungen</h1>
        
        {/* Messages */}
        {message && <div className={styles.successMessage}>{message}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Username Update Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Benutzername ändern</h2>
          <form onSubmit={handleUpdateUsername} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="newUsername">Neuer Benutzername:</label>
              <input
                id="newUsername"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className={styles.input}
                disabled={isUpdatingUsername}
              />
            </div>
            <button 
              type="submit" 
              className={styles.updateButton}
              disabled={isUpdatingUsername}
            >
              {isUpdatingUsername ? 'Wird aktualisiert...' : 'Benutzername aktualisieren'}
            </button>
          </form>
        </div>

        {/* Namefarben Einstellungen */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Namenfarbe auswählen</h2>
          {userNames.length === 0 ? (
            <p className={styles.infoText}>Du hast noch keine Namenfarbe freigeschaltet.</p>
          ) : (
            <div className={styles.nameColorList}>
              <button
                className={userNames.every(n => !n.selected) ? styles.selectedNameColorBtn : styles.nameColorBtn}
                onClick={async () => {
                  // Backend: Alle selected auf 0 setzen
                  const token = localStorage.getItem('token');
                  if (!token) return;
                  try {
                    const res = await fetch('http://localhost:3000/api/deselect-name', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setUserNames(prev => prev.map(n => ({ ...n, selected: false })));
                      setMessage('Keine Namenfarbe ausgewählt');
                    } else {
                      setError(data.error || 'Fehler beim Entfernen der Namenfarbe');
                    }
                  } catch (err) {
                    setError('Serverfehler beim Entfernen der Namenfarbe');
                  }
                }}
                disabled={userNames.every(n => !n.selected)}
              >
                Keine Farbe {userNames.every(n => !n.selected) ? '(aktiv)' : ''}
              </button>
              {userNames.map((n) => (
                <button
                  key={n.name_id}
                  className={n.selected ? styles.selectedNameColorBtn : styles.nameColorBtn}
                  onClick={() => handleSelectNameColor(n.name_id)}
                  disabled={n.selected}
                >
                  {n.name} {n.selected ? '(aktiv)' : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Password Update Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Passwort ändern</h2>
          <form onSubmit={handleUpdatePassword} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="currentPassword">Aktuelles Passwort:</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.input}
                disabled={isUpdatingPassword}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">Neues Passwort:</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                disabled={isUpdatingPassword}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Neues Passwort bestätigen:</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                disabled={isUpdatingPassword}
              />
            </div>
            <button 
              type="submit" 
              className={styles.updateButton}
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? 'Wird aktualisiert...' : 'Passwort aktualisieren'}
            </button>
          </form>
        </div>

        {/* Delete Account Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Konto löschen</h2>
          <div className={styles.dangerZone}>
            <p className={styles.warningText}>
              ⚠️ Warnung: Diese Aktion kann nicht rückgängig gemacht werden!
            </p>
            <p className={styles.infoText}>
              Alle deine Daten, einschließlich Fortschritt, Avatare und Erfolge werden permanent gelöscht.
            </p>
            <form onSubmit={handleDeleteAccount} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="deleteConfirmation">
                  Gib deinen Benutzernamen "{user.username}" ein, um zu bestätigen:
                </label>
                <input
                  id="deleteConfirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className={styles.input}
                  disabled={isDeletingAccount}
                  placeholder={user.username}
                />
              </div>
              <button 
                type="submit" 
                className={styles.deleteButton}
                disabled={isDeletingAccount || deleteConfirmation !== user.username}
              >
                {isDeletingAccount ? 'Wird gelöscht...' : 'Konto endgültig löschen'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;