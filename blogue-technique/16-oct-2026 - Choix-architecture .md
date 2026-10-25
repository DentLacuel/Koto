## 2026-Oct-21

# Quelle décision architecturale importante avez-vous prise? Quel était son contexte, et quelles alternatives avez-vous rejetées et pourquoi ?

J'ai choisi une architecture monolithe modulaire pour le projet plutôt qu'une architecture orientée microservices, car cette dernière répond à des problématiques que l'application n'a pas encore et les coûts et la complexité associés aux microservices s'appliqueraient dès le premier jour du développement.

La nature du projet Koto, une marketplace développée par une seule personne ainsi que les contraintes de temps et de l'apprentissage simultané de plusieurs technologies et outils, il était nécessaire de commencer par répondre aux problématiques de gestion afin de pouvoir prendre la décision adéquate:

# 1. Gestion du projet:
Les microservices proposent généralement des solutions de gestion à très grande échelle, permettent à plusieurs équipes de gérer et livrer leur partie indépendament et les pannes sont isolés et traité séparement, tandis que l'application Koto est réalisé par une personne. 

# 2. Gestion des données:
- Koto doit relier les utilisateurs, les annonces, les catégories et les photos. Avec PostgreSQL, une seule base de données relationnelle facilite les clés étrangères, les transactions et la cohérence des données.

- Avec des microservices, chaque service aurait sa propre base et il faudrait faire des appels réseau entre services, puis assembler les résultats, avec le risque d’incohérences.

- Le type débergement à cout réduit (pour le moment) pénalise les microservices. par exemple : Sur Render  chaque service gratuit se met en veille après 15 minutes d’inactivité. Une requête qui traverserait trois services endormis pourrait attendre plus d’une minute. Un monolithe, ne se réveille qu’une fois donc plus adapté.

# 3. Gestion de la complexité opérationnelle:

Avec un monolithe j'aurais généralement un seul backend à tester, configurer et déployer. Avec les microservices, il faut aussi gérer la communication entre services, leurs déploiements, les erreurs réseau et la surveillance de plusieurs composants. La complexité s’ajoute et le coût de gestion est élevé.

Aussi, une architecture monolithe sans structure devient vite difficile à lire et à modifier. En découpant le code en modules (listings, users, photos), chacun avec ses routes, sa logique et ses requêtes SQL, on obtient alors du code organisé et facile à présenter et surtout des responsabilités claires et bien définies.

# Quel obstacle concret avez-vous rencontré et comment l’avez-vous résolu ?

1. Faire le choix de la base de données, de la solution d'hébergement et de la plateforme à utiliser.

Les questions posées :

- Je veux  une base de données relationnelle pour la nature de mon projet et je veux pratiquer le langage SQL.

- Je cherche une solution d'hébergement abordable relativement simple à apprendre afin de limiter le temps d'apprentissage.

Après beaucoup de temps de cherche des différentes options disponibles, PostgreSQL et Supabase se sont imposés comme les choix les plus pertinents. PostgreSQL est un DBSM relationnelle avec beaucoup de documentation disponible qui utilise SQL et Supabase. Le plan gratuit est relativement généreux, ce qui est avantageux dans le cadre d'un projet développé par une seule personne. 


2. Faire le choix de garder ou de supprimer automatiquement les photos et les annonces d'un utilisateur qui n'est plus dans la platforme. 

Je me suis planté devant l'implémentation de *ON DELETE CASCADE* lors de la création des tables SQL. Il s'agit d'un choix de conception:  lorsqu'un utilisateur est supprimé, est-ce que ses annonces sont également automatiquement supprimées?

L'avantage c'est que cela évite la conservation d'annonces orpholines sans utilisateur, c'est-à-dire les annonces dont le propriétaire n'existe plus dans la table *users* dans la base de données.

Le problème est que cette suppression est automatique et définitive. Je devais donc décider si la suppression d'un compte devait réellement supprimer toutes ses annonces, ou les conserver pour des raisons d'historique ou de modération/administration.

Pour la première version de Koto, les annonces seront supprimées si l'utilisateur quitte la plateforme dans le but préserver les ressources. Mais la décision pourra être réévaluée dans le future pour des raisons de sécurité, modération et d'archivage.


# Qu’est-ce que votre schéma de données révèle de votre compréhension du domaine ?

Le schéma de données prposé repond aux besoins essentiels de l'application et sa relation avec la base de données. Les utilisateurs de la plateforme publient des annonces et chaque annonce appartient à une catégorie et peut comporter plusieurs photos. Les clés primaires et étrangères permettent la cohérence des données et limite les références invalides.