# Pierre Papier Ciseaux Lézard Spock - Multijoueur

Un jeu **Pierre Papier Ciseaux Lézard Spock** multijoueur en temps réel, développé avec Node.js et Socket.IO.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

## Fonctionnalités

- **Deux modes de jeu** :
  - **Contre l'IA** — Affrontez un adversaire contrôlé par l'ordinateur
  - **Multijoueur** — Défiez un autre joueur en ligne en temps réel
- **Règles étendues** — Pierre, Papier, Ciseaux, Lézard, Spock (inspiré de *The Big Bang Theory*)
- **Système de score** — Premier à 10 points avec 2 points d'écart remporte la partie
- **Temps réel** — Communication instantanée via WebSockets (Socket.IO)
- **Retour visuel** — Affichage des choix des deux joueurs après chaque manche

## Règles

| Coup     | Bat                 |
|----------|---------------------|
| Pierre   | Ciseaux, Lézard     |
| Papier   | Pierre, Spock       |
| Ciseaux  | Papier, Lézard      |
| Lézard   | Papier, Spock       |
| Spock    | Ciseaux, Pierre     |

## Démarrage

### Prérequis

- [Node.js](https://nodejs.org/) (v14+)

### Installation

```bash
git clone https://github.com/<votre-utilisateur>/rock_paper_scissors_multiplayer.git
cd rock_paper_scissors_multiplayer
npm install
```

### Lancement

```bash
node app.js
```

Ouvrez ensuite [http://localhost:8080](http://localhost:8080) dans votre navigateur.  
Pour le mode multijoueur, ouvrez un second onglet ou demandez à un autre joueur de se connecter à la même adresse.

## Structure du projet

```
├── app.js              # Serveur — HTTP + logique de jeu Socket.IO
├── event.js            # Exemple EventEmitter (apprentissage/démo)
├── package.json
└── src/
    ├── client.html     # Interface du jeu (écran d'accueil + écran de jeu)
    ├── style.css       # Styles
    └── images/         # Images des choix (pierre, papier, ciseaux, lézard, spock)
```

## Stack technique

- **Node.js** — Serveur HTTP
- **Socket.IO** — Communication bidirectionnelle en temps réel
- **Vanilla JS / HTML / CSS** — Interface côté client

## Licence

Ce projet est open source et disponible sous la [licence MIT](LICENSE).
