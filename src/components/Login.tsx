import React, { useState, useEffect, useRef } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const stockLinesRef = useRef<any[]>([]);

  // Initialisiere Aktienlinien
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Erstelle mehrere Aktienlinien mit realistischen Zickzack-Bewegungen
    stockLinesRef.current = Array.from({ length: 6 }, (_, i) => ({
      points: [],
      baseY: canvas.height * (0.3 + i * 0.09), // Vertikale Verteilung
      speed: 0.05 + Math.random() * 0.5, // Geschwindigkeit
      direction: Math.random() > 0.5 ? 1 : -1, // Aktuelle Richtung
      stepSize: 15 + Math.random() * 25, // Horizontale Schrittweite
      volatility: 20 + Math.random() * 40, // Wie stark hoch/runter
      opacity: 0.5 + Math.random() * 0.4,
      changeCounter: 0,
      changeInterval: 3 + Math.random() * 7 // Wann Richtung wechseln
    }));

    // Initialisiere Startpunkte für jede Linie
    stockLinesRef.current.forEach(line => {
      let currentX = -100;
      let currentY = line.baseY;
      
      while (currentX <= canvas.width + 100) {
        line.points.push({ 
          x: currentX, 
          y: currentY
        });
        
        // Nächster Punkt mit Richtungsänderung
        currentX += line.stepSize;
        
        // Entscheide ob Richtung wechseln
        line.changeCounter++;
        if (line.changeCounter >= line.changeInterval) {
          line.direction *= -1; // Richtung umkehren
          line.changeCounter = 0;
          line.changeInterval = 2 + Math.random() * 6; // Neue Wechselfrequenz
        }
        
        // Berechne neue Y-Position
        const change = line.direction * (Math.random() * line.volatility);
        currentY = Math.max(50, Math.min(canvas.height - 50, currentY + change));
      }
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stockLinesRef.current.forEach(line => {
        // Bewege alle Punkte nach links
        line.points.forEach((point: any) => {
          point.x -= line.speed;
        });

        // Entferne Punkte, die den Bildschirm verlassen haben
        line.points = line.points.filter((point: any) => point.x > -100);

        // Füge neue Punkte rechts hinzu
        while (line.points.length === 0 || line.points[line.points.length - 1].x < canvas.width + 100) {
          const lastPoint = line.points[line.points.length - 1];
          const newX = lastPoint ? lastPoint.x + line.stepSize : canvas.width + 100;
          
          // Entscheide ob Richtung wechseln
          line.changeCounter++;
          if (line.changeCounter >= line.changeInterval) {
            line.direction *= -1; // Richtung umkehren
            line.changeCounter = 0;
            line.changeInterval = 2 + Math.random() * 6; // Neue Wechselfrequenz
          }
          
          // Berechne neue Y-Position basierend auf Richtung
          const lastY = lastPoint ? lastPoint.y : line.baseY;
          const change = line.direction * (10 + Math.random() * line.volatility);
          const newY = Math.max(50, Math.min(canvas.height - 50, lastY + change));
          
          line.points.push({ 
            x: newX, 
            y: newY
          });
        }

        // Zeichne die Aktienlinie mit Zickzack-Segmenten
        if (line.points.length > 1) {
          ctx.globalAlpha = line.opacity;
          ctx.lineWidth = 4; // Dickere Linien
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          for (let i = 0; i < line.points.length - 1; i++) {
            const point1 = line.points[i];
            const point2 = line.points[i + 1];
            
            if (point1.x > -50 && point1.x < canvas.width + 50) {
              // Bestimme Farbe basierend auf Richtung (hoch/runter)
              const isGoingUp = point2.y < point1.y; // Y-Achse ist umgekehrt
              const color = isGoingUp ? '#00ff88' : '#ff4444'; // Grün für hoch, Rot für runter
              
              ctx.strokeStyle = color;
              ctx.beginPath();
              ctx.moveTo(point1.x, point1.y);
              ctx.lineTo(point2.x, point2.y);
              ctx.stroke();
            }
          }
        }
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    <>
      {/* Animierter Hintergrund Canvas */}
      <canvas
        ref={canvasRef}
        className={styles.stockCanvas}
      />
      
      {/* Gradient Overlay für bessere Lesbarkeit */}
      <div className={styles.gradientOverlay} />
      
      {/* Login Container */}
      <div className={styles.loginContainer}>
        {/* Titel */}
        <div className={styles.loginTitleFixed}>
          <h1>Stocktrainer</h1>
        </div>
        
        {/* Form Wrapper */}
        <div className={styles.loginFormWrapper}>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
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
              {loading 
                ? (isRegistering ? 'Registriere...' : 'Logge ein...') 
                : (isRegistering ? 'Registrieren' : 'Login')}
            </button>

            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              disabled={loading}
              className={styles.toggleButton}
            >
              {isRegistering 
                ? 'Bereits registriert? Zum Login' 
                : 'Noch kein Account? Registrieren'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;