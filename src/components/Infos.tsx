
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Infos.module.css';

const Infos: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles['infos-bg']}>
      <div className={styles['infos-container']}>
        <h1 className={styles['infos-title']}>Über das Programm</h1>
        <p className={styles['infos-text']}>
          Willkommen bei Stocktrainer! Diese Plattform verbindet spielerisches Lernen mit echtem Börsen-Feeling. Hier kannst du Aktien handeln, Quests abschließen, XP sammeln, Level aufsteigen und dich mit anderen messen. Das Ziel: Spaß am Trading, Lernen und Motivation durch Gamification.
        </p>
        <h2 className={styles['infos-section-title']}>Wichtige Funktionen</h2>
        <ul className={styles['infos-list']}>
          <li><b>Trading:</b> Kaufe und verkaufe Aktien, beobachte Kursverläufe und baue dein Portfolio auf. Ziel ist es, dein virtuelles Kapital durch geschicktes Handeln zu vermehren.</li>
          <li><b>XP & Level:</b> Für jede Aktion und abgeschlossene Quest erhältst du XP. Mit mehr XP steigst du im Level auf und schaltest neue Features und Avatare frei.</li>
          <li><b>Quests:</b> Es gibt 5 verschiedene Quest-Arten, die dich zu unterschiedlichen Spielweisen motivieren:<br />
            <ul style={{ marginTop: 8, marginBottom: 8 }}>
              <li><b>Kauf-Quests:</b> Kaufe eine bestimmte Anzahl von Aktien.</li>
              <li><b>Verkaufs-Quests:</b> Verkaufe eine bestimmte Anzahl von Aktien.</li>
              <li><b>Diversität-Quests:</b> Halte Aktien von verschiedenen Firmen gleichzeitig.</li>
              <li><b>Gewinn-Quests:</b> Erziele einen bestimmten Gewinn mit deinen Trades.</li>
              <li><b>Aktivitäts-Quests:</b> Führe eine bestimmte Anzahl von Trades in einem Zeitraum aus.</li>
            </ul>
            Jede Quest bringt XP und oft auch Coins als Belohnung.
          </li>
          <li><b>Abzeichen (Badges):</b> Für jede Quest-Art gibt es ein eigenes Abzeichen. Wenn du alle Quests einer Art abgeschlossen hast, erhältst du das entsprechende Abzeichen. Die Abzeichen zeigen deine Vielseitigkeit und deinen Fortschritt und sind im Profil und Leaderboard sichtbar.</li>
          <li><b>Coins & Avatare:</b> Mit Coins kannst du Avatare kaufen und dein Profil individuell gestalten.</li>
          <li><b>Statistiken:</b> Sieh deine wichtigsten Trading-Daten und Rekorde auf einen Blick.</li>
          <li><b>Leaderboard:</b> Vergleiche dich mit anderen Nutzern und sieh, wer die besten Trader sind.</li>
        </ul>
        <h2 className={styles['infos-section-title-small']}>Spielprinzip & Ablauf</h2>
        <ol className={styles['infos-ol']}>
          <li>Registriere dich und logge dich ein.</li>
          <li>Starte ein neues Spiel und beginne mit dem Aktienhandel. Beobachte die Kursverläufe und nutze verschiedene Strategien.</li>
          <li>Erfülle die 5 verschiedenen Quest-Arten, um XP und Coins zu sammeln und Abzeichen zu erhalten.</li>
          <li>Steige im Level auf und schalte neue Avatare und Features frei.</li>
          <li>Sammle Abzeichen, indem du alle Quests einer Kategorie abschließt.</li>
          <li>Vergleiche deine Erfolge im Leaderboard und miss dich mit anderen Spielern.</li>
        </ol>
        <h2 className={styles['infos-section-title-small']}>Tipps für den Einstieg</h2>
        <ul className={styles['infos-list']}>
          <li>Teste verschiedene Trading-Strategien und beobachte die Kursentwicklung.</li>
          <li>Erfülle regelmäßig Quests, um schneller XP und Coins zu sammeln.</li>
          <li>Nutze Coins für Avatare und Individualisierung deines Profils.</li>
          <li>Schau regelmäßig ins Leaderboard und vergleiche dich mit anderen.</li>
        </ul>
        <h2 className={styles['infos-section-title-tiny']}>Support & Kontakt</h2>
        <p className={styles['infos-support']}>
          Bei Fragen oder Problemen kannst du uns jederzeit kontaktieren. Viel Erfolg und Spaß beim Trading!
        </p>
        <button className={styles['infos-btn']} onClick={() => navigate('/home')}>
          Jetzt starten
        </button>
      </div>
    </div>
  );
};

export default Infos;
