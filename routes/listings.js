//config express + routeur + pool
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

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

module.exports = router;