var httpFactory = require("http");
const lecteur = require('fs');
var socketIo = require("socket.io");
var path = require('path');

var monServeur = httpFactory.createServer();
var nbConnecte = 0;
var rooms = {};
const POINTS_TO_WIN = 10;
const POINTS_DIFFERENCE = 2;

const BEATS = {
    pierre: ['ciseau', 'lezard'],
    papier: ['pierre', 'spock'],
    ciseau: ['papier', 'lezard'],
    lezard: ['papier', 'spock'],
    spock: ['ciseau', 'pierre']
};
const CHOICES = ['pierre', 'papier', 'ciseau', 'lezard', 'spock'];

function getAIChoice() {
    return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

monServeur.listen(8080);

monServeur.on("request", function(req, res) {
    let filePath = './src' + (req.url === '/' ? '/client.html' : req.url);
    let ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    if (ext === '.svg') contentType = 'image/svg+xml';

    lecteur.readFile(filePath, function(error, content) {
        if (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

var sockPrincipale = socketIo(monServeur);

sockPrincipale.on("connection", function(sockVersClient) {
    console.log("Un client s'est connecté !");

    sockVersClient.on('choisirMode', function(mode) {
        let roomName;
        if (mode === 'ai') {
            roomName = 'ai_room_' + sockVersClient.id;
            rooms[roomName] = {
                client1: sockVersClient.id,
                client2: 'AI',
                choixClient1: null,
                choixClient2: null,
                scoreClient1: 0,
                scoreClient2: 0,
                isAIRoom: true
            };
            sockVersClient.join(roomName);
            sockVersClient.roomName = roomName;
            sockPrincipale.to(sockVersClient.id).emit('message', 'Prêt à jouer !');
        } else {
            if (nbConnecte % 2 === 0) {
                roomName = 'room' + Math.floor(nbConnecte / 2);
                rooms[roomName] = {
                    client1: sockVersClient.id,
                    client2: null,
                    choixClient1: null,
                    choixClient2: null,
                    scoreClient1: 0,
                    scoreClient2: 0,
                    isAIRoom: false
                };
            } else {
                roomName = 'room' + Math.floor(nbConnecte / 2);
                rooms[roomName].client2 = sockVersClient.id;
                sockPrincipale.to(roomName).emit('message', 'Le jeu commence !');
            }
            nbConnecte++;
            sockVersClient.join(roomName);
            sockVersClient.roomName = roomName;
        }
        console.log('Room : ' + roomName);
        console.log(rooms);
    });

    sockVersClient.on('reponseDuClient', function(message) {
        var roomName = sockVersClient.roomName;
        if (!roomName || !rooms[roomName]) return;

        var currentRoom = rooms[roomName];
        var isClient1 = currentRoom.client1 === sockVersClient.id;

        if (isClient1) {
            currentRoom.choixClient1 = message;
        } else {
            currentRoom.choixClient2 = message;
        }

        if (currentRoom.isAIRoom && currentRoom.choixClient1) {
            currentRoom.choixClient2 = getAIChoice();
        }

        if (currentRoom.choixClient1 && currentRoom.choixClient2) {
            var choix1 = currentRoom.choixClient1;
            var choix2 = currentRoom.choixClient2;
            var result1, result2;

            if (choix1 === choix2) {
                result1 = result2 = 'Égalité';
            } else if (BEATS[choix1] && BEATS[choix1].includes(choix2)) {
                result1 = 'Vous avez gagné';
                result2 = 'Vous avez perdu';
                currentRoom.scoreClient1++;
            } else {
                result1 = 'Vous avez perdu';
                result2 = 'Vous avez gagné';
                currentRoom.scoreClient2++;
            }

            sockPrincipale.to(currentRoom.client1).emit('statut', result1);
            if (!currentRoom.isAIRoom && currentRoom.client2) {
                sockPrincipale.to(currentRoom.client2).emit('statut', result2);
            }

            sockPrincipale.to(roomName).emit('score', {
                scoreClient1: currentRoom.scoreClient1,
                scoreClient2: currentRoom.scoreClient2
            });

            if ((currentRoom.scoreClient1 >= POINTS_TO_WIN && currentRoom.scoreClient1 - currentRoom.scoreClient2 >= POINTS_DIFFERENCE) ||
                (currentRoom.scoreClient2 >= POINTS_TO_WIN && currentRoom.scoreClient2 - currentRoom.scoreClient1 >= POINTS_DIFFERENCE)) {

                if (currentRoom.isAIRoom) {
                    if (currentRoom.scoreClient1 > currentRoom.scoreClient2) {
                        sockPrincipale.to(currentRoom.client1).emit('finDePartie', 'Vous avez gagné la partie !');
                    } else {
                        sockPrincipale.to(currentRoom.client1).emit('finDePartie', 'L\'ordinateur a gagné la partie !');
                    }
                } else {
                    if (currentRoom.scoreClient1 > currentRoom.scoreClient2) {
                        sockPrincipale.to(currentRoom.client1).emit('finDePartie', 'Vous avez gagné la partie !');
                        sockPrincipale.to(currentRoom.client2).emit('finDePartie', 'Vous avez perdu la partie !');
                    } else {
                        sockPrincipale.to(currentRoom.client1).emit('finDePartie', 'Vous avez perdu la partie !');
                        sockPrincipale.to(currentRoom.client2).emit('finDePartie', 'Vous avez gagné la partie !');
                    }
                }
                currentRoom.scoreClient1 = 0;
                currentRoom.scoreClient2 = 0;
            }

            if (currentRoom.isAIRoom) {
                sockPrincipale.to(currentRoom.client1).emit('lastChoices', {
                    votreChoix: choix1,
                    choixAdversaire: choix2
                });
            } else {
                sockPrincipale.to(currentRoom.client1).emit('lastChoices', {
                    votreChoix: choix1,
                    choixAdversaire: choix2
                });
                sockPrincipale.to(currentRoom.client2).emit('lastChoices', {
                    votreChoix: choix2,
                    choixAdversaire: choix1
                });
            }

            currentRoom.choixClient1 = null;
            currentRoom.choixClient2 = null;

            setTimeout(() => {
                sockPrincipale.to(roomName).emit('prochaineManche');
            }, 3000);
        }
    });

    sockVersClient.on('disconnect', function() {
        console.log("Un client s'est déconnecté");
        const roomName = sockVersClient.roomName;
        if (!roomName || !rooms[roomName]) return;

        let info = rooms[roomName];

        if (info.isAIRoom) {
            delete rooms[roomName];
        } else {
            let autreClientId = null;
            if (info.client1 === sockVersClient.id) {
                info.client1 = null;
                autreClientId = info.client2;
            } else if (info.client2 === sockVersClient.id) {
                info.client2 = null;
                autreClientId = info.client1;
            }
            if (autreClientId) {
                sockPrincipale.to(autreClientId).emit('message', 'Votre adversaire a quitté la partie.');
            }
            if (!info.client1 && !info.client2) {
                delete rooms[roomName];
            }
        }
    });

});