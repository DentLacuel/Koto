# Problème workflow CI-Push


J'ai mis en place de nouveaux test pour vérifier si une annonce est conforme aux contraintes imposées:

```js
function validerAnnonce(annonce){
    if(
        !annonce.title || 
        annonce.title.length > 150 ||
        !annonce.description ||
        !annonce.location ||
        typeof annonce.price !== 'number' ||
        !Number.isFinite(annonce.price) ||
        annonce.price < 0 ||
        annonce.price > 9999.99 ||
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
```

J'ai enuite créé les tests pour vérifier si les contraintes sont respectées pour simuler une création d'annonce par un utilisateur et limiter les incohérences :

```js
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
```

Résultats:

```shell
koto> npm test

> koto@1.0.0 test
> node --test

✔ Annonce valide. Acceptée! (0.684ms)
✖ Annonce avec prix négatif. Rejetée! (0.2034ms)
✖ Annonce prix hors limite. Rejetée! (0.1038ms)
✖ Annonce sans titre. Rejetée! (0.0992ms)
✖ Annonce titre hors limite. Rejetée!
✖ Annonce sans localisation. Rejetée1 (0.093ms)
ℹ tests 6
ℹ suites 0
ℹ pass 1
ℹ fail 5
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 89.8736

✖ failing tests:

test at test\validation.test.js:20:1
✖ Annonce avec prix négatif. Rejetée! (0.2034ms)
  ReferenceError [Error]: validationAnnonce is not defined
```

Le problème pourquoi les tests ne s'éxecutaient pas correctement est du à une petite erreur de frappe au niveau du nom de la fonction : validationAnnonce au lieu de 'validerAnnonce'.
```shell
 ReferenceError [Error]: validationAnnonce is not defined
``` 

Après correction, le résultat est comme prévu:

```shell
koto> npm test

> koto@1.0.0 test
> node --test

✔ Annonce valide. Acceptée! (0.6628ms)
✔ Annonce avec prix négatif. Rejetée! (0.1113ms)
✔ Annonce prix hors limite. Rejetée! (0.1038ms)
✔ Annonce sans titre. Rejetée! (0.0988ms)
✔ Annonce titre hors limite. Rejetée! (0.629ms)
✔ Annonce sans localisation. Rejetée1 (0.1222ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 75.9679
```