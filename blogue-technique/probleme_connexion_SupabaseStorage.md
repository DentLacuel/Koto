# Problème lors de l'établissement d'une connexion test avec Supabase Storage.

J'ai créé une route pour tester la connexion avec Supabase Storage, qui est l'outil permettant de créer un lien entre les données télévérsées par l'utilisateur et la base de donnéees où cette donnée est sauvgardée.

J'ai également configuré le fichier .env en incluant l'adresse URL de mon projet dans Supabase ainsi que la clé secrète afin de sécuriser le lien entre l'api, le serveur et le Bucket.

Quand je lance mon serveur pour tester la connexion, je reçois un message d'erreur :
```shell
Koto> node index.js
◇ injected env (3) from .env
◇ injected env (0) from .env
Client Supabase initialisé
Serveur Koto est live sur le port 3000
Erreur Supabase Storage : fetch failed
```

Le serveur est lancé correctement mais, la communication avec Supabase Storage n'a pas réussie, d'où le message affiché par mon catch{} : Erreur Supabase Storage : fetch failed.

On demandant à chat GPT plus de clarifications (Transcription en bas de la page), il recomande que je modifie le type de message que mon catch{} revoie, afin d'obtenir plus d'information sur l'erreur.

Mais avant de faire la modification, j'ai décidé quand même d'actualiser mon localhost avant de modifier mon code, je constate qu'un autre message s'est rajouté dans le terminal:
```bash
StorageUnknownError: fetch failed
  __isStorageError: true,
  namespace: 'storage',
  status: undefined,
  statusCode: undefined,
  originalError: [TypeError: fetch failed] {
    [cause]: Error: getaddrinfo ENOTFOUND sb_///
```

Cette fois ci j'obtien : *originalError: [TypeError: fetch failed] [cause]: Error: getaddrinfo ENOTFOUND sb_///*

Chat GPT avait montionné au début qu'il peut s'agir d'un problème de connexion DNS (ENOTFOUND) qui est typiquement lié à un problème d'adresse IP ou au nom d'hébergeur (HOSTNAME). Pour mon cas j'ai vérifié le lien DATABASE_URL, ce lien ressemble à: (https:// abcdef12345.supabase.co/rest/v1/) que j'avais copié sans faire attention au format exigé.

 j'ai relancé mon serveur à nouveau, j'ai constaté le message dans mon terminal avait changé suite à la modification de L'URL:

```bash
node index.js
◇ injected env (3) from .env
◇ injected env (0) from .env
Client Supabase initialisé
Serveur Koto est live sur le port 3000
Erreur Supabase Storage : Invalid path specified in request URL
```

Maintenant l'erreur a changée, c'est le path de l'URL qui est invalide je devais alors ne pas inclure la version REST dans l'URL. Résulat:

```bash
Koto> node index.js
◇ injected env (3) from .env
◇ injected env (0) from .env
Client Supabase initialisé
Serveur Koto est live sur le port 3000
```

Le serveur a également renvoyé une confirmation que l'a connexion au Bucket de SupaBase Storage a réussi :

```bash
{"success":true,"message":"Accès à Supabase Storage réussi. Bucket trouvé!","bucketExists":true}
```








## transcription conversation avec Chat GPT :

Après avoir créé une route temporaire pour tester l'accès au Bucket Supabase Storage, j'ai le message :
{"success":false,"message":"Impossible d'accèder à SupaBase Storage."}

Le terminal me sort l'erreur : StorageUnknownError: fetch failed
 __isStorageError: true,
  namespace: 'storage',
  status: undefined,
  statusCode: undefined,
  originalError: [TypeError: fetch failed]

Voici le code pour la route que j'ai créée :
```js
app.get('/api/storage-test', async (req, res) => {
    try{
        const { data, error } = await supabase.storage.listBuckets();

        if(error){
            throw error;
        }

        const bucketExists = data.some(
            bucket => bucket.name === 'koto-listings'
        );

        res.json({
            success: true,
            message: bucketExists ? 'Accès à Supabase Storage réussi. Bucket trouvé!' : 'Connexion réussie, mais bucket est introuvable.', bucketExists
        });
    }
        catch (error){
            console.error('Erreur Supabase Storage :', error.message);

            res.status(500).json({
                success: false,
                message: Impossible d'accèder à SupaBase Storage.
            })

        }
    
});
```

Ton code est globalement correct. Le problème semble venir non pas de ta route Express, mais de la communication entre Node.js et Supabase Storage.

L'indice important est cette erreur :
```bash
StorageUnknownError: fetch failed
TypeError: fetch failed
```
Cela signifie que la requête HTTP n'a pas réussi à atteindre correctement le service distant. Ce n'est pas nécessairement une erreur de clé API ou de permission.

Une mauvaise clé secrète produit généralement une réponse HTTP 401 ou 403, alors qu'ici nous n'avons même pas de code HTTP.

Je te propose de diagnostiquer cela avant de modifier ton code.

Étape 1 — Obtenir la véritable cause de l'erreur
Actuellement, ton catch affiche seulement :

```js
console.error('Erreur Supabase Storage :', error.message);

Cette instruction ne nous donne pas suffisamment d'informations.

Remplace temporairement ton catch par :

catch (error) {
    console.error('Erreur Supabase Storage :');
    console.dir(error, { depth: 5 });

    res.status(500).json({
        success: false,
        message: 'Impossible de communiquer avec Supabase Storage.'
    });
}
```

Pourquoi ?

Parce que error.cause peut contenir la véritable raison de l'échec, par exemple :

ENOTFOUND : problème de résolution DNS.

ECONNREFUSED : connexion refusée.

ETIMEDOUT : délai de connexion dépassé.

Erreur TLS : problème de connexion sécurisée.

Étape 2 — Vérifier ton Project URL Ouvre ton fichier .env.

La variable doit avoir cette forme :

SUPABASE_URL="https://xxxxxxxx.supabase.co"
Vérifie trois choses :

1. Tu utilises bien le Project URL de Supabase.

2. L'adresse commence par https://.

3. Tu n'as pas copié l'URL de connexion PostgreSQL à la place.