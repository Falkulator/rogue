var Game = {
		display: null,
		map: {},
		engine: null,
		player: null,
		ananas: null,
		data: null,
		freeCells: null,


		
		init: function() {
				var dWidth = 150,
						dHeight = 50;
				this.display = new ROT.Display({
						width: dWidth, 
						height: dHeight, 
						fontSize:12,
						layout: "hex"
				});
				document.body.appendChild(this.display.getContainer());

				this._generateMap();

				this._prepEntities();
		},

		_prepEntities: function() { 
			var p = this._getFreeCell(this.freeCells);
			var e = this._getFreeCell(this.freeCells);
			p = p.map(function(i) {return 2 * Math.round(i / 2)});//for valid hex value
			if (this._getPath(p,e).length < 30) {
				this._prepEntities();
			} else {

				this.player = new Player(p[0], p[1]);
				var exit = new Exit(e[0], e[1]);
				var scheduler = new ROT.Scheduler.Simple();
				scheduler.add(this.player, true);
				this.engine = new ROT.Engine(scheduler);
				this.engine.start();
			}


		},

		_getPath: function(start, end) {
				/* prepare path to given coords */
			var passableCallback = function(x, y) {
				return (Game.data[x+","+y] === 0);
			}
			var dijkstra = new ROT.Path.Dijkstra(end[0], end[1], passableCallback, {topology:6});

			var path = [];
			/* compute from given coords */
			dijkstra.compute(start[0], start[1], function(x, y) {
					path.push([x, y]);
			});
			return path;

		},

		_generateMap: function() {
			this.display.clear();
				/* hexagonal map and rules */
				var w= 150, h=50;
				var data = {};
				this.map = new ROT.Map.Cellular(w, h, {
						topology: 6,
						born: [4, 5, 6],
						survive: [ 3, 4, 5, 6]
				});

				this.map.randomize(0.48);
				this.map.create(); /* two iterations */

				this.freeCells = [];
				this.map.create(function(x, y, value) {

				    data[x+","+y] = value;

				    if (value === 0) {
				    	Game.freeCells.push([x, y]);
				    }
				    Game.display.DEBUG(x, y, value);
				});

				/* input callback informs about map structure */
				var passableCallback = function(x, y) {
				    return (data[x+","+y] === 0);
				}

				this.data = data;


				

		},

		_getFreeCell: function(freeCells) {

				var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
				var k = freeCells.splice(index, 1)[0];
				var x = k[0];
				var y = k[1];
				return [x, y];
		},
		
		_createBeing: function(what, freeCells) {

				var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
				var key = freeCells.splice(index, 1)[0];
							console.log("being ",key)
				var parts = key.split(",");
				var x = parseInt(parts[0]);
				var y = parseInt(parts[1]);
				return new what(x, y);
		},
		
		_generateBoxes: function(freeCells) {
				for (var i=0;i<10;i++) {
						var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
						var key = freeCells.splice(index, 1)[0];
						this.map[key] = "*";
						if (!i) { this.ananas = key; } /* first box contains an ananas */
				}
		},
		
		_drawWholeMap: function() {
				for (var key in this.map) {
						var parts = key.split(",");
						var x = parseInt(parts[0]);
						var y = parseInt(parts[1]);
						this.display.draw(x, y, this.map[key]);
				}
		}
};

$(document).ready(function() { 
	Game.init();
});

