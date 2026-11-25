**Configuration de GitHub Actions : une erreur de chemin dans le fichier CI**

## Contexte

Dans le cadre du développement de Koto, j'ai voulu mettre en place un pipeline d'intégration continue (CI) avec GitHub Actions. L'objectif était d'automatiser certaines vérifications à chaque modification du dépôt GitHub, notamment l'installation des dépendances et l'exécution des tests.

Lors de la configuration du fichier ci.yml, j'ai rencontré un problème lié à la définition des chemins utilisés dans le workflow.

## Problème rencontré

Le dépôt GitHub de Koto contient directement à sa racine les fichiers package.json, package-lock.json, les fichiers du backend ainsi que le dossier Frontend/.

Cependant, dans mon fichier de configuration CI, j'avais indiqué des chemins faisant référence à un sous-dossier Koto/, appartenant à un autre dossier annex où je fais des tests locaux, notamment :

working-directory: Koto

cache-dependency-path: Koto/package-lock.json

Cette configuration ne correspondait pas à la structure réelle du dépôt. GitHub Actions cherchait donc les fichiers dans un emplacement inexistant.

L'exécution du workflow ne pouvait pas correctement résoudre ces chemins, ce qui empêchait la configuration de fonctionner comme prévu.

## Solution appliquée + Résultat

J'ai corrigé le fichier ci.yml en supprimant les références au sous-dossier inexistant.

Les paramètres suivants ont été retirés :

working-directory: Koto

cache-dependency-path: Koto/package-lock.json

La configuration a été simplifiée afin que GitHub Actions utilise directement la racine du dépôt pour trouver les fichiers nécessaires.

J'ai ensuite relancé le workflow. Les vérifications se sont exécutées correctement et les tests ont réussi.