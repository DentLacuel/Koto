
const express = require('express');
const router = express.Router();

const pool = require('../config/database');
const authentifier = require('../middleware/auth.middleware');
const { validerAnnonce } = require('../validation');
const supabase = require('../config/supabase');
const { randomUUID } = require('crypto');


// Fonction pour récupérer les annonces avec leurs photos
async function recupererAnnonces(userId = null, inclureCheminsPhotos = false) {

    // Préparer le filtre selon l'utilisateur
    const filtreUtilisateur = userId === null
        ? ''
        : 'WHERE listings.user_id = $1';

    const parametres = userId === null
        ? []
        : [userId];

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
            listing_photos.position,
            CONCAT_WS(' ', users.first_name, users.last_name) AS seller_name

        FROM listings
        INNER JOIN categories
            ON listings.category_id = categories.id
        LEFT JOIN listing_photos
            ON listings.id = listing_photos.listing_id
        LEFT JOIN users
            ON listings.user_id = users.id

        ${filtreUtilisateur}

        ORDER BY
            listings.created_at DESC,
            listing_photos.position ASC`,
        parametres
    );

    // Regrouper les photos avec leurs annonces
    const annoncesMap = new Map();

    for (const row of result.rows) {

        if (!annoncesMap.has(row.id)) {
            annoncesMap.set(row.id, {
                id: row.id,
                seller_name: row.seller_name,
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
                        .createSignedUrl(photo.storage_path, 3600);

                    if (error) {
                        throw error;
                    }

                   return {
                    ...(inclureCheminsPhotos && {
                    storage_path: photo.storage_path
                     }),
                    url: data.signedUrl,
                    position: photo.position
                    };
                })
            );

            return annonce;
        })
    );

    return annonces;
}



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






// GET, Récupérer toutes les annonces avec leurs photos


// GET, Récupérer toutes les annonces
router.get('/', async (req, res) => {

    try {

        const annonces = await recupererAnnonces();

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


// GET, Récupérer les annonces de l'utilisateur connecté
router.get('/mine', authentifier, async (req, res) => {

    try {

        // Utiliser l'identifiant provenant du middleware
        const annonces = await recupererAnnonces(req.user.id, true);

        return res.status(200).json(annonces);

    } catch (error) {

        console.error(
            'Erreur lors de la récupération des annonces personnelles :',
            error.message
        );

        return res.status(500).json({
            success: false,
            message: 'Impossible de récupérer tes annonces.'
        });
    }
});



// PUT, Modifier une annonce appartenant à l'utilisateur connecté

router.put('/:id', authentifier, async (req, res) => {

    let client;
    let transactionDemarree = false;

    let anciensChemins = [];
    let nouveauxChemins = [];

    try {

        // Vérifier l'identifiant de l'annonce
        const listingId = Number(req.params.id);

        if (!Number.isSafeInteger(listingId) || listingId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Identifiant de l’annonce invalide.'
            });
        }

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
            description: typeof description === 'string'
                ? description.trim()
                : description,
            location: typeof location === 'string'
                ? location.trim()
                : location,

            price: price === '' || price === null || price === undefined
                ? NaN
                : Number(price),

            user_id: req.user.id,
            category_id: Number(category_id)
        };

        // Valider les données
        if (!validerAnnonce(annonce)) {
            return res.status(400).json({
                success: false,
                message: 'Les données de l’annonce sont invalides.'
            });
        }

        // Vérifier la liste des photos
        if (!Array.isArray(photo_paths) || photo_paths.length > 3) {
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
            photo_paths.some(path =>
                typeof path !== 'string' || !motifPhoto.test(path)
            ) ||
            new Set(photo_paths).size !== photo_paths.length
        ) {
            return res.status(400).json({
                success: false,
                message: 'Un ou plusieurs chemins de photos sont invalides.'
            });
        }

        // Ouvrir une connexion PostgreSQL
        client = await pool.connect();

        // Démarrer la transaction
        await client.query('BEGIN');
        transactionDemarree = true;

        // Vérifier que l'annonce appartient à l'utilisateur connecté
        const annonceExistante = await client.query(
            `SELECT id
             FROM listings
             WHERE id = $1 AND user_id = $2
             FOR UPDATE`,
            [listingId, req.user.id]
        );

        if (annonceExistante.rows.length === 0) {

            await client.query('ROLLBACK');
            transactionDemarree = false;

            return res.status(404).json({
                success: false,
                message: 'Annonce introuvable ou accès non autorisé.'
            });
        }

        // Récupérer les photos actuellement associées à l'annonce
        const resultatPhotos = await client.query(
            `SELECT storage_path
             FROM listing_photos
             WHERE listing_id = $1`,
            [listingId]
        );

        anciensChemins = resultatPhotos.rows.map(
            photo => photo.storage_path
        );

        // Distinguer les photos conservées des nouvelles photos
        nouveauxChemins = photo_paths.filter(
            path => !anciensChemins.includes(path)
        );

        // Empêcher de réutiliser une photo déjà associée
        // à une autre annonce
        if (nouveauxChemins.length > 0) {

            const photosDejaAssociees = await client.query(
                `SELECT storage_path
                 FROM listing_photos
                 WHERE storage_path = ANY($1::text[])`,
                [nouveauxChemins]
            );

            if (photosDejaAssociees.rows.length > 0) {
                await client.query('ROLLBACK');
                transactionDemarree = false;

                return res.status(400).json({
                    success: false,
                    message: 'Une photo est déjà associée à une autre annonce.'
                });
            }
        }

        // Vérifier l'existence des nouvelles photos dans Storage
        for (const path of nouveauxChemins) {

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
                throw error;
            }

            const photoExiste = (data || []).some(
                fichier => fichier.name === nomFichier
            );

            if (!photoExiste) {
                await client.query('ROLLBACK');
                transactionDemarree = false;

                return res.status(400).json({
                    success: false,
                    message: 'Une nouvelle photo est introuvable dans Storage.'
                });
            }
        }

        // Mettre à jour les informations de l'annonce
        const resultat = await client.query(
            `UPDATE listings
             SET
                title = $1,
                description = $2,
                price = $3,
                category_id = $4,
                location = $5
             WHERE id = $6 AND user_id = $7
             RETURNING *`,
            [
                annonce.title,
                annonce.description,
                annonce.price,
                annonce.category_id,
                annonce.location,
                listingId,
                req.user.id
            ]
        );

        // Supprimer les associations des photos retirées
        await client.query(
            `DELETE FROM listing_photos
             WHERE listing_id = $1
             AND NOT (storage_path = ANY($2::text[]))`,
            [listingId, photo_paths]
        );

        // Ajouter les nouvelles photos et mettre à jour les positions
        for (let i = 0; i < photo_paths.length; i++) {

            const chemin = photo_paths[i];

            if (anciensChemins.includes(chemin)) {

                await client.query(
                    `UPDATE listing_photos
                     SET position = $1
                     WHERE listing_id = $2 AND storage_path = $3`,
                    [i + 1, listingId, chemin]
                );

            } else {

                await client.query(
                    `INSERT INTO listing_photos
                        (listing_id, storage_path, position)
                     VALUES ($1, $2, $3)`,
                    [listingId, chemin, i + 1]
                );
            }
        }

        // Confirmer les modifications
        await client.query('COMMIT');
        transactionDemarree = false;

        // Supprimer de Storage les anciennes photos retirées
        const cheminsASupprimer = anciensChemins.filter(
            path => !photo_paths.includes(path)
        );

        if (cheminsASupprimer.length > 0) {

            const { error } = await supabase
                .storage
                .from('koto-listings')
                .remove(cheminsASupprimer);

            if (error) {
                console.error(
                    'Erreur lors du nettoyage des anciennes photos :',
                    error.message
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Annonce modifiée avec succès.',
            listing: resultat.rows[0],
            photos: photo_paths
        });

    } catch (error) {

        // Annuler la transaction en cas d'erreur
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

        console.error(
            'Erreur lors de la modification de l’annonce :',
            error
        );

        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'La catégorie sélectionnée est invalide.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Impossible de modifier l’annonce.'
        });

    } finally {

        if (client) {
            client.release();
        }
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