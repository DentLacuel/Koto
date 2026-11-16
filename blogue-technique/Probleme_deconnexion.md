## Problème de déconnexion et de capture de session :

* En travaillant sur un mécanisme permettant de compléter le cycle de connexion (connexion, utilisation, déconnexion), j'ai réussi à mettre en place un système permettant aux utilisateurs de se connecter à Koto et d'ouvrir une session. Cependant, je n'arrivais pas à fermer la session. Un utilisateur connecté est authentifié et autorisé à créer et publier des annonces, mais il ne peut pas se déconnecter tant que le jeton d'authentification n'a pas expiré.

* J'ai consulté la console du navigateur pour obtenir plus de détails. L'erreur qui survenait à chaque fois était :

```shell
 Uncaught SyntaxError: Identifier 'supabase' has already been declared
```

→ Un identifiant est probablement déclaré plusieurs fois.

L'idée était de faire apparaître un bouton « Déconnexion » une fois que le client est connecté. J'ai demandé à ChatGPT de m'expliquer d'où venait ce problème (transcription en bas de la page), étant donné que toutes les bibliothèques sont installées et implémentées correctement, mais que le problème persistait.

```html
<script src="https://cdn.jsdelivr.net"></script>
<script src="supabase-config.js"></script>
<script src="auth-ui.js"></script>
<script src="create-listing.js"></script>
<script src="script.js"></script>
```

ChatGPT explique que l'erreur provient probablement de la variable locale *const supabase = window.kotoSupabase;*, déclarée plusieurs fois et qui ne peut donc pas être utilisée correctement par le navigateur.

Une solution consiste à isoler cette variable dans une fonction immédiatement invoquée et exécutée (IIFE). Cette approche permet de conserver exactement la même bibliothèque CDN que celle déjà utilisée et donnera au système d'authentification la possibilité d'utiliser le client Supabase initialisé dans un autre fichier de configuration via :

```js
window.kotoSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
```
sans casser l'architecture déjà mise en place pour le système de connexion.

* Après avoir encapsulé la variable, voici le résultat dans la console :

```shell
Événement Auth Supabase : TOKEN_REFRESHED
auth-ui.js:79 Événement Auth Supabase : INITIAL_SESSION
2auth-ui.js:79 Événement Auth Supabase : SIGNED_IN
login.js:28 Utilisateur connecté :
```

Après la déconnexion, le résultat est le suivant :

```shell
Événement Auth Supabase : INITIAL_SESSION
```
Le test a réussi : la session est correctement déconnectée et aucun conflit de portée n'est observé avec les autres scripts.



*Transcription Chat-GPT*:

j'ai créé un fichier 'auth-ui.js' qui permet de vérifier si une session de connexion Supabase existe, afficher connexion ou deconnexion et rediriger l'utilisateur vers login. Quand j'essaye de me connecter, le système d'authentification établie et confirme la connexion via Supabase Auth, la console dans le navigateur affiche aussi : Utilisateur connecté : Object, mais 'Connexion' ne devient pas déconnexion, avec un message : Uncaught SyntaxError: Identifier 'supabase' has already been declared

Le fichier auth-ui, communique avec le fichier de connexion HTML 'login' via la bibliothèque cdn de supabase : cdn.jsdelivr.

Voici le code : 

```js
const supabase = window.kotoSupabase;

// Trouver la navigation
const navbarMenu = document.querySelector('.navbar-menu');

if (navbarMenu) {

    // Trouver le lien de connexion existant
    let authLink = navbarMenu.querySelector('a[href="login.html"]');

    // Si le lien n'existe pas, le créer
    if (!authLink) {
        const listItem = document.createElement('li');
        authLink = document.createElement('a');

        listItem.appendChild(authLink);
        navbarMenu.appendChild(listItem);
    }

    // Afficher l'état de connexion
    function afficherEtatConnexion(session) {

        if (session) {
            authLink.textContent = 'Déconnexion';
            authLink.href = '#logout';
            authLink.dataset.action = 'logout';
        } else {
            authLink.textContent = 'Connexion';
            authLink.href = 'login.html';
            delete authLink.dataset.action;
        }
    }

    // Gérer le clic sur le lien
    authLink.addEventListener('click', async (event) => {

        if (authLink.dataset.action !== 'logout') {
            return;
        }

        event.preventDefault();

        authLink.textContent = 'Déconnexion...';
        authLink.style.pointerEvents = 'none';

        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            window.location.replace('login.html');

        } catch (error) {
            console.error('Erreur de déconnexion :', error);

            alert('Impossible de vous déconnecter. Réessayez.');

            authLink.textContent = 'Déconnexion';
            authLink.style.pointerEvents = '';
        }
    });

    // Observer les changements de session
    supabase.auth.onAuthStateChange((event, session) => {
        afficherEtatConnexion(session);
    });

    // Vérifier la session initiale
    supabase.auth.getSession().then(({ data, error }) => {

        if (error) {
            console.error('Erreur de récupération de session :', error);
            return;
        }

        afficherEtatConnexion(data.session);
    });
}
```
Tu as bien identifié le symptôme, et le message d'erreur nous donne une piste précise.

Le problème ne vient pas de Supabase Auth ni de la connexion de l'utilisateur. Il vient d'une déclaration JavaScript en double.

Dans ton fichier auth-ui.js, tu as :

const supabase = window.kotoSupabase;

Or, il est possible qu'un autre script de la même page ait déjà déclaré une variable globale supabase avec const.

En JavaScript, deux déclarations globales const portant le même nom provoquent cette erreur :

Uncaught SyntaxError: Identifier 'supabase' has already been declared
Quand cette erreur survient, le navigateur ne peut pas exécuter le reste de auth-ui.js. C'est pourquoi ton lien reste sur « Connexion ».

La solution : isoler les variables de auth-ui.js
Je te recommande d'encapsuler ton code dans une fonction auto-exécutée (IIFE).

Cela permet de garder les variables locales au fichier et d'éviter les conflits avec login.js, register.js ou d'autres scripts.









Koto
Accueil
Découvrir
Catégories
Comment ça marche
Publier une annonce
Connexion
Connexion à Koto
Heureux de vous retrouver !

Adresse courriel 
koto_help@outlook.com
 Mot de passe 
••••••••••••
 Se connecter
Connexion réussie !

Pas encore membre ? Créer un compte