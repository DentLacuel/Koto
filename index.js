const express = require('express');
const pool = require('./config/database');
const supabase = require('./config/supabase');
const listingsRoutes = require('./routes/listings');
const authentifier = require('./middleware/auth.middleware');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));


app.use(express.json());

// Routes
app.use('/api/listings', listingsRoutes);

// Route d'accueil
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Koto API est en ligne!'
    });
});



// Route pour récupérer toutes les catégories
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name FROM categories ORDER BY id'
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error.message);

        res.status(500).json({
            success: false,
            message: 'Impossible de récupérer les catégories.'
        });
    }
});


//Route pour tester SB Storage avec Render
app.get('/api/storage-test', async (req, res) => {
    try {
        const { data, error } = await supabase.storage.listBuckets();

        if (error) {
            throw error;
        }

        const bucketExists = data.some(
            bucket => bucket.name === 'koto-listings'
        );

        res.status(bucketExists ? 200 : 404).json({
            success: bucketExists,
            message: bucketExists
                ? 'Accès à Supabase Storage réussi. Bucket trouvé!'
                : 'Connexion réussie, mais le bucket est introuvable.',
            bucketExists
        });

    } catch (error) {
        console.error('Erreur Supabase Storage :', error.message);

        res.status(500).json({
            success: false,
            message: "Impossible d'accéder à Supabase Storage."
        });
    }
});


// Route de test : vérifier l'identité de l'utilisateur connecté
app.get('/api/me', authentifier, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Utilisateur authentifié.',
        user: req.user
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur Koto en écoute sur le port ${PORT}`);
});
