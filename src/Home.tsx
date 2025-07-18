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
  };

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:3000/api/stats', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats(null));
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
          <button className="friends-btn">Freunde</button>
        </div>
      </div>

      <div className="main-content">
        <div className="card card-main" style={{ minHeight: '520px', paddingTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <h2 style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '0.03em', margin: 0, marginBottom: 18, textAlign: 'center' }}>Stats</h2>
          <div style={{ fontSize: '1.13rem', color: '#fff', opacity: 0.85, marginBottom: 32, textAlign: 'center', maxWidth: 700 }}>
            Here you can see your most important trading statistics and personal records. Track your progress and compare your best results!
          </div>
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 38, width: '100%', maxWidth: 1400, flex: 1, alignItems: 'stretch', justifyItems: 'center' }}>
              {/* weektrades */}
              <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 18, minWidth: 180, height: 'calc(100% - 16px)', padding: '38px 18px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: '1.35rem', marginBottom: 12 }}>Most Trades in a Week</div>
                <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#2563eb', marginBottom: 16 }}>{stats.weekTrades ?? '-'}</div>
                <div style={{ fontSize: '1.09rem', color: '#fff', opacity: 0.85 }}>Meiste Trades in einer Woche</div>
              </div>
              {/* totalStocksBought */}
              <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 18, minWidth: 180, height: 'calc(100% - 16px)', padding: '38px 18px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: '1.35rem', marginBottom: 12 }}>Total Stocks Bought</div>
                <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#2563eb', marginBottom: 16 }}>{stats.totalStocksBought ?? '-'}</div>
                <div style={{ fontSize: '1.09rem', color: '#fff', opacity: 0.85 }}>Totale Aktien gekauft</div>
              </div>
              {/* holdShares */}
              <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 18, minWidth: 180, height: 'calc(100% - 16px)', padding: '38px 18px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: '1.35rem', marginBottom: 12 }}>Hold Different Shares</div>
                <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#2563eb', marginBottom: 16 }}>{stats.holdShares ?? '-'}</div>
                <div style={{ fontSize: '1.09rem', color: '#fff', opacity: 0.85 }}>Von unterschiedlichen Aktienkursen Aktien gleichzeitig haben</div>
              </div>
              {/* totalStocksSelled */}
              <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 18, minWidth: 180, height: 'calc(100% - 16px)', padding: '38px 18px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: '1.35rem', marginBottom: 12 }}>Total Stocks Sold</div>
                <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#2563eb', marginBottom: 16 }}>{stats.totalStocksSelled ?? '-'}</div>
                <div style={{ fontSize: '1.09rem', color: '#fff', opacity: 0.85 }}>Total verkaufte Aktien</div>
              </div>
              {/* percentageProfit */}
              <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 18, minWidth: 180, height: 'calc(100% - 16px)', padding: '38px 18px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: '1.35rem', marginBottom: 12 }}>Highest Percentage Profit</div>
                <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#2563eb', marginBottom: 16 }}>{stats.percentageProfit ?? '-'}</div>
                <div style={{ fontSize: '1.09rem', color: '#fff', opacity: 0.85 }}>Höchste prozentuale Profit</div>
              </div>
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
