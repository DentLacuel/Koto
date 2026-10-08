** Creation de compte (log in): **
- Nom et Prénom
- Adresse e-mail et mot de passe
- Quelle université
- Base de données pour contenir les utilisateurs, les annonces ...

** Creation d'annonce (Listing):**
- Description de l'article
- Prix de l'article
- Photos de l'article
- L'endroit où se trouve l'article
- Tag : mots clés pour aider le moteur de recherche à identifier et rechercher l'article
- -> Chaque annonce a un tag(mot clé), qui fera que la recherche d'articles soit plus personnalisée et plus ciblée. Ajouter plutard un filtre (prix, categorie etc..)


* WishList :
- Ajouter des articles favoris a acheter plutard

* MEssagerie :

une fenetre popup (l'utilisateur X veut partager ses informations avec vous, Accepter ou refuser). -> puis affiche ou pas les infos personnelles

 -a window that pop's up (user X would like to share their info with you [agree or disagree])

* Base de données pour enregistrer les données : SuperBase

* Payments : Stripe




Let's talk a bit about the app I want to build. 



It's has to be advanced enough to be interesting.

has to have enough features to be interactive

has to be somewhat unique to be attractive



my idea for now, Build a basic marketplace for students (but anybody can still use it). User can browse the listings, search by keywords, send messages to buyer/seller (although this feature doesn't have to be advanced like a chatting system, but just sent a message that can be shown in an inbox) or even a smart way cost effective way where a pop up window opens saying (user x would like to share these info with you) and then you can talk outside the app


                FRONTEND
        ┌─────────────────────┐
        │ HTML                │
        │ CSS                 │
        │ Vanilla JavaScript  |
        │(No lib)             |
        └──────────┬──────────┘
                   │
                 HTTP
                   │
                   ↓
                BACKEND
        ┌─────────────────────┐
        │ Node.js             │
        │ Express.js          │
        └──────────┬──────────┘
                   │
                   ↓
                DATABASE
        ┌─────────────────────┐
        │ PostgreSQL          │
        └─────────────────────┘