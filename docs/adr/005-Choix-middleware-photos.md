# Hébergement cloud de Koto

## Contexte:

Le backend de l'application Koto est développé avec Node.js et Express, les données et les photos par PostgreSQL et Supabase Storage. Jusqu'à présent, le développement et l'exécution du serveur se font localement.

Afin de rendre Koto accessible aux utilisateurs indépendamment de l'ordinateur du développeur, une solution d'hébergement cloud est nécessaire.

## Décision:

Render sera utilisé pour héberger le backend Node.js/Express.

Supabase conservera son rôle d'hébergement PostgreSQL et Storage.

GitHub servira à versionner le code et à transmettre les modifications à Render.

Le déploiement se fera progressivement (approche gradual), en commençant par une version minimale fonctionnelle, puis en ajoutant les fonctionnalités au fur et à mesure.

## Raisons du choix:

Render a été retenu pour les raisons suivantes :

* Déploiement automatisé GitHub.

* Compatibilité avec l'architecture actuelle Node.js/Express.

* Possibilité de faire évoluer le backend sans modifier fondamentalement son architecture.

* Simplicité d'utilisation pour un projet en développement.

* Possibilité de déployer progressivement sans devoir héberger immédiatement toutes les fonctionnalités.


## Conséquences :

* L'application pourra fonctionner dans le cloud et le développement local pourra continuer indépendamment de la version déployée.

* Les mises à jour pourront être déployées depuis GitHub.

* Disposer d'une infrastructure cloud fonctionnelle permettant de développer et déployer l'application progressivement, sans dépendre d'un ordinateur local pour son fonctionnement.


## Alternatives considérées:

Railway : solution intéressante, mais Render a été préféré pour son compromis entre simplicité et déploiement progressif.

Fly.io : davantage de contrôle, mais une configuration plus complexe.

Vercel : excellent pour le frontend, mais moins naturel pour notre serveur Express traditionnel.