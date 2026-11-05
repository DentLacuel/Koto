**Difficulté lors de l'installation du package 'pg' de PostgreSQL**

En executant la commande *npm install pg* pour installer le pilot PostgreSQL afin de connecter Express à Superbase et l'ajouter au dépendances, un problème est survenu:

```shell
koto> npm install pg

added 79 packages, and audited 80 packages in 9s

28 packages are looking for funding
  run `npm fund` for details

1 high severity vulnerability
```
Une vulnérabilité levée a été détéctée. En exécute la commande *npm audit* pour obtenir plus d'information, on obtient :

```shell
koto> npm audit
# npm audit report

body-parser  2.0.0 - 2.3.0
Severity: high
body-parser vulnerable to Denial of Service via trailing bytes after a compressed request body - https://github.com/advisories/GHSA-27r3-jxmh-p828

fix available via `npm audit fix`
node_modules/body-parser

1 high severity vulnerability

To address all issues, run:
  npm audit fix
```

- Le problème semble venir de la dependance *body-parser* qui est utilisée par Express pour analyser les requêtes HTTP. La vulnérabilité concerne un risque de déni de service. La gravité est élevée, mais limitée. Claude explique qu'il n’y a pas de fuite de données ni d’exécution de code. Transcription en bas de la page.

- Une corection était disponible via *npm audit fix*. Résultat :

```shell
koto> npm audit fix
changed 2 packages, and audited 80 packages in 1s

found 0 vulnerabilities
```

- On remarque 2 pakages ont été changés. pour consulter les modifications apportées, on regarde directement dans le *package-lock-json* via *git diff -- pacakge-lock.json*, on obtient :

```shell
"dependencies": {
+        "express": "^5.3.0",
+        "pg": "^8.23.1"
       },
     "node_modules/accepts": {
@@ -26,18 +27,18 @@
     },
     "node_modules/body-parser": {
-      "version": "2.3.0",
-      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-2.3.0.tgz",
-      "integrity": "sha512-2cGmJupaNgg+QUwVLAucDuWuoMZ6EX9iHDRswZ5lsNYEmwPaRknMPCLZz07yTzVq/83p4o/wzbDZbBrTvGGTIw==",
+      "version": "2.4.0",
+      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-2.4.0.tgz",
```

- On remarque le pilot pg a été installé : "pg": "^8.23.1"

- Le *body-parser* a été mise à jour : node_modules/body-parser": {
    "version": "2.3.0", vers la version : "version": "2.4.0".

- Nous n'avons pas encore garantie le bon fonctionnement du package après les modifications apportées, on lance un autre test pour s'assurer que :

```shell
 npm test

> koto@1.0.0 test
> node --test

Test réussi!, annonce valide.
✔ test\validation.test.js (67.631ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 92.4145
```
Puis :

```shell
 >git status

On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   package-lock.json
        modified:   package.json
```

- Maintenant que les tests sont effectués avec succès les deux packages *package-lock.json* et *package.json* ont été mis à jour en conséquence.

-> Push vers github "MAJ dependences + pg".



* Transcription converstaion avec Claude :

en installant le pilot pg de PostgreSQL, j'ai eu ce message d'erreur :
```shell
koto> npm install pg

added 79 packages, and audited 80 packages in 9s

28 packages are looking for funding
  run npm fund for details

1 high severity vulnerability

npm audit

# npm audit report

body-parser  2.0.0 - 2.3.0
Severity: high
body-parser vulnerable to Denial of Service via trailing bytes after a compressed request body - https://github.com/advisories/GHSA-27r3-jxmh-p828

fix available via npm audit fix
node_modules/body-parser

1 high severity vulnerability

To address all issues, run:
  npm audit fix
```

quand je fais l'audit celui ci explique qu'il y a une vulnérabilité au niveau du body_parser + un dénie de service. explique moi  brièvement ce problème? Je veux aussi savoir  s'il n'y a pas de risque de fuite de donnée etc:.. vu le : '1 high severity vulnerability' 




Le problème

body-parser est un middleware de Node.js/Express qui lit le corps des requêtes. Quand une requête arrive avec un Content-Encoding comme gzip, il la décompresse, mais ne place aucun écouteur d’erreur sur le flux de décompression. Si un client envoie une trame compressée valide suivie d’octets en trop, ces octets provoquent une erreur dans le décodeur, qui est relancée comme exception non interceptée. Le serveur plante donc avec une seule requête malveillante. Express a publié un avis de sécurité (CVE-2026-111181) pour cette faille. 
opencve
expressjs

Risque de fuite de données ?

Non, d’après le vecteur CVSS publié. La note est de 7,5 (High), avec une confidentialité et une intégrité sans impact (C:N/I:N) et seulement la disponibilité touchée (A:H). Il n’y a ni vol, ni lecture, ni modification de données, ni exécution de code. L’attaquant peut seulement faire tomber ton application. Le « high » vient de la facilité d’exploitation (une requête, sans authentification), pas d’un risque pour tes données. 
opencve

Quel lien avec pg ?

Aucun. Le driver pg n’utilise pas body-parser. Il était déjà dans ton projet, probablement via express, et npm install l’a simplement signalé lors de l’audit. Cela ne concerne que ton application si elle expose un serveur Express recevant des requêtes HTTP, surtout depuis Internet. Si c’est un script ou un outil local, le risque est quasi nul.

Comment corriger

npm audit fix

Les versions corrigées sont body-parser 2.4.0 (ou 1.20.9 pour la branche 1.x). Vérifie ensuite avec npm audit que l’alerte a disparu. Si tu ne peux pas mettre à jour tout de suite, tu peux contourner le problème en mettant l’option inflate de body-parser à false.