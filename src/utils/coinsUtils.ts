// Utility-Funktion für Coins-Vergabe nach Spielende
export const awardCoinsForGame = async (percentageChange: number): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3000/api/coins/award-coins', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                percentageChange: percentageChange
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`Coins erhalten:`, data);

            // Event für andere Komponenten (z.B. Header) dispatchen
            window.dispatchEvent(new CustomEvent('coinsUpdated', {
                detail: {
                    coinsEarned: data.coinsEarned,
                    currentCoins: data.currentCoins,
                    percentageChange: percentageChange
                }
            }));

            // Optional: Erfolg-Notification anzeigen
            if (data.coinsEarned > 0) {
                console.log(`${data.coinsEarned} Coins erhalten für ${percentageChange.toFixed(2)}% Gewinn!`);

                // Optional: Browser-Notification
                if (Notification.permission === 'granted') {
                    new Notification('Coins erhalten!', {
                        body: `Du hast ${data.coinsEarned} Coins für ${percentageChange.toFixed(2)}% Gewinn erhalten!`,
                        icon: '/coin.png' // Falls du ein Coin-Icon hast
                    });
                }
            }
        } else {
            console.error('Fehler beim Vergeben der Coins:', await response.text());
        }
    } catch (error) {
        console.error('Coins Award Error:', error);
    }
};
