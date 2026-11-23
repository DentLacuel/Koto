// URL du backend
// https://koto-cjyf.onrender.com - http://localhost:3000
const API_BASE_URL = 'koto-cjyf.onrender.com';

// Éléments HTML
const profileStatus = document.querySelector('#profile-status');
const myListingsGrid = document.querySelector('#my-listings-grid');

// Éléments du formulaire de modification
const editDialog = document.querySelector('#edit-listing-dialog');
const editForm = document.querySelector('#edit-listing-form');

const editTitle = document.querySelector('#edit-title');
const editDescription = document.querySelector('#edit-description');
const editPrice = document.querySelector('#edit-price');
const editCategory = document.querySelector('#edit-category');
const editLocation = document.querySelector('#edit-location');
const closeEditDialog = document.querySelector('#close-edit-dialog');
const cancelEdit = document.querySelector('#cancel-edit');
const editFormStatus = document.querySelector('#edit-form-status');
const editExistingPhotos = document.querySelector('#edit-existing-photos');
const editPhotoInput = document.querySelector('#edit-photos');
const editPhotoPreview = document.querySelector('#edit-photo-preview');
const editPhotoStatus = document.querySelector('#edit-photo-status');

// Chemins des photos existantes que l'utilisateur souhaite conserver
let photosExistantesConservees = [];

// Nouvelles photos sélectionnées par l'utilisateur
let nouvellesPhotosSelectionnees = [];

// URL temporaires utilisées pour les aperçus
let apercusPhotosUrls = [];

// Annonce actuellement en cours de modification
let annonceEnCours = null;


// Charger les catégories dans le formulaire de modification
async function chargerCategoriesModification() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/categories`
        );

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const resultat = await response.json();

        editCategory.innerHTML =
            '<option value="">Choisir une catégorie</option>';

        resultat.data.forEach(categorie => {

            const option = document.createElement('option');

            option.value = categorie.id;
            option.textContent = categorie.name;

            editCategory.appendChild(option);
        });

    } catch (error) {

        console.error(
            'Erreur lors du chargement des catégories :',
            error
        );

        editCategory.innerHTML =
            '<option value="">Impossible de charger les catégories</option>';
    }
}

// Charger les annonces de l'utilisateur connecté
async function chargerMesAnnonces() {

    try {

        // Vérifier la session Supabase
        const { data, error } =
            await window.kotoSupabase.auth.getSession();

        if (error) {
            throw error;
        }

        const session = data.session;

        // Rediriger si aucun utilisateur n'est connecté
        if (!session) {
            //document.getElementById("connexionProfile").textContent = "Connectez-vous ou créez un compte pour continuer à votre profil.";

            window.alert('Connectez-vous ou créez un compte pour continuer à votre profil.');
            window.location.replace('login.html');
            return;
        }

        // Récupérer les annonces personnelles depuis Express
        const response = await fetch(
            `${API_BASE_URL}/api/listings/mine`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            }
        );

        // Vérifier la réponse du backend
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const annonces = await response.json();

        if (!Array.isArray(annonces)) {
            throw new Error('Format de réponse inattendu.');
        }

        // Afficher les annonces
        afficherMesAnnonces(annonces);

    } catch (error) {

        console.error(
            'Erreur lors du chargement des annonces :',
            error
        );

        profileStatus.textContent =
            'Impossible de charger vos annonces. Veuillez réessayer.';
    }
}

    // Ouvrir le formulaire avec les données actuelles de l'annonce
    function ouvrirFormulaireModification(annonce) {
        editFormStatus.textContent = '';
    // Conserver l'annonce sélectionnée
    annonceEnCours = annonce;

    // Préremplir les champs
    editTitle.value = annonce.title;
    editDescription.value = annonce.description;
    editPrice.value = annonce.price;
    editCategory.value = annonce.category_id;
    editLocation.value = annonce.location;

    // Initialiser les photos existantes
    photosExistantesConservees = Array.isArray(annonce.photos)
    ? annonce.photos.map(photo => ({
        storage_path: photo.storage_path,
        url: photo.url,
        position: photo.position
    }))
    : [];

    // Réinitialiser les URL temporaires
    apercusPhotosUrls.forEach(url => URL.revokeObjectURL(url));
    apercusPhotosUrls = [];

    // Réinitialiser les nouvelles photos
    nouvellesPhotosSelectionnees = [];

    editPhotoInput.value = '';
    editPhotoPreview.innerHTML = '';

    afficherPhotosExistantes();

    // Ouvrir la fenêtre
editDialog.showModal();
}

// Afficher les photos existantes dans le formulaire
function afficherPhotosExistantes() {

    editExistingPhotos.innerHTML = '';

    photosExistantesConservees.forEach(photo => {

        const photoContainer = document.createElement('div');
        photoContainer.classList.add('edit-existing-photo');

        const image = document.createElement('img');
        image.src = photo.url;
        image.alt = 'Photo actuelle de l’annonce';

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'Retirer';

        removeButton.addEventListener('click', () => {

            // Retirer uniquement de la sélection locale
            photosExistantesConservees =
                photosExistantesConservees.filter(
                    item => item.storage_path !== photo.storage_path
                );

            afficherPhotosExistantes();
        });

        photoContainer.append(image, removeButton);

        editExistingPhotos.appendChild(photoContainer);
    });

    actualiserStatutPhotos();
}

// Afficher un aperçu des nouvelles photos sélectionnées
function afficherApercuNouvellesPhotos() {

    // Libérer les anciennes URL temporaires
    apercusPhotosUrls.forEach(url => URL.revokeObjectURL(url));
    apercusPhotosUrls = [];

    editPhotoPreview.innerHTML = '';

    const fichiers = Array.from(editPhotoInput.files);

    const formatsAutorises = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

    const tailleMax = 5 * 1024 * 1024;

    // Vérifier les formats et les tailles
    for (const fichier of fichiers) {

        if (!formatsAutorises.includes(fichier.type)) {
            editPhotoInput.value = '';
            nouvellesPhotosSelectionnees = [];

            editPhotoStatus.textContent =
                'Format non accepté. Utilisez JPG, PNG ou WebP.';
            actualiserStatutPhotos();
            return;
        }

        if (fichier.size > tailleMax) {
            editPhotoInput.value = '';
            nouvellesPhotosSelectionnees = [];

            editPhotoStatus.textContent =
                'Chaque photo doit peser au maximum 5 Mo.';
            actualiserStatutPhotos();
            return;
        }
    }

    // Vérifier la limite totale de 3 photos
    const totalPhotos =
        photosExistantesConservees.length + fichiers.length;

    if (totalPhotos > 3) {

        editPhotoInput.value = '';
        nouvellesPhotosSelectionnees = [];

        editPhotoStatus.textContent =
            'Maximum 3 photos au total. Retirez une photo existante pour en ajouter une nouvelle.';

        actualiserStatutPhotos();
        return;
    }

    // Conserver les fichiers validés
    nouvellesPhotosSelectionnees = fichiers;

    // Créer les aperçus
    fichiers.forEach(fichier => {

        const url = URL.createObjectURL(fichier);
        apercusPhotosUrls.push(url);

        const image = document.createElement('img');

        image.src = url;
        image.alt = 'Aperçu de la nouvelle photo';

        image.style.width = '110px';
        image.style.height = '110px';
        image.style.objectFit = 'cover';

        editPhotoPreview.appendChild(image);
    });

    actualiserStatutPhotos();
}

    // Actualiser le nombre de photos conservées et ajoutées
    function actualiserStatutPhotos() {

    const total =
        photosExistantesConservees.length +
        nouvellesPhotosSelectionnees.length;

    editPhotoStatus.textContent =
        `${total} photo(s) au total. Maximum autorisé : 3.`;
}

// Afficher les annonces personnelles
function afficherMesAnnonces(annonces) {

    // Vider la grille
    myListingsGrid.innerHTML = '';

    // Vérifier si l'utilisateur possède des annonces
    if (annonces.length === 0) {

        profileStatus.textContent =
            `Vous n'avez publié aucune annonce pour le moment.`;

        return;
    }

    profileStatus.textContent =
        `${annonces.length} annonce(s) publiée(s).`;

    // Créer une carte pour chaque annonce
    annonces.forEach(annonce => {

        const card = document.createElement('article');
        card.classList.add('profile-listing-card');

        // Conteneur de la photo
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('profile-listing-image');

        const photos = Array.isArray(annonce.photos)
            ? annonce.photos
            : [];

        if (photos.length > 0 && photos[0].url) {

            const image = document.createElement('img');

            image.src = photos[0].url;
            image.alt = annonce.title;
            image.loading = 'lazy';

            imageContainer.appendChild(image);

        } else {

            imageContainer.textContent = 'Aucune photo';
        }

        // Informations de l'annonce
        const info = document.createElement('div');
        info.classList.add('profile-listing-info');

        const title = document.createElement('h3');
        title.textContent = annonce.title;

        const price = document.createElement('p');
        price.textContent =
            Number(annonce.price).toFixed(2) + ' $';

        const category = document.createElement('p');
        category.textContent = annonce.category_name;

        const location = document.createElement('p');
        location.textContent = annonce.location;

        info.append(title, price, category, location);

    // Bouton Modifier
    const editButton = document.createElement('button');

    editButton.type = 'button';
    editButton.textContent = 'Modifier';
    editButton.classList.add('edit-listing-button');

    editButton.addEventListener('click', () => {
    ouvrirFormulaireModification(annonce);
    });

    info.appendChild(editButton);

    // Assembler la carte
    card.append(imageContainer, info);

        // Ajouter la carte à la grille
        myListingsGrid.appendChild(card);
    });
}

// Fermer avec le bouton X
closeEditDialog.addEventListener('click', () => {
    editDialog.close();
});

// Fermer avec le bouton Annuler
cancelEdit.addEventListener('click', () => {
    editDialog.close();
});

// Initialisation
async function initialiserProfil() {

    await chargerCategoriesModification();

    await chargerMesAnnonces();
}

// Écouter la sélection de nouvelles photos
editPhotoInput.addEventListener(
    'change',
    afficherApercuNouvellesPhotos
);


// Enregistrer les modifications d'une annonce
editForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    // Vérifier qu'une annonce est sélectionnée
    if (!annonceEnCours) {
        editFormStatus.textContent =
            'Aucune annonce sélectionnée.';
        return;
    }

    const boutonEnregistrer =
        editForm.querySelector('button[type="submit"]');

    try {

        boutonEnregistrer.disabled = true;

        editFormStatus.textContent =
            'Enregistrement en cours...';

        // Récupérer la session Supabase
        const { data, error } =
            await window.kotoSupabase.auth.getSession();

        if (error) {
            throw error;
        }

        const session = data.session;

        if (!session) {
            throw new Error('Votre session a expiré. Reconnectez-vous.');
        }

        // Préparer les informations de l'annonce
        const annonceModifiee = {
            title: editTitle.value.trim(),
            description: editDescription.value.trim(),
            price: editPrice.value,
            category_id: Number(editCategory.value),
            location: editLocation.value.trim()
        };

        // Vérifier le nombre total de photos
        const totalPhotos =
            photosExistantesConservees.length +
            nouvellesPhotosSelectionnees.length;

        if (totalPhotos > 3) {
            throw new Error(
                'Une annonce peut contenir un maximum de 3 photos.'
            );
        }

        // Préparer les chemins des nouvelles photos
        let nouveauxChemins = [];

        // Téléverser les nouvelles photos si nécessaire
        if (nouvellesPhotosSelectionnees.length > 0) {

            editFormStatus.textContent =
                'Préparation des photos...';

            // Demander les URL signées à Express
            const responseUploads = await fetch(
                `${API_BASE_URL}/api/listings/upload-urls`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization':
                            `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        files: nouvellesPhotosSelectionnees.map(
                            fichier => ({
                                contentType: fichier.type,
                                size: fichier.size
                            })
                        )
                    })
                }
            );

            const resultatUploads =
                await responseUploads.json();

            if (!responseUploads.ok) {
                throw new Error(
                    resultatUploads.message ||
                    'Impossible de préparer les photos.'
                );
            }

            // Vérifier le nombre d'URL reçues
            if (
                !Array.isArray(resultatUploads.uploads) ||
                resultatUploads.uploads.length !==
                    nouvellesPhotosSelectionnees.length
            ) {
                throw new Error(
                    'La réponse du serveur concernant les photos est invalide.'
                );
            }

            // Téléverser chaque photo directement vers Supabase Storage
            editFormStatus.textContent =
                'Téléversement des photos...';

            for (
                let i = 0;
                i < nouvellesPhotosSelectionnees.length;
                i++
            ) {

                const fichier = nouvellesPhotosSelectionnees[i];
                const upload = resultatUploads.uploads[i];

                const { error: uploadError } =
                    await window.kotoSupabase.storage
                        .from('koto-listings')
                        .uploadToSignedUrl(
                            upload.path,
                            upload.token,
                            fichier,
                            {
                                contentType: fichier.type,
                                upsert: false
                            }
                        );

                if (uploadError) {
                    throw uploadError;
                }

                nouveauxChemins.push(upload.path);
            }
        }

        // Combiner les photos conservées et les nouvelles photos
        const photoPaths = [
            ...photosExistantesConservees.map(
                photo => photo.storage_path
            ),
            ...nouveauxChemins
        ];

        // Envoyer les modifications à Express
        editFormStatus.textContent =
            'Enregistrement de l’annonce...';

        const responseModification = await fetch(
            `${API_BASE_URL}/api/listings/${annonceEnCours.id}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization':
                        `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...annonceModifiee,
                    photo_paths: photoPaths
                })
            }
        );

        const resultatModification =
            await responseModification.json();

        if (!responseModification.ok) {
            throw new Error(
                resultatModification.message ||
                'Impossible de modifier cette annonce.'
            );
        }

        // Confirmer la réussite
        editFormStatus.textContent =
            'Annonce modifiée avec succès.';

        // Fermer le formulaire
        editDialog.close();

        // Libérer les URL temporaires des aperçus
        apercusPhotosUrls.forEach(
            url => URL.revokeObjectURL(url)
        );

        apercusPhotosUrls = [];
        nouvellesPhotosSelectionnees = [];
        photosExistantesConservees = [];
        annonceEnCours = null;

        // Actualiser les annonces affichées
        await chargerMesAnnonces();

    } catch (error) {

        console.error(
            'Erreur lors de la modification de l’annonce :',
            error
        );

        editFormStatus.textContent =
            error.message ||
            'Une erreur est survenue lors de la modification.';

    } finally {

        boutonEnregistrer.disabled = false;
    }
});


initialiserProfil();