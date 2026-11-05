# Accès aux données

**Faire le choix entre le pilot 'pg' de Node.js et supabase-js?**

Pour conencter ma base de données PostgreSQL dans Supabase avec Express pour la gestion du backend, il y a généralement deux façons pour le faire:

1. Supabase-js: 

Permet de communiquer directement avec les APIs de Superbase via la bibliothèque officielle javaScript de Supabase via les méthodes *supabase-js*. On peut alors utiliser PostgreSQL via les services Supabase directement, par exemple :

- Supabase Auth pour l'authentification.
- Supabase Storage pour les photos.

L'avantage c'est qu'on peut accèder facilement aux différents services de Supabase sans construire manuellement toutes les routes et communications.


2. Le pilot 'pg' de Node.js pour PostgreSQL:

Le pilot 'pg' ouvre une connexion directe avec la base de données et on lui envoie des requêtes SQL. Par exemple :

* Express demande les annonces de la catégorie est 'Matériel scolaire'.

* Le pilot 'pg' transmet la requête à PostgreSQL.

* Supabase exécute la requête et retourne les résultats.

L'avantage ici c'est que je peux contrôler les requêtes SQL, les jointures, et la logique de mon backend.

## Quel choix des deux faire alors?

Utiliser les deux ensemble afin de bénéficier des différents avantages et points forts que les deux technologies offrent.

Comme préscisé dans l'ADR 003: je préserve la gestion de l'inscription, le hachage des mots de passe avec bcrypt, Les autorisations et connexion en interne. On ajoute 'pg' et superbase-js chacun ses responsabilités.

Express est responsable de la logique métier de Koto, PostgreSQL est responsable du stockage et de l'intégrité des données, et supabase-js est utilisé coté serveur pour téléverser et supprimer les photos dans Supabase Storage.
