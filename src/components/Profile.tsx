import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../css/Profile.module.css';
import Header from './Header';
import '../css/usernameColors.css';

interface UserProfile {
    id: number;
    name: string;
    avatar?: string;
    level: number;
    xp: number;
    coins: number;
    nameColor?: string;
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

    // Funktion zum Ermitteln der CSS-Klasse für Namensfarben
    const getNameColorClass = (nameColor: string | undefined): string => {
        if (!nameColor) return '';

        const colorMapping: { [key: string]: string } = {
            'red': 'username-red',
            'blue': 'username-blue',
            'green': 'username-green',
            'yellow': 'username-yellow',
            'orange': 'username-orange',
            'purple': 'username-purple',
            'pink': 'username-pink',
            'cyan': 'username-cyan',
            'lime': 'username-lime',
            'teal': 'username-teal',
            'neon': 'username-neon',
            'silber': 'username-silber',
            'gold': 'username-gold',
            'diamond': 'username-diamond',
            'ruby': 'username-ruby',
            'emerald': 'username-emerald',
            'sapphire': 'username-sapphire',
            'amethyst': 'username-amethyst',
            'topaz': 'username-topaz',
            'obsidian': 'username-obsidian',
            'rainbow': 'username-rainbow',
            'plasma': 'username-plasma',
            'cosmic': 'username-cosmic'
        };

        return colorMapping[nameColor] || '';
    };

    useEffect(() => {
        if (!token || !userId) {
            setError('Nicht angemeldet oder keine User-ID');
            setLoading(false);
            return;
        }

        // Lade User-Profil und Namensfarbe
        const fetchProfileWithColor = async () => {
            try {
                // Erste Anfrage: User-Profil laden
                const profileResponse = await fetch(`http://localhost:3000/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!profileResponse.ok) {
                    throw new Error('Profil nicht gefunden');
                }

                const profileData: UserProfile = await profileResponse.json();

                // Zweite Anfrage: Namensfarbe laden
                try {
                    const colorsResponse = await fetch('http://localhost:3000/api/user-name/all-users-colors', {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (colorsResponse.ok) {
                        const colorsData = await colorsResponse.json();

                        // Finde die Namensfarbe für diesen User
                        const userColorData = colorsData.find((user: any) =>
                            user.username === profileData.name
                        );

                        if (userColorData && userColorData.nameColor) {
                            profileData.nameColor = userColorData.nameColor;
                        }
                    }
                } catch (colorError) {
                    console.log('Namensfarbe konnte nicht geladen werden:', colorError);
                    // Profil trotzdem anzeigen, nur ohne Farbe
                }

                setProfile(profileData);
                setLoading(false);
            } catch (err) {
                console.error('Fehler beim Laden des Profils:', err);
                setError('Profil konnte nicht geladen werden');
                setLoading(false);
            }
        };

        fetchProfileWithColor();
    }, [userId, token]);

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

    const levelProgress = calculateLevelProgress(profile.xp, profile.level);

    return (
        <div className={styles.profileContainer}>
            <Header />

            <div className={styles.profileHeader}>
                <button onClick={() => navigate('/friends')} className={styles.backButton}>
                    ← Zurück
                </button>
                <h1>
                    Profil von{' '}
                    <span className={getNameColorClass(profile.nameColor)}>
                        {profile.name}
                    </span>
                </h1>
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
                        <h2>
                            <span className={getNameColorClass(profile.nameColor)}>
                                {profile.name}
                            </span>
                        </h2>
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
