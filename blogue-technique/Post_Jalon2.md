
# Qu’est-ce qui a bien fonctionné depuis le jalon 2 ?

*Choix d'architecture*:

Architecture monolithe modulaire était un choix cohérent avec la nature de l'application et la complexité du travail. Un seul backend à gérer + base de données relationnelle. 
 
*Express et Superbase*: 

- Superbase propose plusieurs outils de gestions de PostgreSQL sur le cloud. La création d'une base données est relativement rapide, les tables SQL sont directement stockées dans le cloud avec possibilité de backup local.

- Construire et gérer son serveur soi-même à la main permet de comprendre comment un serveur communique avec les APIs.


# Qu’est-ce que vous feriez différemment si vous recommenciez depuis le début ?


* Utiliser un framework pour le frontend: 

Comme il s'agit d'un premier project d'application web, le Frontend est construit en HTML, CSS, et JavaScript (Vanille), le travail se fait à la main. Cela impacte le DOM quand les pages et fonctionnalités grandissent, mais permet de comprendre la base de l'achritecture Frontend. Cepandant, j'aurais préféré implementer un Framework comme React + Tailwind CSS pour leur écosystème riche, prototypage plus rapide et performace. Tailwind ne génère que les classes réellement utilisées, donc le fichier CSS final est très léger même avec implèmentation Responsive.

* Créer les tables SQL directement sur Supabase:

-> Au lieu de créer une base de données locale et y ajouter les tables SQL une par une. En suite migrer vers la platforme d'ébérgement et les ajuster,  j'aurais dû créer mes tables directement sur Supabase via son éditeur SQL et les hébérger automatiquement sur la platforme. Ceci m'aurais fait gagner beaucoup de temps au départ.

* Utiliser Docker pour contenir l'application:  

Docker à plusieurs avantages, il empaquette l'application avec tout ce dont elle a besoin dans une image qui marchera de la même manière sur n'importe quelle machine et ou serveur. Excellent surtout pour projet d'équipe. Peut être dépoyé sur Render que j'utilise déjà. L'inconvénient c'est la courbe d'apprendtissage, une autre technologie à apprendre pour un projet déjà en cours avec ça propre complixité.

* Ne pas utiliser *multer* des le départ. Un moment difficile comme il s'agit d'un fonctionnalité essentielle pour l'application. (transcription Chat GPT en bas de la page): 

J'ai passé beaucoup de temps à chercher un middleware capable de traiter les uploads. j'ai experimenté avec *multer.memoryStorage*, un middleware Node.js qui sert à gèrer les uploads de fichiers téléversés par les utilisateurs. Mais Multer souffre d'un inconvénient qui peut rendre mon application inutilisable, il garde les fichiers uploadés en mémoire RAM de la machine. Un utilisateur pourrait saturer mon serveur avec de gros fichiers. En plus, ma machine va devoir rester allumée en permanence pour que les utilisateurs puissent utiliser l'option de téléversement. Chose qui n'est pas pratique du tout.

Je devais donc trouver une altérnative sans devoire refaire ou casser mon architecture et perdre tout le progrès. En faisant plus de recherche, j'ai trouvé Supabase Storage: les fichiers ne vivent pas dans la mémoire RAM locale, mais peuvent être envoyer vers la mémoire éphémère de Render par exemple avec un contrôle d'accès au buckets dans Supabase en utilisant des URL signées. La logistique n'est pas parfaite mais bien meilleure que d'utiliser *multer*.



* *Transcription chat GPT*

J'ai une question, le fichier est stocké dans quelle mémoire au juste?

Excellente question. Avec multer.memoryStorage(), le fichier est stocké temporairement dans la mémoire vive (RAM) de la machine qui exécute ton serveur Node.js.

Dans ton cas actuel, il s'agit de la RAM de ton ordinateur Windows, puisque tu exécutes Koto localement avec :

node index.js

1. Comment ça fonctionne ?
Imaginons qu'un utilisateur téléverse une photo de 4 Mo.

Le navigateur envoie la photo à Express.

Multer reçoit le fichier.

Multer conserve temporairement les données binaires dans la RAM de ton ordinateur.

Express récupère ces données dans req.file.buffer.

Express transmet le contenu à Supabase Storage.

Une fois le transfert terminé, le fichier temporaire n'a plus besoin d'être conservé en mémoire.

Voici une représentation :

Navigateur

Photo de 4 Mo

Node.js + Multer

RAM de ton ordinateur
req.file.buffer

Supabase Storage

Stockage permanent de la photo

2. Est-ce que la photo reste dans la RAM ?
Non, pas volontairement.

Lorsque le transfert est terminé et qu'aucune référence ne conserve le buffer, Node.js peut libérer cette mémoire grâce au ramasse-miettes (Garbage Collector).

Attention : cela ne signifie pas que la mémoire est libérée instantanément.

3. Pourquoi est-ce important pour Koto ?
Imaginons que 100 utilisateurs téléversent simultanément une photo de 5 Mo.

100 × 5 = 500 Mo

Tu pourrais donc avoir environ 500 Mo de données d'images en mémoire, sans compter la mémoire utilisée par Node.js et le reste de ton application.

C'est le principal inconvénient de memoryStorage() : il faut contrôler la taille et le nombre de fichiers reçus simultanément.

Pour le MVP de Koto, cette approche est raisonnable avec des limites strictes. À plus grande échelle, on pourra envisager un téléversement direct vers Supabase Storage avec des URL signées, afin de réduire la charge sur ton serveur Express.

mais est-ce qu'il y a une possibilité de faire la transaction sans passer par ma machine? et qu'arrivera t-il quand mon ordinateur n'est pas allumé? et plutard quand l'application sera hebérgée dans un site?


Oui, absolument. Et c'est une excellente question, parce qu'elle touche à un choix architectural important pour Koto : ton ordinateur ne doit pas être nécessaire au fonctionnement de l'application une fois celle-ci déployée.






