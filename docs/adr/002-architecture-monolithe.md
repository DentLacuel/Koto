### ADR 002: Type d'architecture - monolithe modulaire

Statut : Accepté
Date : 2026-10-16

## Contexte:

Koto regroupe plusieurs fonctionnalité : authentification, gestion des annonces, gestion des photos et recherche. Il faut décider comment organiser le code et comment le déployer: une seule application, ou plusieurs microservices?

## Les contraintes:

- Une seule personne développe le projet.

- L'hébergement gratuit ou peu coûteux impose peu de ressouces, se met en veille apès une période d'inactivité.

- Le code doit rester lisible et facile à maintenir.

## Décision:

- La structure de l'application et un monolithe modulaire, une seule application dont le code est découpé en modules fonctionnels indépendants.

- Chaque module possède ses routes, sa logique et ses requêtes SQL

- Une base de données est partagée, chaque module n'écrivant que dans ses propres tables.

## Altérnatives:

Architecture Microservices : découpage et déploiement en petits services indépendants. Chaque service à son propre code et sa propre base de données + déploiment séparé, doit communiquer avec les autres services individuellement via des APIs. On gagne en souplesse mais le prix de la compléxité, de la supervision et la contrainte de temps de développement ne justifient pas son utilisation pour le moment.

## Conséquences:

- Un seul dépot / service à déployer.

- Les jointures SQL (Annonce, photos, etc...) se font simplement dans une même base.

- Les modules rendent le code facile à parcourir et à tester séparément.

- Une panne ou mise à jour concerne toute l'application, car tout est déployé ensemble.

- Le passage à une structure microservices serait à reconsidérer si un besoin réel apparaît comme : une charge très différente selon les fonctionnalités à venir, ou si plus tard le travail individuel se transforme en travail d'équipes devant livrer indépendamment.