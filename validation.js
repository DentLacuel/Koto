
// Vérification qu'un identifiant est un entier positif.
// PostgreSQL BIGSERIAL peut être retourné comme chaîne via pg
function estIdentifiantValide(id) {
    return (
        (Number.isSafeInteger(id) && id > 0) ||
        (typeof id === 'string' && /^[1-9]\d*$/.test(id))
    );
}

// Fonction de validation d'annonce
function validerAnnonce(annonce) {
    if (
        typeof annonce.title !== 'string' ||
        annonce.title.trim().length === 0 ||
        annonce.title.length > 150 ||

        typeof annonce.description !== 'string' ||
        annonce.description.trim().length === 0 ||

        typeof annonce.location !== 'string' ||
        annonce.location.trim().length === 0 ||

        typeof annonce.price !== 'number' ||
        !Number.isFinite(annonce.price) ||
        annonce.price < 0 ||
        annonce.price > 9999.99 ||

        !estIdentifiantValide(annonce.user_id) ||
        !estIdentifiantValide(annonce.category_id)
    ) {
        return false;
    }

    return true;
}

module.exports = { validerAnnonce };
