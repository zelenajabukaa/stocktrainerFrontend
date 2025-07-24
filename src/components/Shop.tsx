import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import styles from '../css/Shop.module.css';
import coin from '../assets/coin.png';

interface ShopItem {
  id: number;
  name: string;
  price: number;
  owned: boolean;
  preview?: string;
  description?: string;
}

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'themes' | 'names'>('themes');
  const [userCoins, setUserCoins] = useState(0);
  const [nameShopItems, setNameShopItems] = useState<ShopItem[]>([]);

  // Sample shop items
  const shopItems = {
    themes: [
      { id: 101, name: 'Dunkles Theme', price: 100, owned: false, description: 'Elegante dunkle Oberfläche für deine Augen' },
      { id: 102, name: 'Neon Glow', price: 150, owned: false, description: 'Futuristisches Neon-Design mit Glow-Effekten' },
      { id: 103, name: 'Naturgrün', price: 80, owned: false, description: 'Beruhigendes Grün-Theme inspiriert von der Natur' },
      { id: 104, name: 'Königsblau', price: 120, owned: false, description: 'Majestätisches blaues Design für wahre Könige' },
      { id: 105, name: 'Sunset Orange', price: 90, owned: false, description: 'Warme Sonnenuntergangs-Farben' },
    ] as ShopItem[],
    names: nameShopItems,
  };

  useEffect(() => {
    fetchUserData();
    fetchNames();

  }, []);

  // Hole Namen und Preise aus der Datenbank
  const fetchNames = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/api/names', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json(); // [{id, name, coins}]
      // Hole gekaufte Namen
      const resOwned = await fetch('http://localhost:3000/api/me/names', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const ownedData = await resOwned.json(); // [{name_id, bought, selected}]
      // Mappe zu ShopItem, owned = bought==1
      const items: ShopItem[] = data.map((n: any) => {
        const userName = ownedData.find((u: any) => u.name_id === n.id);
        return {
          id: n.id,
          name: n.name,
          price: n.coins,
          owned: userName ? !!userName.bought : false,
          description: '',
        };
      });
      setNameShopItems(items);
    } catch (err) {
      console.error('Fehler beim Laden der Namen:', err);
    }
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3000/api/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data?.user) {
        setUserCoins(data.user.ingameCurrency || 0);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    if (userCoins < item.price) {
      alert('Nicht genügend Coins!');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      if (activeTab === 'names') {
        // Kaufe Name über API
        const res = await fetch('http://localhost:3000/api/buy-name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name_id: item.id }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUserCoins(prev => prev - item.price);
          setNameShopItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true } : i));
          alert(`${item.name} erfolgreich gekauft!`);
        } else {
          alert(data.error || 'Kauf fehlgeschlagen!');
        }
      } else {
        // Simulierter Kauf für Avatare/Themes
        setUserCoins(prev => prev - item.price);
        const category = activeTab;
        shopItems[category] = shopItems[category].map(shopItem => 
          shopItem.id === item.id ? { ...shopItem, owned: true } : shopItem
        );
        alert(`${item.name} erfolgreich gekauft!`);
      }
    } catch (error) {
      console.error('Fehler beim Kauf:', error);
      alert('Kauf fehlgeschlagen!');
    }
  };

  const renderTabContent = () => {
    const items = shopItems[activeTab];
    
    return (
      <div className={styles.itemGrid}>
        {items.map((item) => (
          <div key={item.id} className={styles.shopItem}>
            {item.preview && (
              <div className={styles.itemPreview}>
                <img src={item.preview} alt={item.name} />
              </div>
            )}
            <div className={styles.itemInfo}>
              <h3 className={styles.itemName}>{item.name}</h3>
              {item.description && (
                <p className={styles.itemDescription}>{item.description}</p>
              )}
              <div className={styles.itemPrice}>
                <img src={coin} alt="Coin" className={styles.coinIcon} />
                <span>{item.price}</span>
              </div>
            </div>
            <button
              className={`${styles.purchaseBtn} ${item.owned ? styles.ownedBtn : ''}`}
              onClick={() => !item.owned && handlePurchase(item)}
              disabled={item.owned || userCoins < item.price}
            >
              {item.owned ? 'Besitzt' : userCoins < item.price ? 'Zu teuer' : 'Kaufen'}
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className={styles.shopContainer}>
          <h1 className={styles.shopTitle}>Game Shop</h1>

        <div className={styles.tabNavigation}>
                    <button
            className={`${styles.tab} ${activeTab === 'themes' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('themes')}
          >
             Themes
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'names' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('names')}
          >
             Namen
          </button>
        </div>

        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default Shop;