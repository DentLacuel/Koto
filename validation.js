function validerAnnonce(annonce) {
    if (annonce.prix < 0 || !annonce.description || !annonce.localisation){
        return false;
    } else {
         return true;
    }
}

module.exports = { validerAnnonce };