## Schéma de donnée pour le projet Koto

## Système de gestion : PostgreSQL (hébérgé sur Superbase, ref: ADR 003)

*Contexte:*

Le modèle proposé couvre les fonctionnalités principales de l'application. D'autres fonctionnalités suiveront au fur et mesure que le développement du projet avance.

La base de données doit assurer la cohérence des informations, notamment les relations entre les utilisateurs et leur annonces, ainsi que l'unicité des adresses courriel.


# Schéma relationnel

- Table users:
```sql
CREATE TABLE users(
    id BIGSERIAL NOT NULL PRIMARY KEY, 
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    university VARCHAR(50),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    );
```
*Les contraintes:*

- id unique clé primaire généré automatiquement.
- nom et prenom.
- adresse courriel obligatoire et unique, evite d'avoir plusieurs usagers utilisant le même email.
- les champs obligatoires ne peuvent pas être NULL ou Nullable.
- mot de passe hashé, empreinte cryptographique avec bcyrpt.

- Table annonces: 
```sql
CREATE TABLE listings(
    id BIGSERIAL PRIMARY KEY, 
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    location VARCHAR(255) NOT NULL,
    phone_number 
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_listing_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

    CONSTRAINT
        fk_listing_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
    );
```

*Les contraintes:*

- user_id est obligatoire, on ne peut pas mettre en vente/donner un objet sans compte.
- titre.
- description.
- prix ne peut pas être négatif, si l'objet est à donner, le prix devra etre 0.
- l'ondroit où se trouve l'objet (au moins la région ou la ville)
- date de création de l'annonce/ transaction.
-  On relie chaque annonce à un utilisateur à l'aide d'une clé étrangère *user_id* dans la table 'listings'. Contrainte : *fk_listing_user - FOREIGN KEY (user_id) - REFERENCES users(id)* établie le lien.
-> On fait la même chose avec les catégories d'articles et photos.


- table des photos:

```sql
CREATE table listing_photos (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    storage_path VARCHAR (500) NOT NULL,
    position INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT fk_photo_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings(id)
        ON DELETE CASCADE
);
```
*Les contraintes:*

- La table conserve les informations permettant de retrouver les photos d'une annonce. Les fichier eux mêmes sont stockés dans *Superbase Storage*. PostgreSQL conserve seulement leur path *storage_path* et leur lien avec l'annonce *listing_id*.
- chaque photo est associée à une annonce existante.
- la suppression d'une annonce supprime automatiquement ses lignes assosciées dans *listing_photos* via une clé étrangère avec ON DELETE CASCADE.


- Table de catégories d'articles

```sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
)
```
*Les contraintes:*

- classer les annonces par grandes catégories.
- id unique pour chaque catégorie clé primaire.
- nom de la catégorie obligatoire et unique par exemple :

```sql
INSERT INTO categories (name)
VALUES
    ('Livres',
    'Vêtements',
    'Matériel scolaire',
    'Meubles',
    'Électronique');
```

# Relations entre les tables

* User et listings: Un utilisateur peut publier plusieurs annonces et chaque annonce possède un seul propriétaire.

* Categories et listings: une catégorie peut regrouper plusieurs annonces et chaque annonce a une catégorie.

* listings et listing_photos: une annonce peut comporter plusieurs photos.

-> Les relations sont assurées par des clés étrangères afin de limiter les références vers des enregistrements inexistants.

# Evolution du modèle

Le schéma proposé constitue une base initiale, l'objectif est de conserver une structure relationnelle simple à maintenir et suffisamment modulaire pour accompagner le développement progressif de l'applicaiton.

Le modèle va évoluer selon les fonctionnalités et les améliorations qui vont se rajouter dans le future.
