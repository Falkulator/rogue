
Game.Player = function(x, y, color) {

		this.controlled = {};
		this.troopsTotal = 1;
		this.troopsPerTurn = 1;
		this.nx = x;
		this.ny = y;
		this.color = color;
		this.emNeighbors = {};
		this.enNeighbors = {};

		
		this.addLand(x,y);
		
		this.ai = new Game.AI(this);
		//Game.display.getContainer().addEventListener("click", this);


}

//Game.Player.prototype = Object.create(Game.Entity.prototype); // See note below
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
	var promise = {
        then: function(cb) { done = cb; }
    }
	this.getTroops();
	this.ai.update();
	setTimeout(function() { done(); }, 5);
	return promise;

}

Game.Player.prototype.getTroops = function() {
	var count = Object.keys(this.controlled).length;
	this.troopsPerTurn = Math.floor(count/5) + 1;
	this.countTroops();
}

Game.Player.prototype.countTroops = function() {
	this.troopsTotal = 0;
	for (var key in this.controlled) {
		if (Game.land[key] !== undefined) {
			this.troopsTotal += Game.land[key].troops;
		}
		
	}
}

Game.Player.prototype.addLand = function(x,y) {
	this.controlled[x+","+y] = 1;
	Game.setLand(this,x,y);
	Game._draw(x,y);
}

Game.Player.prototype.getSpeed = function() {
	return 100;
}

Game.Player.prototype.attack = function(land) {
	return 100;
}

Game.Player.prototype.getEmNeighbors = function() {
	var	player = this,
		emNeighbors = this.emNeighbors,
		enNeighbors = this.enNeighbors;
	for (var id in this.controlled) {
		var parts = id.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);

		var ns = Game.getHexNeighbors(x,y);
		
		ns.map(function(n) { 
			var key =n[0]+","+n[1];
			if (!player.controlled[key]) {
				if (!Game.data[key] && Game.data[key] !== undefined) {
					if (!Game.land[key]) {
						emNeighbors[key] = 1;
					} else {
						enNeighbors[key] = 1;
					}
				} 
			}

		})
	}


}

Game.Player.prototype.handleEvent = function(e) {

	var dir = Game.display.eventToPosition(e);

	// this.nx = dir[0] + Game.offset[0];
	// this.ny = dir[1] + Game.offset[1];
	this.nx = dir[0];
	this.ny = dir[1];
	console.log(dir[0],dir[1])
	Game.setLand(this,dir[0],dir[1]);

	//fovLighting();
	setFov();
	Game.setCenter();
	Game.engine.unlock();
}

var setFov = function() {
	Game.mapVisible = {};
	var lightPasses = function(x, y) {
	  var key = x+","+y;
	  if (key in Game.data) { return (Game.data[key] == 0); }
		return false;
	}

	var fov = new ROT.FOV.PreciseShadowcasting(lightPasses, {topology:6});

	fov.compute(Game.player._x, Game.player._y, 22, function(x, y, r, visibility) {
	    Game.mapVisible[x+","+y] = 1;
	});

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
	
	fov.compute(Game.player._x, Game.player._y, 22, function(x, y, r, visibility) {
	    Game.mapSeen[x+","+y] = 1;
	});

	var lightingCallback = function(x, y, color) {

	    lightData[x+","+y] = color;
	}
	lighting.compute(lightingCallback);


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