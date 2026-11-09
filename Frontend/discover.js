
const API_URL = 'https://koto-cjyf.onrender.com/api/listings';

// Récupérer les annonces depuis l'API
async function chargerAnnonces() {
    const listingsGrid = document.querySelector('#listings-grid');

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const annonces = await response.json();

        afficherAnnonces(annonces);

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

// Charger les annonces au chargement de la page
chargerAnnonces();