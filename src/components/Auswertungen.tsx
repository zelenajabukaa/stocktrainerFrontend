import React, { useEffect, useState } from 'react';
import styles from '../css/Auswertungen.module.css';
import Header from './Header';

interface Evaluation {
  id: number;
  end_date: string;
  start_budget: string;
  end_budget: string;
  profit_margin: string;
  prozentuale_aenderung: string;
  message: string;
}

const Auswertungen: React.FC = () => {
  const [data, setData] = useState<Evaluation[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:3000/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.id) {
          setUserId(data.user.id);
        }
      })
      .catch((err) => console.error('Fehler beim Abrufen des Profils:', err));
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/evaluations/${userId}`);
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Fehler beim Laden der Auswertungen:', error);
      }
    };

    fetchData();
  }, [userId]);


  return (
    <div className={styles.auswertungenPage}>
      <Header />
      <h1 className={styles.auswertungenTitle}>Auswertungen</h1>
      <div className={styles.auswertungenList}>
        {data.map((item) => (
          <div key={item.id} className={styles.auswertungBox}>
            <div className={styles.auswertungDate}>
              {new Date(item.end_date).toLocaleDateString()}
            </div>
          
            <div className={styles.auswertungDesc}>
              {item.message || 'Keine Beschreibung vorhanden.'}
            </div>
            <div className={styles.auswertungChange}>
              Gewinn: {item.profit_margin}Fr     Veränderung: {item.prozentuale_aenderung}%     Startbudget: {item.start_budget}     Endbudget: {item.end_budget}   
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Auswertungen;
