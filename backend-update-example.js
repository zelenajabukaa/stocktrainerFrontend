// ====================================
// BACKEND-UPDATE für user_name.js
// ====================================
// Füge diese Route zu deiner user_name.js hinzu:

// Route: Alle User mit ihren ausgewählten Namensfarben abrufen (für Leaderboard)
router.get('/all-users-colors', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT 
        u.id as user_id,
        u.username,
        n.name as nameColor
      FROM users u
      LEFT JOIN user_name un ON u.id = un.user_id AND un.selected = 1
      LEFT JOIN names n ON un.name_id = n.id
    `);

        res.json(rows);
    } catch (err) {
        console.error('Fehler beim Abrufen aller User-Farben:', err);
        res.status(500).json({ error: 'Serverfehler beim Abrufen der User-Farben' });
    }
});

// Alternative Route: Ausgewählte Namensfarbe eines spezifischen Users abrufen
router.get('/user/:userId/selected-name', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.execute(
            'SELECT name_id FROM user_name WHERE user_id = ? AND selected = 1',
            [userId]
        );

        if (rows.length === 0) {
            return res.json({ selectedNameId: null });
        }

        res.json({ selectedNameId: rows[0].name_id });
    } catch (err) {
        console.error('Fehler beim Abrufen der ausgewählten Namensfarbe:', err);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// ====================================
// ERWEITERTE LEADERBOARD-ROUTE (Optional)
// ====================================
// Du kannst auch deine bestehende Leaderboard-Route erweitern:

router.get('/leaderboard-with-colors', async (req, res) => {
    try {
        const [leaderboardRows] = await pool.execute(`
      SELECT 
        u.id, 
        u.username, 
        s.percentageProfit, 
        s.totalStocksBought, 
        s.weekTrades,
        n.name as nameColor
      FROM users u
      LEFT JOIN stats s ON u.id = s.user_id
      LEFT JOIN user_name un ON u.id = un.user_id AND un.selected = 1
      LEFT JOIN names n ON un.name_id = n.id
      ORDER BY u.id
    `);

        res.json({ leaderboard: leaderboardRows });
    } catch (err) {
        console.error('Fehler beim Abrufen des Leaderboards mit Farben:', err);
        res.status(500).json({ error: 'Serverfehler beim Abrufen des Leaderboards' });
    }
});

// ====================================
// ANWEISUNGEN
// ====================================
/*
1. Füge die Route '/all-users-colors' zu deiner user_name.js hinzu
2. Das Frontend ist bereits aktualisiert und wird diese Route verwenden
3. Die Namensfarben werden automatisch im Leaderboard angezeigt
4. Falls die Route nicht verfügbar ist, wird das Leaderboard normal ohne Farben angezeigt

Die Implementation verwendet:
- SQL JOIN zwischen users, user_name und names Tabellen
- Filtrierung auf selected = 1 für aktuelle Auswahl
- Effiziente Abfrage aller User-Farben in einer Anfrage
- Graceful Fallback falls Farben nicht verfügbar sind
*/
