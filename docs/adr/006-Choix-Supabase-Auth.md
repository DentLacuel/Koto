# Utilisation de Supabase Auth pur l'autentification

Au départ l'authentification de l'application devait être développée manuellement avec :

- bcrypt pour hacher les mots de passe ;

- Express pour gérer l'inscription et la connexion ;

- express-session pour maintenir les utilisateurs connectés ;

- PostgreSQL pour stocker les informations des comptes et les sessions

Mais vu la surchage du travail pour une personne, l'objectif est de réduire la complexité du backend en conservant une architecture cohérente avec les services déja utilisés:

# Décision

Supabase Auth devient donc le service responsable de l'autentification des utilisateurs. Il prendra donc en charge :

- La création des comptes.

- La gestion et le hachage des mots de passe.

- La connexion et la déconnexion.

- La confirmation des adresses courriel.

- La gestion des jetons d'authentification.

- La récupération des mots de passe.


Express continuera à gérer la logique métier de Koto et à protéger les routes de l'API, tandis que PostgreSQL conservera les informations propres aux profils Koto et les relations avec les annonces.

# Conclusion

Supabase Auth est retenu comme solution d'authentification pour l'application. Cette décision permet de conserver une architecture modulaire monolithique avec Express, PostgreSQL et Supabase Storage, tout en déléguant la gestion des identifiants à un service spécialisé.

Le backend reste responsable de la logique métier, des autorisations et de l'accès aux données. Supabase Auth ne remplace donc pas Express : les deux services remplissent des responsabilités différentes.