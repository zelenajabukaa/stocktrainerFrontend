import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../css/Profile.module.css';
import Header from './Header';

interface UserProfile {
    id: number;
    name: string;
    avatar?: string;
    level: number;
    xp: number;
    coins: number;
    stats: {
        totalStocksBought: number;
        totalStocksSelled: number;
        holdShares: number;
        weekTrades: number;
        percentageProfit: number;
    };
}

const Profile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token || !userId) {
            setError('Nicht angemeldet oder keine User-ID');
            setLoading(false);
            return;
        }

        // Lade User-Profil vom Backend
        fetch(`http://localhost:3000/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Profil nicht gefunden');
                }
                return res.json();
            })
            .then((data: UserProfile) => {
                setProfile(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Fehler beim Laden des Profils:', err);
                setError('Profil konnte nicht geladen werden');
                setLoading(false);
            });
    }, [userId, token]);

    const calculateNextLevelXP = (currentLevel: number): number => {
        return currentLevel * 100; // Beispiel: Level 1 = 100 XP, Level 2 = 200 XP
    };

    const calculateLevelProgress = (xp: number, level: number): number => {
        const currentLevelXP = (level - 1) * 100;
        const nextLevelXP = level * 100;
        const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        return Math.max(0, Math.min(100, progress));
    };

    if (loading) {
        return (
            <div className={styles.profileContainer}>
                <Header />
                <div className={styles.loading}>Lade Profil...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className={styles.profileContainer}>
                <Header />
                <div className={styles.error}>
                    <h2>Fehler</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/friends')} className={styles.backButton}>
                        Zurück zu Freunden
                    </button>
                </div>
            </div>
        );
    }

    const nextLevelXP = calculateNextLevelXP(profile.level);
    const levelProgress = calculateLevelProgress(profile.xp, profile.level);

    return (
        <div className={styles.profileContainer}>
            <Header />

            <div className={styles.profileHeader}>
                <button onClick={() => navigate('/friends')} className={styles.backButton}>
                    ← Zurück
                </button>
                <h1>Profil von {profile.name}</h1>
            </div>

            <div className={styles.profileContent}>
                {/* User Info Card */}
                <div className={styles.userCard}>
                    <div className={styles.avatar}>
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className={styles.userInfo}>
                        <h2>{profile.name}</h2>
                        <div className={styles.levelInfo}>
                            <span className={styles.level}>Level {profile.level}</span>
                            <div className={styles.xpBar}>
                                <div
                                    className={styles.xpProgress}
                                    style={{ width: `${levelProgress}%` }}
                                />
                            </div>
                            <span className={styles.xpText}>
                                {profile.xp} XP
                            </span>
                        </div>
                        <div className={styles.coins}>
                            <span className={styles.coinsIcon}>🪙</span>
                            {profile.coins.toLocaleString()} Coins
                        </div>
                    </div>
                </div>

                {/* Trading Stats */}
                <div className={styles.statsSection}>
                    <h3>Trading-Statistiken</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📈</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Aktien gekauft</span>
                                <span className={styles.statValue}>
                                    {profile.stats.totalStocksBought.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📉</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Aktien verkauft</span>
                                <span className={styles.statValue}>
                                    {profile.stats.totalStocksSelled.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>💼</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Portfolio-Größe</span>
                                <span className={styles.statValue}>
                                    {profile.stats.holdShares} Aktien
                                </span>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🏆</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Wöchentlicher Rekord</span>
                                <span className={styles.statValue}>
                                    {profile.stats.weekTrades} Trades
                                </span>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>💰</div>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Gewinn/Verlust</span>
                                <span className={`${styles.statValue} ${profile.stats.percentageProfit >= 0
                                    ? styles.positive
                                    : styles.negative
                                    }`}>
                                    {profile.stats.percentageProfit >= 0 ? '+' : ''}
                                    {profile.stats.percentageProfit.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
