//tests qui vérifient les fonctions "validation.js" 

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {validerAnnonce} = require('../validation');


// Annonce complète
test('Annonce valide. Acceptée!', () => {
    const annonce = {
        title: 'manuel Les lois du travail édition 2025',
        description: 'Manuel en bon état utilisé une session seulement',
        price: 35,
        location: 'Montreal',
        user_id: 1,
        category_id: 1
    };

    assert.equal(validerAnnonce(annonce), true);
});

// Prix négative
test('Annonce avec prix négatif. Rejetée!', () => {
    const annonce = {
        title: 'Principes économie 4e édition Neuf!',
        description: `Manuel Principes de l'économie 4e édition jamais utilisé`,
        price: -80,
        location: 'Laval',
        user_id: 1,
        category_id: 1,
    };

    assert.equal(validerAnnonce(annonce), false);

});

// Limite de prix
test('Annonce prix hors limite. Rejetée!', () => {
    const annonce = {
        title: 'Principes économie 4e édition Neuf!',
        description: `Manuel Principes de l'économie 4e édition jamais utilisé`,
        price: 99999.99,
        location: 'Laval',
        user_id: 1,
        category_id: 1,
    };

    assert.equal(validerAnnonce(annonce), false);

});


// Manque titre
test('Annonce sans titre. Rejetée!', () => {
    const annonce = {
        title: 'Java édition 7',
        desctiption: 'Bon prix achetez vite!',
        price: 15,
        location: 'Terrebonne',
        user_id: 1,
        category_id: 1
    };

    assert.equal(validerAnnonce(annonce), false);
});


//Limite Charactères
test('Annonce titre hors limite. Rejetée!', () => {
    const annonce = {
        title: 'Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7 Java édition 7',
        desctiption: 'Bon prix achetez vite!',
        price: 15,
        location: 'Terrebonne',
        user_id: 1,
        category_id: 1
    };

    assert.equal(validerAnnonce(annonce), false);
});

// Manque localisation
test('Annonce sans localisation. Rejetée1', () => {
    const annonce = {
        title: 'Programmer avec C# édition 7',
        description: 'Manuel comme neuf, jamais utilisé',
        price: 45,
        location: '',
        user_id: 1,
        category_id: 1
    }
    
    assert.equal(validerAnnonce(annonce), false);
});
