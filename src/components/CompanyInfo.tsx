import React, { useState, useEffect } from 'react';
import styles from '../Game.module.css';

interface CompanyData {
    name: string;
    logo: string;
    description: string;
    history: string;
    industry: string;
    founded: string;
    headquarters: string;
    employees: string;
    website: string;
}

interface CompanyInfoProps {
    isOpen: boolean;
    onToggle: () => void;
    stockSymbol: string;
    stockColor: string;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({
    isOpen,
    onToggle,
    stockSymbol,
    stockColor
}) => {
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen && stockSymbol) {
            loadCompanyData();
        }
    }, [isOpen, stockSymbol]);

    const loadCompanyData = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/company-info.json');
            if (!response.ok) {
                throw new Error('Unternehmensdaten konnten nicht geladen werden');
            }

            const allCompanyData = await response.json();
            const data = allCompanyData[stockSymbol];

            if (!data) {
                throw new Error('Keine Daten für dieses Unternehmen verfügbar');
            }

            setCompanyData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.companyInfoContainer}>
            <div className={styles.companyInfoHeader}>
                <h3 className={styles.companyInfoTitle}>
                    <span className={styles.companyInfoIcon}></span>
                    Unternehmensinformationen
                </h3>
                <button
                    onClick={onToggle}
                    className={styles.companyInfoCloseBtn}
                >
                    ✕
                </button>
            </div>

            {loading && (
                <div className={styles.companyInfoLoading}>
                    Lade Unternehmensdaten...
                </div>
            )}

            {error && (
                <div className={styles.companyInfoError}>
                    {error}
                </div>
            )}

            {companyData && (
                <div className={styles.companyInfoContent}>
                    <div className={styles.companyInfoMain}>
                        <div className={styles.companyLogo}>
                            <img
                                src={`/logos/${companyData.logo}`}
                                alt={`${companyData.name} Logo`}
                                className={styles.logoImage}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                            <div className={styles.companyNameBadge}>
                                <span
                                    className={styles.stockSymbolBadge}
                                    style={{ backgroundColor: stockColor }}
                                >
                                    {stockSymbol}
                                </span>
                                <h4 className={styles.companyName}>{companyData.name}</h4>
                            </div>
                        </div>

                        <div className={styles.companyDetails}>
                            <div className={styles.companySection}>
                                <h5 className={styles.sectionTitle}>Über das Unternehmen</h5>
                                <p className={styles.companyDescription}>
                                    {companyData.description}
                                </p>
                            </div>

                            <div className={styles.companySection}>
                                <h5 className={styles.sectionTitle}>Geschichte</h5>
                                <p className={styles.companyHistory}>
                                    {companyData.history}
                                </p>
                            </div>

                            <div className={styles.companyFacts}>
                                <div className={styles.factItem}>
                                    <span className={styles.factLabel}>Branche:</span>
                                    <span className={styles.factValue}>{companyData.industry}</span>
                                </div>
                                <div className={styles.factItem}>
                                    <span className={styles.factLabel}>Gegründet:</span>
                                    <span className={styles.factValue}>{companyData.founded}</span>
                                </div>
                                <div className={styles.factItem}>
                                    <span className={styles.factLabel}>Hauptsitz:</span>
                                    <span className={styles.factValue}>{companyData.headquarters}</span>
                                </div>
                                <div className={styles.factItem}>
                                    <span className={styles.factLabel}>Mitarbeiter:</span>
                                    <span className={styles.factValue}>{companyData.employees}</span>
                                </div>
                                <div className={styles.factItem}>
                                    <span className={styles.factLabel}>Website:</span>
                                    <span className={styles.factValue}>
                                        <a
                                            href={`https://${companyData.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.websiteLink}
                                        >
                                            {companyData.website}
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyInfo;
