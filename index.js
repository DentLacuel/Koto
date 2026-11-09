
const express = require('express');
const pool = require('./config/database');
const supabase = require('./config/supabase');
const app = express();

app.use(express.json());

// Route d'accueil
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Koto API est en ligne!'
    });
});


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

// Démarrage du serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur Koto en écoute sur le port ${PORT}`);
});
