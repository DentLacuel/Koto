const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const university = document.getElementById('university').value.trim();
    const password = document.getElementById('password').value;

    const submitButton = registerForm.querySelector('button[type="submit"]');

    try {
        submitButton.disabled = true;
        registerMessage.textContent = 'Création du compte en cours...';

        const { data, error } = await window.kotoSupabase.auth.signUp({
            email: email,
            password: password,
           options: {
                emailRedirectTo: `${window.location.origin}/login.html`,
                    data: {
                        first_name: firstName,
                         last_name: lastName,
                         university: university
         }
}
        });

        if (error) {
            throw error;
        }

        registerMessage.textContent =
            'Compte créé ! Vérifiez votre boîte courriel pour confirmer votre adresse.';

        registerForm.reset();

    } catch (error) {
        console.error('Erreur lors de l’inscription :', error);

        registerMessage.textContent =
            'Impossible de créer le compte. Vérifiez vos informations et réessayez.';

    } finally {
        submitButton.disabled = false;
    }
});