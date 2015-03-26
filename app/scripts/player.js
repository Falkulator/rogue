
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

	var lightPasses = function(x, y) {
	  var key = x+","+y;
	  if (key in Game.data) { return (Game.data[key] == 0); }
		return false;
	}

	// var fov = new ROT.FOV.PreciseShadowcasting(lightPasses);


	// fov.compute(this._x, this._y, 10, function(x, y, r, visibility) {
	//     var ch = (r ? "" : "@");
	//     var color = (Game.data[x+","+y] ? "#fff": "#660");
	//     Game.display.draw(x, y, ch, "#ff0", color);
	// });

	/* prepare a FOV algorithm */
	window.lightData = {};
	// var lightPasses = function(x, y) { 
	//     return (Game.data[x+","+y] == 1);
	// }
	var fov = new ROT.FOV.PreciseShadowcasting(lightPasses, {topology:6});


	/* prepare a lighting algorithm */
	var reflectivity = function(x, y) {
	    return (Game.data[x+","+y] == 1 ? 0.3 : 0);
	}
	var lighting = new ROT.Lighting(reflectivity, {range:12, passes:2});
	lighting.setFOV(fov);
	lighting.setLight(this._x, this._y,  [200, 200, 200]);


	var lightingCallback = function(x, y, color) {
	    lightData[x+","+y] = color;
	}
	lighting.compute(lightingCallback);

	/* all cells are lit by ambient light; some are also lit by light sources */
	var ambientLight = [100, 100, 100];
	for (var id in Game.data) {
	    var parts = id.split(",");
	    var x = parseInt(parts[0]);
	    var y = parseInt(parts[1]);



	    var baseColor = (Game.data[id] ? [200, 200, 200] : [0, 0, 0]);
	    var light = ambientLight;

	    if (id in lightData) { /* add light from our computation */
	        light = ROT.Color.add(light, lightData[id]);
	    }

	    var finalColor = ROT.Color.multiply(baseColor, light);
	   Game.display.draw(x, y, null, null, ROT.Color.toRGB(finalColor));
	}


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