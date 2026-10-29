//tests qui vérifient les fonctions "validation.js" 

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {validerAnnonce} = require('../validation');

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

test('Annonce avec prix négatif. Rejetée!', () => {
    const annonce = {
        title: `Principes de l'économie 4e édition 'Neuf!'`,
        description: `Manuel Principes de l'économie 4e édition jamais utilisé`,
        price: -80,
        location: 'Laval',
        user_id: 1,
        category_id: 1,
    };

    assert.equal(validationAnnonce(annonce), false);

});

test('Annonce sans titre. Rejetée!', () => {
    const annonce = {
        title: '',
        desctiption: 'Bon prix achetez vite!',
        price: 15,
        location: 'Terrebonne',
        user_id: 1,
        category_id: 1
    };

    assert.equal(validationAnnonce(annonce), false);
});

