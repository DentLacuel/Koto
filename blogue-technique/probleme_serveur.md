# Décrivez un moment difficile (un bug, une mauvaise décision initiale, une friction dans l’équipe) et comment vous l’avez résolu. 


**Problème lors de la création d'un serveur Express et la connexion avec PostgreSQL**

J'avais eu un blockage lors de la création d'une route pour connecter mon serveur Express avec la base de données Supabase. Je devais créer un module de connexion qui me permettera d'utiliser le pilote 'pg' que je venais d'installer ainsi que la chiane de connexion fournie par Supabase (L'URL qui permettera de connecter le serveur avec la base de données Supabase). 

La configuration .env semblait correcte comme elle contenait une ligne de code (le chemain vers la base de données) et le fichier qui contient le code source pour confirguer le 'pool' semblait correcte aussi.

En executant le code via node dans le terminal je reçois cette erreur:

```shell
node index.js
◇ injected env (1) from .env
Serveur Koto est live sur le port 3000
Erreur PostgreSQL : pool.query is not a function
```

J'ai constaté que le serveur se lançait correctement, mais aucune connexion n'est établie avec la base de données. La variable 'Pool' existe mais n'a aucune fonction query. Elle est probalement mal construite.

Confirmé par message d'erreur que j'avais prédéfinie en cas de problème de connexion. Message d'erreur quand j'ouvre le localhost API :

```shell
{"success":false,"message":"Impossible de communiquer avec la base de données!"}
```

En revenant au fichier source de la configuration du 'Pool' :

```js
require('dotenv').config();

const {Pool} = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

module.export = pool;
```

Une faute de frappe au niveau du module d'éxportation:

```js
module.export = pool;
```
au lieu de :

```js
module.exports = pool;
```

Après correction et test node, la connexion a réussie :

```shell
{"success":true,"message":"Connexion à PostgreSQL réussie!!","data":{"database":"postgres","server_time":"2026-11-04T15:45:24.709Z"}}
```

Le serveur Express reçoit une requête HTTP, interroge PostgreSQL avec pg, puis retourne le résultat au navigateur au format JSON.
