// game is doing all the game-logic-things

module.exports = Game

function Game(opts) {
  this.client = opts.client
}

var proto = Game.prototype

proto.addEntity = function() {}

proto.removeEntity = function() {}

proto.spawnCreature = function() {}

proto.spawnTower = function() {}

proto.upgradeTower = function() {}

proto.tick = function() {}
