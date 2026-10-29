//fonction de validation d'annonce(logique)

function validerAnnonce(annonce){
    if(
        !annonce.title || 
        annonce.title.length > 150 ||
        !annonce.description ||
        !annonce.location ||
        typeof annonce.price !== 'number' ||
        !Number.isFinite(annonce.price) ||
        annonce.price < 0 ||
        !Number.isInteger(annonce.user_id) ||
        annonce.user_id <= 0 ||
        !Number.isInteger(annonce.category_id) ||
        annonce.category_id <= 0
    )
    {
        return false;
    }

        return true;   
}

module.exports = {validerAnnonce};