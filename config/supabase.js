//charger les varaible du fichier .env
require('dotenv').config();

//Initialise la connexion au service Supabase.
const { createClient } = require('@supabase/supabase-js');

//Récuperer les variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

//Vérifier que les variables existent
if (!supabaseUrl || !supabaseSecretKey){
    throw new Error(`Les variables d’environnement Supabase sont manquantes.`);
}

//Créer le client Supabase
const supabase = createClient(
    supabaseUrl, //Indique à quel projet Supabase se connecter.
    supabaseSecretKey, //fournit la clé d'accès privilégiée au backend.
    {
        auth: { //configure la gestion des sessions d'authentification.
            autoRefreshToken: false, //ne renouvelle pas automatiquement de jeton d'authentification.
            persistSession: false //ne conserve pas de session utilisateur entre les exécutions.
        }
    }
);

module.exports = supabase;