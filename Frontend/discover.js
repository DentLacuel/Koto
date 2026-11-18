
const API_URL = 'https://koto-cjyf.onrender.com/api/listings';
let toutesLesAnnonces = [];

// Récupérer les annonces depuis l'API
async function chargerAnnonces() {
    const listingsGrid = document.querySelector('#listings-grid');

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

       toutesLesAnnonces = await response.json();

        afficherAnnonces(toutesLesAnnonces);

    } catch (error) {
        console.error('Erreur lors du chargement des annonces :', error);

        listingsGrid.textContent =
            'Impossible de charger les annonces. Veuillez réessayer.';
    }
}



// Gestion de la Lightbox
const lightbox = document.querySelector('#photo-lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxClose = document.querySelector('#lightbox-close');
const lightboxPrev = document.querySelector('#lightbox-prev');
const lightboxNext = document.querySelector('#lightbox-next');
const lightboxCounter = document.querySelector('#lightbox-counter');

// Photos actuellement affichées dans la Lightbox
let photosLightbox = [];
let indexPhotoLightbox = 0;
let titreAnnonceLightbox = '';

// Mettre à jour la photo affichée
function actualiserLightbox() {

    const photo = photosLightbox[indexPhotoLightbox];

    lightboxImage.src = photo.url;
    lightboxImage.alt = titreAnnonceLightbox +
        ' - Photo ' + (indexPhotoLightbox + 1);

    lightboxCounter.textContent =
        (indexPhotoLightbox + 1) + ' / ' + photosLightbox.length;

    // Masquer les flèches s'il n'y a qu'une photo
    const plusieursPhotos = photosLightbox.length > 1;

    lightboxPrev.hidden = !plusieursPhotos;
    lightboxNext.hidden = !plusieursPhotos;
}

// Ouvrir la Lightbox
function ouvrirLightbox(photos, index, titre) {

    if (!Array.isArray(photos) || photos.length === 0) {
        return;
    }

    photosLightbox = photos;
    indexPhotoLightbox = index;
    titreAnnonceLightbox = titre;

    actualiserLightbox();

    if (!lightbox.open) {
        lightbox.showModal();
    }
}

// Photo précédente
lightboxPrev.addEventListener('click', () => {

    indexPhotoLightbox =
        (indexPhotoLightbox - 1 + photosLightbox.length)
        % photosLightbox.length;

    actualiserLightbox();
});

// Photo suivante
lightboxNext.addEventListener('click', () => {

    indexPhotoLightbox =
        (indexPhotoLightbox + 1) % photosLightbox.length;

    actualiserLightbox();
});

// Fermer la Lightbox
lightboxClose.addEventListener('click', () => {
    lightbox.close();
});

// Fermer en cliquant sur le fond sombre
lightbox.addEventListener('click', event => {

    if (event.target === lightbox) {
        lightbox.close();
    }

});


// Afficher les annonces dans la grille
function afficherAnnonces(annonces) {
    const listingsGrid = document.querySelector('#listings-grid');

    // Vider la grille avant d'ajouter les cartes
    listingsGrid.innerHTML = '';

    if (annonces.length === 0) {
        listingsGrid.textContent = 'Aucune annonce disponible.';
        return;
    }

    annonces.forEach(annonce => {

        // Créer la carte
        const card = document.createElement('article');
        card.classList.add('listing-card');

        // Permettre l'utilisation au clavier
        // Le rôle group permet d'avoir des boutons à l'intérieur de la carte.
        card.setAttribute('role', 'group');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-expanded', 'false');

        // Récupérer les photos de l'annonce
        const photos = Array.isArray(annonce.photos) ? annonce.photos : [];

        // Conteneur de l'image
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('listing-image-placeholder');

        let image = null;
        let compteurPhotos = null;
        let indexPhoto = 0;

        if (photos.length > 0) {

            image = document.createElement('img');
            image.classList.add('listing-image');

            // Afficher une photo selon son index
            function afficherPhoto(index) {
                indexPhoto = index;

                image.src = photos[indexPhoto].url;
                image.alt = annonce.title + ' - Photo ' + (indexPhoto + 1);

                image.style.display = 'block';

                if (compteurPhotos) {
                    compteurPhotos.textContent =
                        (indexPhoto + 1) + ' / ' + photos.length;
                }
            }

            // Afficher la première photo
            afficherPhoto(0);

            image.addEventListener('error', () => {
                image.style.display = 'none';
            });

            // Ouvrir la Lightbox au clic sur la photo
            image.addEventListener('click', event => {

            // Si la carte est fermée, le clic sert à l'ouvrir
            if (!card.classList.contains('expanded')) {
            return;
            }

            // Empêcher le clic de déclencher la fermeture de la carte
            event.stopPropagation();

            // Ouvrir la photo dans la Lightbox
            ouvrirLightbox(photos, indexPhoto, annonce.title);

            });

            imageContainer.appendChild(image);

            // Galerie de navigation (uniquement si plusieurs photos)
            if (photos.length > 1) {

                const controles = document.createElement('div');
                controles.classList.add('listing-gallery-controls');

                // Bouton précédent
                const boutonPrecedent = document.createElement('button');
                boutonPrecedent.type = 'button';
                boutonPrecedent.textContent = '‹';
                boutonPrecedent.setAttribute('aria-label', 'Photo précédente');

                // Compteur de photos
                compteurPhotos = document.createElement('span');
                compteurPhotos.classList.add('listing-photo-counter');
                compteurPhotos.setAttribute('aria-live', 'polite');

                // Bouton suivant
                const boutonSuivant = document.createElement('button');
                boutonSuivant.type = 'button';
                boutonSuivant.textContent = '›';
                boutonSuivant.setAttribute('aria-label', 'Photo suivante');

                // Naviguer vers la photo précédente
                boutonPrecedent.addEventListener('click', event => {
                    event.stopPropagation();

                    const nouvelIndex =
                        (indexPhoto - 1 + photos.length) % photos.length;

                    afficherPhoto(nouvelIndex);
                });

                // Naviguer vers la photo suivante
                boutonSuivant.addEventListener('click', event => {
                    event.stopPropagation();

                    const nouvelIndex =
                        (indexPhoto + 1) % photos.length;

                    afficherPhoto(nouvelIndex);
                });

                // Empêcher les touches des boutons de déclencher
                // le comportement clavier de la carte
                controles.addEventListener('keydown', event => {
                    event.stopPropagation();
                });

                controles.append(
                    boutonPrecedent,
                    compteurPhotos,
                    boutonSuivant
                );

                imageContainer.appendChild(controles);
            }

        } else {
            imageContainer.textContent = 'Aucune photo';
        }

        // Informations toujours visibles
        const info = document.createElement('div');
        info.classList.add('listing-info');

        const title = document.createElement('h3');
        title.textContent = annonce.title;

        const price = document.createElement('p');
        price.classList.add('listing-price');
        price.textContent = Number(annonce.price).toFixed(2) + ' $';

        const category = document.createElement('p');
        category.classList.add('listing-category');
        category.textContent = annonce.category_name;

        const location = document.createElement('p');
        location.classList.add('listing-location');
        location.textContent = annonce.location;

        info.append(title, price, category, location);

        // Conteneur des détails cachés initialement
        const details = document.createElement('div');
        details.classList.add('listing-details');

        // Description
        const descriptionTitle = document.createElement('h4');
        descriptionTitle.textContent = 'Description';

        const description = document.createElement('p');
        description.classList.add('listing-description');
        description.textContent =
            annonce.description || 'Aucune description disponible.';

        // Nom du vendeur
        const seller = document.createElement('p');
        seller.classList.add('listing-seller');
        seller.textContent =
            'Vendeur : ' + (annonce.seller_name || 'Non disponible');

        details.append(descriptionTitle, description, seller);

        // Assembler la carte
        card.append(imageContainer, info, details);

        // Fonction d'ouverture et de fermeture
        function basculerCarte() {

            const estDejaOuverte = card.classList.contains('expanded');

            // Fermer les autres cartes
            document.querySelectorAll('.listing-card.expanded').forEach(carte => {
                carte.classList.remove('expanded');
                carte.setAttribute('aria-expanded', 'false');
            });

            // Ouvrir la carte sélectionnée si elle était fermée
            if (!estDejaOuverte) {
                card.classList.add('expanded');
                card.setAttribute('aria-expanded', 'true');
            }
        }

        // Ouverture au clic
        card.addEventListener('click', basculerCarte);

        // Ouverture au clavier : Entrée ou Espace
        card.addEventListener('keydown', event => {

            // Ne pas intercepter les touches des boutons de la galerie
            if (event.target !== card) {
                return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                basculerCarte();
            }
        });

        // Ajouter la carte à la grille
        listingsGrid.appendChild(card);
    });
}




// Fonctionnalités barre de recherche
function filtrerAnnonces() {
    const recherche = document
        .querySelector('#search-input')
        .value
        .trim()
        .toLowerCase();

    const categorieSelectionnee = document
        .querySelector('#category-filter')
        .value;

    const annoncesFiltrees = toutesLesAnnonces.filter(annonce => {

        const titreCorrespond =
            annonce.title.toLowerCase().includes(recherche);

        const categorieCorrespond =
            categorieSelectionnee === '' ||
            annonce.category_id.toString() === categorieSelectionnee;

        return titreCorrespond && categorieCorrespond;
    });

    afficherAnnonces(annoncesFiltrees);
}


// Recuperation et filtrage par categorie depuis Supabase
async function chargerCategories() {
    const categoryFilter = document.querySelector('#category-filter');

    try {
        const response = await fetch(
            'https://koto-cjyf.onrender.com/api/categories'
        );

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const resultat = await response.json();

        resultat.data.forEach(categorie => {
            const option = document.createElement('option');

            option.value = categorie.id;
            option.textContent = categorie.name;

            categoryFilter.appendChild(option);
        });

    } catch (error) {
        console.error('Erreur lors du chargement des catégories :', error);
    }
}

// Charger les annonces au chargement de la page
chargerAnnonces();

// Charger les categories
chargerCategories();

// Ecouteur d'événement
document
    .querySelector('#search-input')
    .addEventListener('input', filtrerAnnonces);

// Ecouteur pour le menu déroulant
document
    .querySelector('#category-filter')
    .addEventListener('change', filtrerAnnonces);