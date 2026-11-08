
const express = require('express');
const pool = require('./config/database');

const app = express();

app.use(express.json());

// Route d'accueil
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Koto API est en ligne!'
    });
});


// route pour tester la connexion psql avec Render
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT current_database() AS database'
        );

        res.json({
            success: true,
            message: 'Connexion PostgreSQL réussie!',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Erreur PostgreSQL:', error.message);

        res.status(500).json({
            success: false,
            message: 'Connexion PostgreSQL impossible.'
        });
    }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur Koto en écoute sur le port ${PORT}`);
});
