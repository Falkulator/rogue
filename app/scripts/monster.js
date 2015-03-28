
Game.Monster = function(x, y) {

	Game.Entity.call(this, "~!~", "blue");
	this._x = x;
	this._y = y;
	this.nx = x;
	this.ny = y;
	this.hasLight = true;
	this.lightColor = [00, 50, 200];

	Game.setEntity(this,x,y);

}


Game.Monster.prototype = Object.create(Game.Entity.prototype); // See note below
Game.Monster.prototype.constructor = Game.Monster;
