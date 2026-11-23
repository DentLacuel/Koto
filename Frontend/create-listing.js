
const API_URL = 'http://localhost:3000';

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



// Publier une annonce avec ses photos
async function publierAnnonce(event) {

    // Empêcher le rechargement de la page
    event.preventDefault();

    const formulaire = document.querySelector('#listing-form');
    const bouton = formulaire.querySelector('button[type="submit"]');
    const photoInput = document.querySelector('#photos');

    // Conserver les fichiers sélectionnés
    const fichiers = Array.from(photoInput.files);

    try {

        // Désactiver le bouton pendant toute l'opération
        bouton.disabled = true;
        bouton.textContent = 'Publication en cours...';

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

        // Tableau contenant les chemins des photos téléversées
        const photoPaths = [];

        // Préparer et téléverser les photos si nécessaire
        if (fichiers.length > 0) {

            // Préparer les métadonnées des fichiers
            const fichiersInfo = fichiers.map(fichier => ({
                contentType: fichier.type,
                size: fichier.size
            }));

            // Demander les URL signées au backend
            const responseUrls = await fetch(
                `${API_URL}/api/listings/upload-urls`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },

                    body: JSON.stringify({
                        files: fichiersInfo
                    })
                }
            );

            const resultatUrls = await responseUrls.json();

            if (!responseUrls.ok) {
                throw new Error(
                    resultatUrls.message ||
                    'Impossible de préparer le téléversement des photos.'
                );
            }

            // Vérifier que le backend a fourni une URL pour chaque photo
            if (
                !Array.isArray(resultatUrls.uploads) ||
                resultatUrls.uploads.length !== fichiers.length
            ) {
                throw new Error(
                    'Le nombre de photos préparées est incorrect.'
                );
            }

            // Téléverser directement les photos vers Supabase Storage
            for (let i = 0; i < fichiers.length; i++) {

                const fichier = fichiers[i];
                const upload = resultatUrls.uploads[i];

                const { data: uploadData, error: uploadError } =
                    await window.kotoSupabase.storage
                        .from('koto-listings')
                        .uploadToSignedUrl(
                            upload.path,
                            upload.token,
                            fichier,
                            {
                                contentType: fichier.type
                            }
                        );

                if (uploadError) {
                    throw new Error(
                        `Erreur lors du téléversement de la photo ${i + 1} : ${uploadError.message}`
                    );
                }

                // Conserver le chemin retourné par Supabase
                photoPaths.push(uploadData.path);
            }
        }

        // Ajouter les chemins des photos à l'annonce
        annonce.photo_paths = photoPaths;

        // Envoyer l'annonce et ses photos au backend
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
                resultat.message || `Impossible de publier l'annonce.`
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
        bouton.textContent = `Publier l'annonce`;
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
