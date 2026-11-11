//config express + routeur + pool
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authentifier = require('../middleware/auth.middleware');
const { validerAnnonce } = require('../validation');

// Route pour récuperer les éléments d'une annonces
router.get('/', async (req, res) => {
    
  try{
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
                listings.created_at 
            FROM listings
            INNER JOIN categories
                ON listings.category_id = categories.id 
            ORDER BY listings.created_at DESC`
        );

        res.json(result.rows);
  }

  catch (error){
        console.error(`Erreur lors de la récupération des éléments de l'annonce: ${error.message}`);
        res.status(500).json({//erreur dans server 500
            success: false,
            message: 'Impossible de récuperer les annonces' 
        });
  }

});



// Route protégée pour créer une annonce
router.post('/', authentifier, async (req, res) => {

    try {
        const { title, description, price, location, category_id } = req.body;

        // Préparer les données reçues
        const annonce = {
            title: typeof title === 'string' ? title.trim() : title,
            description: typeof description === 'string' ? description.trim() : description,
            location: typeof location === 'string' ? location.trim() : location,
            price: price === '' || price === null || price === undefined
                ? NaN
                : Number(price),

            // L'identifiant vient du middleware jamais du navigateur
            user_id: req.user.id,

            category_id: category_id
        };

        // Vérifier les données
        if (!validerAnnonce(annonce)) {
            return res.status(400).json({
                success: false,
                message: 'Les données de l’annonce sont invalides.'
            });
        }

        // Insérer l'annonce dans PostgreSQL
        const result = await pool.query(
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

        return res.status(201).json({
            success: true,
            message: 'Annonce créée avec succès.',
            listing: result.rows[0]
        });

    } catch (error) {
        console.error('Erreur lors de la création de l’annonce :', error);

        // Une catégorie inexistante peut provoquer une violation de clé étrangère
        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'La catégorie sélectionnée est invalide.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Impossible de créer l’annonce.'
        });
    }
});


module.exports = router;