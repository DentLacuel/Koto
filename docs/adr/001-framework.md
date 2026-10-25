### ADR 001 : Choix de la full-stack : backend : Node.js + Express. frontend : HTML/CSS/JS

Staut : Accepté
Date : 2026-10-16

*Contexte du produit:*

Koto est une plateforme web permettant d'acheter, de vendre ou de donner des objets, principalement entre étudiants. Les utilisateurs créent un compte, publient des annonces (description, prix, photos, localisation) et cherchent des articles (annonces).

*Problèmatique/Contrainte:*

- Projet à date réalisé par une seule personne avec un temps de développement limité.

- Technologie centrées sur HTML/CSS/JS

- Hébérgement gratuit ou peu coûteux

- Application doit être facile à utiliser (courbe d'apprentissage minimale)

- UI/UX intuitive, simple et minimaliste

*Décisions/Actions:*

Backend : Node.js avec le framework Express qui expose une API REST renvoyant du JSON

Frontend : HTML,CSS et JavaScript(Vanilla pour le moment)

*Alternatives:*

 - Next.js + React: Courbe d'apprentissage supplèmentaire, l'hébergement gratuit de référence *Vercel* est limité aux usages non commerciaux et fonctionne en mode *serverless*

 - Migrer le frontend plus tard vers un framework si l'interface devient très interactive.
 
*Conséquences:*

Positives :
- Un seul language à apprendre et à maintenir pour toute l'application

- Express est minimaliste, très documenté et relativement simple à héberger (un seul processus node)

Négatives :
- Sans framework pour le frontend, la manipulation du DOM ce fait à la main, chose qui peut produire plus de code lorsque l'interface grandit. TypeScript pourrait être envisager plus tard.