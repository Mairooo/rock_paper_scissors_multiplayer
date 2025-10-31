const EventEmitter = require('events').EventEmitter;
var personnage = new EventEmitter();
personnage.on('avancer', function(){
 console.log('vous avancez');
});
personnage.on('tourner', function(direction, angle){
 console.log('vous tournez a ' + direction + ' (angle '+angle+ ' degres)');
});
personnage.emit('tourner', 'gauche', 34);
personnage.emit('avancer');
personnage.emit('tourner', 'droite', 45);
personnage.emit('tourner', 'gauche', 25);