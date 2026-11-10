const supabase = require('../config/supabase');
const pool = require('../config/database');

async function authentifier(req, res, next) {

    // 1. Récupérer le jeton envoyé par le frontend
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) { // sans jeton accès refusé
        return res.status(401).json({
            success: false,
            message: 'Authentification requise.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Vérifier le jeton auprès de Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: 'Session invalide ou expirée.'
            });
        }

        // 3. Retrouver le profil Koto associé
        const result = await pool.query(
            `SELECT id, email
             FROM public.users
             WHERE auth_user_id = $1`,
            [data.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Profil Koto introuvable.'
            });
        }

        // 4. Rendre l'identité disponible aux routes suivantes
        req.user = {
            id: result.rows[0].id,
            authUserId: data.user.id,
            email: result.rows[0].email
        };

        next();

    } catch (error) {
        console.error('Erreur d’authentification :', error.message);

        return res.status(500).json({
            success: false,
            message: 'Erreur interne lors de l’authentification.'
        });
    }
}

module.exports = authentifier;