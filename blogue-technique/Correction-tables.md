**Correction des tables + difficultés rencontrées** 

1. Le premier problème : Après avoir créé les tables dans la base de données locale PostgreSQL (psql), j'ai décidé de migrer vers Supabase. Avant cela, j'ai soumis mes tables à ChatGPT afin de les faire vérifier avant leur intégration dans Supabase. Un problème a alors été soulevé:

La table listing contient une contrainte FOREIGN KEY (category_id), mais j'avais oublié de la déclarer dans la table. Il s'agit d'une décision de conception que je veux implémenter dès le départ dans la premère version. Chaque annonce doit appartenir à une catégorie.

J'ai donc corrigé la faute en rajoutant 'category_id NOT NULL' à ma table *listings*.

2. Le deuxieme problème: La table *listing* référence *categories(id)*, il faut donc créer la table *categories* avant la table *listing*, car techniquement lorsque psql crée la table *listing*, il vérifie immédiatement que la table *categories* qu'on vient de référencer existe déjà. Voici le message d'erreur qui s'affichait dans pgAdmin 4:

```sql
 ERROR:  syntax error at or near "FOREIGN"
LINE 4:  FOREIGN KEY (user_id)
         ^ 

SQL state: 42601
Character: 64
```

-> les tables maintenant sont comme suit :

```sql
-- users
CREATE TABLE users(
    id BIGSERIAL NOT NULL PRIMARY KEY, 
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    university VARCHAR(50),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255)
    );

-- catégories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Insérer les catégories
INSERT INTO categories (name)
VALUES
    ('Livres'),
    ('Vêtements'),
    ('Matériel scolaire'),
    ('Meubles'),
    ('Électronique');

--  annonces
CREATE TABLE listings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_listing_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_listing_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
);

--  photos des annonces
CREATE TABLE listing_photos (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    position INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT fk_photo_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings(id)
        ON DELETE CASCADE
);

--  Activer RLS sur les nouvelles tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;
```

Apès les corrections nécessaires, j'ai ajouté des 'RLS' pour chaque table comme couche de sécurité. Ces RlS permettent de déterminer quelles lignes d'une table un utilisateur peut consulter, ajouter,modifier ou supprimer. Les politiques d'accès seront mise en place avec l'avancement du projet.
