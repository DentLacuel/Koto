const {validerAnnonce} = require('../validation');
const assert = require('node:assert/strict');
const annonce = {
    prix: 10,
    description: 'Manuel Math',
    localisation: 'Montreal'
};

if (validerAnnonce(annonce)){
    console.log('Test réussi!, annonce valide.');
} else {
    assert.fail('Test échoué!, annonce invalide.')
}