
const API_URL = 'https://koto-cjyf.onrender.com';

// Récupérer les catégories depuis l'API
async function chargerCategories() {
    const categorySelect = document.querySelector('#category');

    try {
        const response = await fetch(`${API_URL}/api/categories`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const resultat = await response.json();

        categorySelect.innerHTML =
            '<option value="">Choisir une catégorie</option>';

        resultat.data.forEach(categorie => {
            const option = document.createElement('option');

            option.value = categorie.id;
            option.textContent = categorie.name;

            categorySelect.appendChild(option);
        });

    } catch (error) {
        console.error('Erreur lors du chargement des catégories :', error);

        categorySelect.innerHTML =
            '<option value="">Impossible de charger les catégories</option>';
    }
}


// Afficher un aperçu des photos sélectionnées
function afficherApercuPhotos() {
    const photoInput = document.querySelector('#photos');
    const photoPreview = document.querySelector('#photo-preview');

    photoPreview.innerHTML = '';

    const fichiers = Array.from(photoInput.files);

    // Limiter à 3 photos max
    if (fichiers.length > 3) {
        photoInput.value = '';
        photoPreview.textContent = 'Maximum 3 photos autorisées.';
        return;
    }

    // Vérifier les formats et les tailles
    const formatsAutorises = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    const tailleMax = 5 * 1024 * 1024;

    for (const fichier of fichiers) {

        if (!formatsAutorises.includes(fichier.type)) {
            photoInput.value = '';
            photoPreview.textContent =
                'Format non accepté. Utilisez JPG, PNG ou WebP.';
            return;
        }

        if (fichier.size > tailleMax) {
            photoInput.value = '';
            photoPreview.textContent =
                'Chaque photo doit peser au maximum 5 Mo.';
            return;
        }
    }

    // Afficher les aperçus
    fichiers.forEach(fichier => {
        const image = document.createElement('img');

        image.src = URL.createObjectURL(fichier);
        image.alt = 'Aperçu de la photo';

        image.style.width = '120px';
        image.style.height = '120px';
        image.style.objectFit = 'cover';

        photoPreview.appendChild(image);
    });
}


// Publier une annonce
async function publierAnnonce(event) {

    // Empêcher le rechargement de la page
    event.preventDefault();

    const formulaire = document.querySelector('#listing-form');
    const bouton = formulaire.querySelector('button[type="submit"]');

    try {

        // Vérifier la session Supabase
        const { data, error } =
            await window.kotoSupabase.auth.getSession();

        if (error) {
            throw error;
        }

        const session = data.session;

        if (!session) {
            alert('Vous devez être connecté pour publier une annonce.');
            window.location.href = 'login.html';
            return;
        }

        // Récupérer les valeurs du formulaire
        const annonce = {
            title: document.querySelector('#title').value.trim(),

            description:
                document.querySelector('#description').value.trim(),

            price: Number(document.querySelector('#price').value),

            category_id: document.querySelector('#category').value,

            location: document.querySelector('#location').value.trim()
        };

        // Désactiver le bouton pendant l'envoi
        bouton.disabled = true;
        bouton.textContent = 'Publication en cours...';

        // Envoyer l'annonce au backend
        const response = await fetch(`${API_URL}/api/listings`, {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },

            body: JSON.stringify(annonce)
        });

        const resultat = await response.json();

        if (!response.ok) {
            throw new Error(
                resultat.message || 'Impossible de publier l’annonce.'
            );
        }

        alert('Votre annonce a été publiée avec succès !');

        // Réinitialiser le formulaire
        formulaire.reset();

        // Effacer les aperçus des photos
        document.querySelector('#photo-preview').innerHTML = '';

        // Recharger les catégories
        await chargerCategories();

    } catch (error) {

        console.error('Erreur lors de la publication :', error);

        alert(error.message || 'Une erreur est survenue.');

    } finally {

        bouton.disabled = false;
        bouton.textContent = 'Publier l’annonce';
    }
}


// Écouteur pour la sélection des photos
document
    .querySelector('#photos')
    .addEventListener('change', afficherApercuPhotos);


// Écouteur pour la soumission du formulaire
document
    .querySelector('#listing-form')
    .addEventListener('submit', publierAnnonce);


// Charger les catégories au démarrage
chargerCategories();
