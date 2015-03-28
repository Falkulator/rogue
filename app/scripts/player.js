
Game.Player = function(x, y) {
		Game.Entity.call(this, "@", "yellow");
		this._x = x;
		this._y = y;
		this.nx = x;
		this.ny = y;
		this.hasLight = true;
		this.lightColor = [200, 200, 200];

		Game.setEntity(this,x,y);

		
		Game.display.getContainer().addEventListener("click", this);

}

Game.Player.prototype = Object.create(Game.Entity.prototype); // See note below
Game.Player.prototype.constructor = Game.Player;

Game.Player.prototype.getPath= function(end) { 
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

Game.Player.prototype.act = function() {
	Game.engine.lock();

}
		
Game.Player.prototype.handleEvent = function(e) {

	var dir = Game.display.eventToPosition(e);
console.log(dir);
	this.nx = dir[0] + Game.offset[0];
	this.ny = dir[1] + Game.offset[1];

	var path = this.getPath([this.nx, this.ny]);

	path.shift();
	if (path.length < 1) {
	} else if (Game.data[this.nx+","+this.ny]) {
	}else {
			x = path[0][0];
			y = path[0][1];
			//Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
			this._x = x;
			this._y = y;
			Game.setEntity(this, x, y);
	}
		fovLighting();
		Game.setCenter();
		Game.engine.unlock();
}

var fovLighting = function() {
	var lightPasses = function(x, y) {
  var key = x+","+y;
  if (key in Game.data) { return (Game.data[key] == 0); }
		return false;
	}

	/* prepare a FOV algorithm */
	var lightData = {};

	var fov = new ROT.FOV.PreciseShadowcasting(lightPasses, {topology:6});


	/* prepare a lighting algorithm */
	var reflectivity = function(x, y) {
	    return (Game.data[x+","+y] == 1 ? 0.3 : 0);
	}

	var lighting = new ROT.Lighting(reflectivity, {range:22, passes:2});
	lighting.setFOV(fov);
	for (var ent in Game.entities) {
		lighting.setLight(Game.entities[ent]._x, Game.entities[ent]._y,  Game.entities[ent].lightColor);
	}
	


	var lightingCallback = function(x, y, color) {

	    lightData[x+","+y] = color;
	}
	lighting.compute(lightingCallback);
window.lightData = lightData;

	/* all cells are lit by ambient light; some are also lit by light sources */
	var ambientLight = [00, 00, 00];
	Game.colors = {};
	for (var id in Game.data) {
	    var parts = id.split(",");
	    var x = parseInt(parts[0]);
	    var y = parseInt(parts[1]);


	    var baseColor = (Game.data[id] ? [200, 200, 200] : [40, 40, 40]);
	    var light = ambientLight;

	    if (id in lightData) { /* add light from our computation */
	        light = ROT.Color.add(light, lightData[id]);

	    } 
    	var finalColor = ROT.Color.multiply(baseColor, light);

    	Game.colors[x+","+y] = finalColor;
   		//Game.display.draw(x, y, null, null, ROT.Color.toRGB(finalColor));

	}

}

Game.Player.prototype._draw = function() {

	

	//Game.display.draw(this._x, this._y, "@", "#ff0");

}
		
Game.Player.prototype._checkBox = function() {
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
		var x = Game.Game.Player.getX();
		var y = Game.Game.Player.getY();

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



Game.Exit = function(x, y) {
	Game.Entity.call(this, "[]", "red", "black");
		this._x = x;
		this._y = y;
		this.hasLight = true;
		this.lightColor = [200, 0, 0];
		Game.setEntity(this,x,y);

}
		
Game.Exit.prototype._draw = function() { 

}

Game.Exit.prototype.act = function() {

}

Game.Exit.prototype = Object.create(Game.Entity.prototype); // See note below
Game.Exit.prototype.constructor = Game.Exit;