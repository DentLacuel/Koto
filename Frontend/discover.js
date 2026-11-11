
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

        // Image temporaire
        const image = document.createElement('div');
        image.classList.add('listing-image-placeholder');
        image.textContent = 'Photo à venir';

        // Informations de l'annonce
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

        // Assembler les éléments
        info.append(title, price, category, location);
        card.append(image, info);

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