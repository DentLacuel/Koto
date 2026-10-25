### ADR 001 : Base de données PostgreSQL + hébergement sur Superbase.

Date : 2026 - 10 -19
Statut : Accepté

## Contexte :

Koto doit stocker plusieurs types de données (des utilisateurs, des annonces, des photos etc...), ces données sont liées entre elles, un utilisateur publie plusieurs annonces, une annonce possède plusieurs photos, descriptions et catégories.

## Contraintes :

- Hébergement gratuit peut être limitant

- Compétences en SQL à développer avec un intérêt pour des connaissances réutilisables

- Compatibilité avec Node et Express


## Décision:

- Base de données relationnelle PostgreSQL, l'intégrité des données est garantie par la base. (Aucune annonce sans vendeur, Courriel unique, suppressions en cascade des photos quand une annonce disparait).

- Hébergement via Superbase : tableau de bord pratique pour corriger et éditer les données pendant le développement. Possibilité de stockage des fichiers intégré (pas besoin d'un compte supplémentaire). Mais dort après une période d'inactivité. 

- Authentification est gérée par l'application elle-même et donc programmée via Express : (mots de passe hachés avec bcrypt + sessions)

- Photos sont traitées et envoyées vers le même service de stockage de fichier Superbase Storage, que j'utilise déjà pour la base.


## Alternatives :

- MangoDB : Schéma flexible sans migration, documentation JSON proche des objets JavaScript. Mais pour mon cas NoSQL n'est pas un 1er choix, pour raison de réutilisabilité, une requête qui affiche une annonce avec son vendeur et ses photos et un simple JOIN en SQL.


- Neon : choix très valable (serverless), c'est du PostgreSQL géré. Propose les 'branches' de base de données (copies rapides pour tester une modification sans toucher aux vraies données) et se met automatiquement en veille quand il n’est pas utilisé. Mais Supabase a été préféré pour son tableau de bord (éditeur de tables et de SQL) et son stockage de fichiers intégré, qui évite un compte supplémentaire pour les photos.

Note : les altérnatives restent très proches le choix de PostgreSQL et Supabase l’emportent surtout par commodité.

