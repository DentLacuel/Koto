
const express = require('express');

const app = express();

app.use(express.json());

// Route d'accueil
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Koto API est en ligne!'
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur Koto en écoute sur le port ${PORT}`);
});
