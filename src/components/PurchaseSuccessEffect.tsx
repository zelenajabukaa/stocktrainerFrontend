import React, { useEffect, useState } from 'react';
import styles from './PurchaseSuccessEffect.module.css';

interface PurchaseSuccessEffectProps {
    show: boolean;
    stockSymbol: string;
    shares: number;
    onComplete: () => void;
}

const PurchaseSuccessEffect: React.FC<PurchaseSuccessEffectProps> = ({
    show,
    stockSymbol,
    shares,
    onComplete
}) => {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        if (!show) return;

        const timeouts: ReturnType<typeof setTimeout>[] = [];

        // Stage 1: Zoom in
        timeouts.push(setTimeout(() => setStage(1), 100));

        // Stage 2: Success message
        timeouts.push(setTimeout(() => setStage(2), 800));

        // Stage 3: Fade out
        timeouts.push(setTimeout(() => setStage(3), 2000));

        // Complete
        timeouts.push(setTimeout(() => {
            setStage(0);
            onComplete();
        }, 2500));

        return () => timeouts.forEach(clearTimeout);
    }, [show, onComplete]);

    if (!show) return null;

    return (
        <div className={`${styles.effectOverlay} ${stage > 0 ? styles.show : ''}`}>
            <div className={`${styles.effectContainer} ${styles[`stage${stage}`]}`}>
                <div className={styles.successIcon}>
                    <svg viewBox="0 0 50 50" className={styles.checkmark}>
                        <circle
                            className={styles.checkmarkCircle}
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="#28a745"
                            strokeWidth="3"
                        />
                        <path
                            className={styles.checkmarkCheck}
                            fill="none"
                            stroke="#28a745"
                            strokeWidth="3"
                            d="M14,25 L22,33 L36,19"
                        />
                    </svg>
                </div>

                <div className={styles.purchaseDetails}>
                    <h2>Kauf erfolgreich! 🎉</h2>
                    <div className={styles.stockInfo}>
                        <span className={styles.shares}>{shares}</span>
                        <span className={styles.stockName}>{stockSymbol}</span>
                        <span>Aktien gekauft</span>
                    </div>
                </div>

                {/* Animated particles */}
                <div className={styles.particles}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={`${styles.particle} ${styles[`particle${i % 5}`]}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PurchaseSuccessEffect;
