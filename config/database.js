// Module de connexion pour utiliser pg et la chiane de connexion fourinie par Superbase.
// Config le pool de connexion

require('dotenv').config();

const {Pool} = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});




module.exports = pool;

