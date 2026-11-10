const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const submitButton = loginForm.querySelector('button[type="submit"]');

    try {
        submitButton.disabled = true;
        loginMessage.textContent = 'Connexion en cours...';

        const { data, error } =
            await window.kotoSupabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            throw error;
        }

        loginMessage.textContent = 'Connexion réussie !';

        console.log('Utilisateur connecté :', data.user);

    } catch (error) {
        console.error('Erreur de connexion :', error);

        loginMessage.textContent =
            'Connexion impossible. Vérifiez votre courriel et votre mot de passe.';

    } finally {
        submitButton.disabled = false;
    }
});