import React, { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import { useNavigate } from 'react-router-dom';
import './css/home.css';

const Home: React.FC = () => {
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const stockLinesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    stockLinesRef.current = Array.from({ length: 8 }, (_, i) => ({
      points: [],
      baseY: canvas.height * (0.2 + i * 0.13),
      speed: 0.001 + Math.random() * 0.3,
      direction: Math.random() > 0.5 ? 1 : -1,
      stepSize: 15 + Math.random() * 25,
      volatility: 20 + Math.random() * 40,
      opacity: 0.5 + Math.random() * 0.4,
      changeCounter: 0,
      changeInterval: 3 + Math.random() * 7
    }));

    stockLinesRef.current.forEach(line => {
      let currentX = -100;
      let currentY = line.baseY;

      while (currentX <= canvas.width + 100) {
        line.points.push({ x: currentX, y: currentY });
        currentX += line.stepSize;
        line.changeCounter++;

        if (line.changeCounter >= line.changeInterval) {
          line.direction *= -1;
          line.changeCounter = 0;
          line.changeInterval = 2 + Math.random() * 6;
        }

        const change = line.direction * (Math.random() * line.volatility);
        currentY = Math.max(50, Math.min(canvas.height - 50, currentY + change));
      }
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stockLinesRef.current.forEach(line => {
        line.points.forEach((point: any) => point.x -= line.speed);
        line.points = line.points.filter((point: any) => point.x > -100);

        while (line.points.length === 0 || line.points[line.points.length - 1].x < canvas.width + 100) {
          const lastPoint = line.points[line.points.length - 1];
          const newX = lastPoint ? lastPoint.x + line.stepSize : canvas.width + 100;

          line.changeCounter++;
          if (line.changeCounter >= line.changeInterval) {
            line.direction *= -1;
            line.changeCounter = 0;
            line.changeInterval = 2 + Math.random() * 6;
          }

          const lastY = lastPoint ? lastPoint.y : line.baseY;
          const change = line.direction * (10 + Math.random() * line.volatility);
          const newY = Math.max(50, Math.min(canvas.height - 50, lastY + change));

          line.points.push({ x: newX, y: newY });
        }

        if (line.points.length > 1) {
          ctx.globalAlpha = line.opacity;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          for (let i = 0; i < line.points.length - 1; i++) {
            const point1 = line.points[i];
            const point2 = line.points[i + 1];

            if (point1.x > -50 && point1.x < canvas.width + 50) {
              const isGoingUp = point2.y < point1.y;
              const color = isGoingUp ? '#00ff88' : '#ff4444';

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

  const handleButtonClick = (label: string) => {
    if (label === 'Neues Spiel') navigate('/game/monthly');
    else if (label === 'Quests') navigate('/quests');
    else if (label === 'Levelbelohnungen') navigate('/levelbelohnungen');
    else if (label === 'Abzeichen') navigate('/user/successes');
    else if (label === 'Auswertungen') navigate('/auswertungen');
  };

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch('http://localhost:3000/api/stats', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(() => {
        setStats(null);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="main-bg">
      <canvas ref={canvasRef} className="stockCanvas" />
      <div className="gradientOverlay" />

      <Header />

      <div className="header-area">
        <div></div>
        <div className="center-col">
          <div className="username">{username}</div>
          <button className="friends-btn" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
        </div>
      </div>

      <div className="main-content">
        <div className="card card-main" style={{ minHeight: '520px', paddingTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <h2 className="stats-title">Stats</h2>
          <div className="stats-description">
            Here you can see your most important trading statistics and personal records. Track your progress and compare your best results!
          </div>
          
          {isLoading ? (
            <div className="loading-stats">
              <div className="loading-spinner"></div>
              Loading your epic stats...
            </div>
          ) : stats ? (
            <div className="stats-grid">
              {/* Most Trades in a Week */}
              <div className="stats-card">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="stats-card-title">Most Trades in a Week</div>
                <div className="stats-card-value">{stats.weekTrades ?? '-'}</div>
                <div className="stats-card-description">Meiste Trades in einer Woche</div>
              </div>

              {/* Total Stocks Bought */}
              <div className="stats-card">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="stats-card-title">Total Stocks Bought</div>
                <div className="stats-card-value">{stats.totalStocksBought ?? '-'}</div>
                <div className="stats-card-description">Totale Aktien gekauft</div>
              </div>

              {/* Hold Different Shares */}
              <div className="stats-card">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="stats-card-title">Hold Different Shares</div>
                <div className="stats-card-value">{stats.holdShares ?? '-'}</div>
                <div className="stats-card-description">Von unterschiedlichen Aktienkursen Aktien gleichzeitig haben</div>
              </div>

              {/* Total Stocks Sold */}
              <div className="stats-card">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="stats-card-title">Total Stocks Sold</div>
                <div className="stats-card-value">{stats.totalStocksSelled ?? '-'}</div>
                <div className="stats-card-description">Total verkaufte Aktien</div>
              </div>

              {/* Highest Percentage Profit */}
              <div className="stats-card">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="stats-card-title">Highest Percentage Profit</div>
                <div className="stats-card-value">{stats.percentageProfit ?? '-'}</div>
                <div className="stats-card-description">Höchste prozentuale Profit</div>
              </div>
            </div>
          ) : (
            <div className="error-message">
              Failed to load stats. Please try again later.
            </div>
          )}
        </div>
        
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