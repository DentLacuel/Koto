
const express = require('express');
const router = express.Router();

const pool = require('../config/database');
const authentifier = require('../middleware/auth.middleware');
const { validerAnnonce } = require('../validation');
const supabase = require('../config/supabase');
const { randomUUID } = require('crypto');



// Post, Générer les URL signées pour les photos

router.post('/upload-urls', authentifier, async (req, res) => {

    try {
        const { files } = req.body;

        // Vérifier le nombre de photos
        if (!Array.isArray(files) || files.length < 1 || files.length > 3) {
            return res.status(400).json({
                success: false,
                message: 'Tu dois fournir entre 1 et 3 photos.'
            });
        }

        // Formats autorisés
        const formatsAutorises = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp'
        };

        const tailleMax = 5 * 1024 * 1024;
        const uploads = [];

        // Générer une URL signée pour chaque photo
        for (const file of files) {

            if (
                !file ||
                !formatsAutorises[file.contentType] ||
                !Number.isInteger(file.size) ||
                file.size <= 0 ||
                file.size > tailleMax
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Une photo possède un format ou une taille invalide.'
                });
            }

            const extension = formatsAutorises[file.contentType];

            // Chemin unique associé à l'utilisateur connecté
            const storagePath =
                `users/${req.user.id}/${randomUUID()}.${extension}`;

            const { data, error } = await supabase
                .storage
                .from('koto-listings')
                .createSignedUploadUrl(storagePath, {
                    upsert: false
                });

            if (error) {
                console.error('Erreur Supabase Storage :', error.message);

                return res.status(500).json({
                    success: false,
                    message: 'Impossible de préparer le téléversement.'
                });
            }

            uploads.push({
                path: data.path,
                token: data.token,
                signedUrl: data.signedUrl
            });
        }

        return res.status(200).json({
            success: true,
            uploads
        });

    } catch (error) {
        console.error('Erreur lors de la génération des URL signées :', error);

        return res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la préparation des photos.'
        });
    }
});



// Get, Récupérer toutes les annonces


// GET, Récupérer toutes les annonces avec leurs photos

router.get('/', async (req, res) => {

    try {
        // Récupérer les annonces et les chemins de leurs photos
        const result = await pool.query(
            `SELECT
                listings.id,
                listings.user_id,
                listings.category_id,
                categories.name AS category_name,
                listings.title,
                listings.description,
                listings.price,
                listings.location,
                listings.created_at,
                listing_photos.storage_path,
                listing_photos.position
            FROM listings
            INNER JOIN categories
                ON listings.category_id = categories.id
            LEFT JOIN listing_photos
                ON listings.id = listing_photos.listing_id
            ORDER BY
                listings.created_at DESC,
                listing_photos.position ASC`
        );

        // Regrouper les photos avec leurs annonces
        const annoncesMap = new Map();

        for (const row of result.rows) {

            if (!annoncesMap.has(row.id)) {
                annoncesMap.set(row.id, {
                    id: row.id,
                    user_id: row.user_id,
                    category_id: row.category_id,
                    category_name: row.category_name,
                    title: row.title,
                    description: row.description,
                    price: row.price,
                    location: row.location,
                    created_at: row.created_at,
                    photos: []
                });
            }

            // Ajouter le chemin de la photo si elle existe
            if (row.storage_path) {
                annoncesMap.get(row.id).photos.push({
                    storage_path: row.storage_path,
                    position: row.position
                });
            }
        }

        // Générer les URL signées pour les photos
        const annonces = await Promise.all(
            Array.from(annoncesMap.values()).map(async annonce => {

                annonce.photos = await Promise.all(
                    annonce.photos.map(async photo => {

                        const { data, error } = await supabase
                            .storage
                            .from('koto-listings')
                            .createSignedUrl(photo.storage_path, 3600); //url signé 1h

                        if (error) {
                            throw error;
                        }

                        return {
                            url: data.signedUrl,
                            position: photo.position
                        };
                    })
                );

                return annonce;
            })
        );

        return res.status(200).json(annonces);

    } catch (error) {

        console.error(
            'Erreur lors de la récupération des annonces :',
            error.message
        );

        return res.status(500).json({
            success: false,
            message: 'Impossible de récupérer les annonces.'
        });
    }
});



// POST, Créer une annonce et associer ses photos

router.post('/', authentifier, async (req, res) => {

    let client;
    let transactionDemarree = false;

    try {
        const {
            title,
            description,
            price,
            location,
            category_id,
            photo_paths
        } = req.body;

        // Préparer les données de l'annonce
        const annonce = {
            title: typeof title === 'string' ? title.trim() : title,
            description: typeof description === 'string' ? description.trim() : description,
            location: typeof location === 'string' ? location.trim() : location,

            price: price === '' || price === null || price === undefined
                ? NaN
                : Number(price),

            // Identifiant provenant du middleware
            user_id: req.user.id,
            category_id: category_id
        };

        // Vérifier les données de l'annonce
        if (!validerAnnonce(annonce)) {
            return res.status(400).json({
                success: false,
                message: `Les données de l'annonce sont invalides.`
            });
        }

        // Vérifier les chemins des photos
        const photos = photo_paths === undefined ? [] : photo_paths;

        if (!Array.isArray(photos) || photos.length > 3) {
            return res.status(400).json({
                success: false,
                message: 'Tu peux associer un maximum de 3 photos.'
            });
        }

        // Vérifier que les chemins appartiennent à l'utilisateur
        const motifPhoto = new RegExp(
            `^users/${req.user.id}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|png|webp)$`,
            'i'
        );

        if (
            photos.some(path =>
                typeof path !== 'string' ||
                !motifPhoto.test(path)
            ) ||
            new Set(photos).size !== photos.length
        ) {
            return res.status(400).json({
                success: false,
                message: 'Un ou plusieurs chemins de photos sont invalides.'
            });
        }

        // Vérifier que les photos existent dans Storage
        for (const path of photos) {

            const dossier = path.substring(0, path.lastIndexOf('/'));
            const nomFichier = path.substring(path.lastIndexOf('/') + 1);

            const { data, error } = await supabase
                .storage
                .from('koto-listings')
                .list(dossier, {
                    search: nomFichier,
                    limit: 100
                });

            if (error) {
                console.error(
                    'Erreur lors de la vérification des photos :',
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    message: 'Impossible de vérifier les photos dans Storage.'
                });
            }

            const photoExiste = data.some(
                fichier => fichier.name === nomFichier
            );

            if (!photoExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'Une ou plusieurs photos ne sont pas présentes dans Storage.'
                });
            }
        }

        // Ouvrir une connexion PostgreSQL dédiée
        client = await pool.connect();

        // Démarrer la transaction
        await client.query('BEGIN');
        transactionDemarree = true;

        // Insérer l'annonce
        const result = await client.query(
            `INSERT INTO listings
                (user_id, category_id, title, description, price, location)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                annonce.user_id,
                annonce.category_id,
                annonce.title,
                annonce.description,
                annonce.price,
                annonce.location
            ]
        );

        const listing = result.rows[0];

        // Insérer les photos associées à l'annonce
        for (let i = 0; i < photos.length; i++) {

            await client.query(
                `INSERT INTO listing_photos
                    (listing_id, storage_path, position)
                 VALUES ($1, $2, $3)`,
                [
                    listing.id,
                    photos[i],
                    i + 1
                ]
            );
        }

        // Confirmer les insertions
        await client.query('COMMIT');
        transactionDemarree = false;

        return res.status(201).json({
            success: true,
            message: 'Annonce créée avec succès.',
            listing,
            photos
        });

    } catch (error) {

        // Annuler les insertions en cas d'erreur
        if (client && transactionDemarree) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                console.error(
                    'Erreur lors du ROLLBACK :',
                    rollbackError.message
                );
            }
        }

        console.error(`Erreur lors de la création de l'annonce :`, error);

        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'La catégorie sélectionnée est invalide.'
            });
        }

        return res.status(500).json({
            success: false,
            message: `Impossible de créer l'annonce.`
        });

    } finally {

        // Libérer la connexion PostgreSQL
        if (client) {
            client.release();
        }
    }
});


module.exports = router;
