import React, { useState, useEffect } from 'react';
import Header from './Header';
import styles from '../css/Shop.module.css';
import coin from '../assets/coin.png';
// import { themeShopItems, ThemeItem, handleThemePurchase } from '../data/themes'; // Themes ausgelagert

interface ShopItem {
  id: number;
  name: string;
  price: number;
  owned: boolean;
  preview?: string;
  description?: string;
}

const Shop: React.FC = () => {
  const [userCoins, setUserCoins] = useState(0);
  const [nameShopItems, setNameShopItems] = useState<ShopItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Themes are now moved to src/data/themes.ts for future use

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
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
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
        const newCoins = userCoins - item.price;
        setUserCoins(newCoins);
        setNameShopItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true } : i));

        // Event für Header-Update dispatchen
        window.dispatchEvent(new CustomEvent('coinsUpdated', {
          detail: {
            coinsEarned: -item.price, // Negative Zahl für Ausgaben
            currentCoins: newCoins,
            source: 'shop'
          }
        }));

      } else {
        console.error('Kauf fehlgeschlagen:', data.error);
      }
    } catch (error) {
      console.error('Fehler beim Kauf:', error);
    }
  };

  const renderTabContent = () => {
    let items = nameShopItems;

    // Filter nach Suchbegriff
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sortierung nach Preis
    items = [...items].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });

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
        <h1 className={styles.shopTitle}>Name Shop</h1>

        {/* Removed tab navigation - only names now */}
        {/* Themes moved to src/data/themes.ts for future use */}

        {/* Filter- und Sortier-Leiste */}
        <div className={styles.filterBar}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Farben suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.sortContainer}>
            <label className={styles.sortLabel}>Sortieren:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className={styles.sortSelect}
            >
              <option value="asc">Preis: Niedrig → Hoch</option>
              <option value="desc">Preis: Hoch → Niedrig</option>
            </select>
          </div>
        </div>

        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default Shop;