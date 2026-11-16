
(function () {

    // Récupérer le client Supabase existant
    const kotoClient = window.kotoSupabase;

    if (!kotoClient) {
        console.error('Client Supabase introuvable.');
        return;
    }

    // Trouver la navigation
    const navbarMenu = document.querySelector('.navbar-menu');

    if (!navbarMenu) {
        return;
    }

    // Trouver le lien de connexion
    let authLink = navbarMenu.querySelector('a[href="login.html"]');

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

    // Gérer la déconnexion
    authLink.addEventListener('click', async (event) => {

        if (authLink.dataset.action !== 'logout') {
            return;
        }

        event.preventDefault();

        authLink.textContent = 'Déconnexion...';
        authLink.style.pointerEvents = 'none';

        try {
            const { error } = await kotoClient.auth.signOut();

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
    kotoClient.auth.onAuthStateChange((event, session) => {

        console.log('Événement Auth Supabase :', event);

        afficherEtatConnexion(session);
    });

    // Vérifier la session existante
    kotoClient.auth.getSession().then(({ data, error }) => {

        if (error) {
            console.error('Erreur de récupération de session :', error);
            return;
        }

        afficherEtatConnexion(data.session);
    });

})();
