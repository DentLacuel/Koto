### Initialisation du projet

## DevLog 1: 8-Oct-2026

J'ai commencé aujourd'hui la mise en place technique du projet Koto. Avant toute chose, je voulais créer un envirennement propre pour le projet et mettre en place un système de versioning avec Git et GitHub.

Koto sera une plateforme web gratuite permettant principalement aux étudiants, mais également à toute autre personne d'acheter, vendre ou donner des objets dont ils n'ont plus besoin.

Comme premier pas, j'ai praparé le dépot du projet, créé les fichiers nécessaires et établir une première version du système CI.


# Mise en place du dépôt Git

J'ai commencé d'abord par créer un dossier local Koto sur ma machine et j'y ai créé les fichier suivants:

- README.md
- Features.md
- User Stories.md
- .github/workflow/ci.yml

**NB**: README.md contient la présentation du projet.
 User Stories contient les fonctionnalités envisagées et les besoins des utilisateurs, tandis que Feature.md est mon espace 'Brainstorming', qui sera alimenté au fur et à mesure que le projet avance, il regroupera toutes les idées pour le projet, mais seules les fonctionnalités jugées essentielles au bon fonctionnement de l'application seront intégrées dans User stories.md


# Première difficulté: Git initialisé au mauvais endroit#

J'ai voulant initialisé git, j'ai exécuté "git status" en premier lieu (d'ailleurs une très bonne pratique avant de commiter pour voir les fichiers modifiés, inclus etc...) et j'ai constaté que git détectait des fichiers qui ne faisaient pas partie du projet Koto mais des fichiers présents dans le "Desktop" :

```bash
git status

On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        ../ci-demo/
        ../desktop.ini

nothing added to commit but untracked files present (use "git add" to track)
```

J'ai compris qu'après avoir suivi et expérimenté avec l'exemple du cours : Module 2 - Le versionning avec git et l'intégration continue (CI), git avait initialisé au niveau de mon Desktop suivant des tests que je faisais auparavant.

La commande :
```Bash
git rev-parse --show-toplevel
```
m'a permis de vérifier la racine réelle du dépôt git. "git add ." aurait ajouté  des fichiers de mon Desktop sans rapport avec le projet.

J'ai donc supprimé le dépôt git crée au mauvais endroit, puis j'ai initialisé git directement dans le dossier Koto. Un autre "git status" a confirmé la correction du problème.

# Premier Commit - Initial commit

Une fois le dépot correctement configuré, j'ai placé les fichiers du projet dans le staging area avec "git add ." qui seront inclus dans le premier commit.

j'ai ensuite créé le commit pour enregistrer la première version du projet dans l'historique git.

# Dépôt GitHub

Sur GitHub j'ai créé le dépôt qui correspond au projet et relié mon dépôt local avec celui que j'ai créé sur Github avec un remote appelé "origine", le dépôt distant Git et j'ai fait le premier Push.

# Deuxième difficulté - Mise en place du CI :

J'avais mis en place un CI dès le début du projet, pensant que j'allais gagné du temps, j'ai donc créé un dossier github/workflows/ci.yml, après le premier push, GitHub n'avait pas reconnu mon workflow et donc rien ne se passait au niveau de GitHub Actions. Après plusieurs minutes de vérifications j'ai constaté que j'avais oublié un ".", le fichier github devait être nommé: .github et non github

```bash
Mode LastWriteTime Length Name
 ---- ------------- ------ ---- 
 Directory: 

 C:\Desktop\Koto\github\workflows 
 
 Mode LastWriteTime Length Name 
 ---- ------------- ------ ---- 
  0 ci.yml
```

Une fois la faute corrigé j'ai pushé mon Premier commit "Initial Commit ".

# Troisième difficulté - Workflow CI:

Après le premier push le workflow associé au premier commit a échoué, car le fichier ci.yml était encore vide, j'avais oublié de le configuré avant de pusher le premier commit. 

```Bash
Initial commit
CI #1: Commit a432739 pushed by DentLacuel
main	
Oct 8, 10:20 AM EDT
 Failure
```

J'ai donc du refaire mon workflow, je l'ai confuguré afin qu'il puisse récupérer le code du dépot, installer Node.js et vérifier que Node.js est bien installé.

Ensuite j'ai créé un nouveau commit "Ajout de CI Workflow" et pusher vers GitHub.

Cette fois, le workflow a été exécuté correctement:

```bash
Ajout de CI workflow
CI #2: Commit 21cc6a9 pushed by DentLacuel
main	
Oct 8, 10:46 AM EDT
 43s
```

Cette étape m'a appris le fonctionnement de base de Git et GitHub, prendre le temps nécéssaire de vérifier tous les éléments avant de commiter.