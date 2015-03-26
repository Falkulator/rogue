
var Player = function(x, y) {
		this._x = x;
		this._y = y;
		this.nx = x;
		this.ny = y;
		
		Game.display.getContainer().addEventListener("click", this);
		this._draw();
}
		
Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }

Player.prototype.getPath= function(end) { 
		/* prepare path to given coords */
	var passableCallback = function(x, y) {

		return (Game.data[x+","+y] === 0);
	}
	var dijkstra = new ROT.Path.Dijkstra(end[0], end[1], passableCallback, {topology:6});

	var path = [];
	/* compute from given coords */
	dijkstra.compute(this._x, this._y, function(x, y) {
			path.push([x, y]);
	});
	return path;

}

Player.prototype.act = function() {
	Game.engine.lock();
		



}
		
Player.prototype.handleEvent = function(e) {

	var dir = Game.display.eventToPosition(e);
	this.nx = dir[0];
	this.ny = dir[1];
		var path = this.getPath([this.nx, this.ny]);
console.log(this._x, this._y,dir, path.length)
	path.shift();
	if (path.length < 1) {
	}else {
			x = path[0][0];
			y = path[0][1];
			Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
			this._x = x;
			this._y = y;
			this._draw();
	}

		this._draw();

		Game.engine.unlock();
}

Player.prototype._draw = function() {
		Game.display.draw(this._x, this._y, "@", "#ff0");
}
		
Player.prototype._checkBox = function() {
		var key = this._x + "," + this._y;
		if (Game.map[key] != "*") {
				alert("There is no box here!");
		} else if (key == Game.ananas) {
				alert("Hooray! You found an ananas and won this game.");
				Game.engine.lock();
				window.removeEventListener("keydown", this);
		} else {
				alert("This box is empty :-(");
		}
}
		
var Pedro = function(x, y) {
		this._x = x;
		this._y = y;
		this._draw();
}
		
Pedro.prototype.getSpeed = function() { return 100; }
		
Pedro.prototype.act = function() {
		var x = Game.player.getX();
		var y = Game.player.getY();

		var passableCallback = function(x, y) {
				return (x+","+y in Game.map);
		}
		var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

		var path = [];
		var pathCallback = function(x, y) {
				path.push([x, y]);
		}
		astar.compute(this._x, this._y, pathCallback);

		path.shift();
		if (path.length == 1) {
				Game.engine.lock();
				alert("Game over - you were captured by Pedro!");
		} else {
				x = path[0][0];
				y = path[0][1];
				Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
				this._x = x;
				this._y = y;
				this._draw();
		}
}
		
Pedro.prototype._draw = function() {
		Game.display.draw(this._x, this._y, "P", "red");
}    



var Exit = function(x, y) {
		this._x = x;
		this._y = y;

		this._draw();
}
		
Exit.prototype._draw = function() { 
	Game.display.draw(this._x, this._y, "[]", "red");
}