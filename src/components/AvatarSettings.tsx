

import React from 'react';
import styles from '../css/AvatarSettings.module.css';
import Header from './Header';
import avatar1 from '../../public/avatar/avatar1.png';
import avatar2 from '../../public/avatar/avatar2.png';
import avatar3 from '../../public/avatar/avatar3.png';
import avatar4 from '../../public/avatar/avatar4.png';
import avatar5 from '../../public/avatar/avatar5.png';
import avatar6 from '../../public/avatar/avatar6.png';
import avatar7 from '../../public/avatar/avatar7.png';
import avatar8 from '../../public/avatar/avatar8.png';
import avatar9 from '../../public/avatar/avatar9.png';


const AvatarSettings: React.FC = () => {
  // Array mit Avatar-Imports
  const avatarImages = [
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
    avatar8,
    avatar9,
  ];
  return (
    <div className={styles.avatarSettingsContainer}>
      <Header />
      <div className={styles.avatarSettingsContent}>
        <h2 className={styles.avatarTitle}>Avatar</h2>
        <div className={styles.avatarGrid}>
          {avatarImages.map((src, i) => (
            <div key={i} className={styles.avatarField}>
              <img
                src={src}
                alt={`Avatar ${i + 1}`}
                className={styles.avatarImg}
                draggable={false}
              />
              <button className={styles.avatarSelectButton}>
                Auswählen
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarSettings;
