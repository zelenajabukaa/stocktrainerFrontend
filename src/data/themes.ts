// Themes für zukünftige Implementierung
// Diese Themes können später wieder in den Shop integriert werden

export interface ThemeItem {
    id: number;
    name: string;
    price: number;
    owned: boolean;
    preview?: string;
    description?: string;
}

export const themeShopItems: ThemeItem[] = [
    {
        id: 101,
        name: 'Dunkles Theme',
        price: 100,
        owned: false,
        description: 'Elegante dunkle Oberfläche für deine Augen'
    },
    {
        id: 102,
        name: 'Neon Glow',
        price: 150,
        owned: false,
        description: 'Futuristisches Neon-Design mit Glow-Effekten'
    },
    {
        id: 103,
        name: 'Naturgrün',
        price: 80,
        owned: false,
        description: 'Beruhigendes Grün-Theme inspiriert von der Natur'
    },
    {
        id: 104,
        name: 'Königsblau',
        price: 120,
        owned: false,
        description: 'Majestätisches blaues Design für wahre Könige'
    },
    {
        id: 105,
        name: 'Sunset Orange',
        price: 90,
        owned: false,
        description: 'Warme Sonnenuntergangs-Farben'
    },
];

// Funktion für Theme-Kauf (für spätere Verwendung)
export const handleThemePurchase = async (item: ThemeItem, userCoins: number) => {
    if (userCoins < item.price) {
        return { success: false, error: 'Nicht genügend Coins' };
    }

    try {
        // Hier würde die Theme-Kauf-API implementiert werden
        // const response = await fetch('http://localhost:3000/api/buy-theme', { ... });

        // Simulierter Kauf für jetzt
        return {
            success: true,
            newCoins: userCoins - item.price,
            item: { ...item, owned: true }
        };
    } catch (error) {
        return { success: false, error: 'Fehler beim Kauf' };
    }
};
