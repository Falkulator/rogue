var Game = {
		display: null,
		offset: [0, 0], /* cell in left-top of canvas */
		colors: {},
		engine: null,
		scheduler: null,
		player: null,
		players: null,
		data: null,
		land: null,
		freeCells: null,
		map: {},
		mapSize: [150,50],
		mapVisible: {},
		mapView: false,


		
		init: function() {
				this.display = new ROT.Display({
						fontSize: 12,
						spacing: 2,
						layout: "hex"
				});
				document.body.appendChild(this.display.getContainer());


				
				this.land = {};
				this.players = {};

				this._prepEntities();

				this._resize();
				//this._miniMap();

				window.addEventListener("resize", this._resize.bind(this));
		},

		_prepEntities: function() { 
			this._generateMap();
			this.players['p1'] = this._getFreeCell(this.freeCells);
			this.players['p2'] = this._getFreeCell(this.freeCells);
			// this.players['p3'] = this._getFreeCell(this.freeCells);
			// this.players['p4'] = this._getFreeCell(this.freeCells);
			var playersSeperated = false;
			for (var i in this.players) {
				for (var j in this.players) {
					if (i !== j) {
						if (this._getPath(this.players[i],this.players[j]).length < 30) {
							playersSeperated = true;
						}
					}

				}
			}
			this.players['p1'] = this.players['p1'].map(function(i) {return 2 * Math.round(i / 2)});//for valid hex value
			this.players['p2'] = this.players['p2'].map(function(i) {return 2 * Math.round(i / 2)});//for valid hex value

			if (playersSeperated) {
				this._prepEntities();
			} else {

				//var exit = new Game.Exit(e[0], e[1]);
				this.player = new Game.Player(this.players['p1'][0], this.players['p1'][1], "blue");
				var player2 = new Game.Player(this.players['p2'][0], this.players['p2'][1], "red");
				// var player3 = new Game.Player(this.players['p3'][0], this.players['p3'][1], "green");
				// var player4 = new Game.Player(this.players['p4'][0], this.players['p4'][1], "orange");
				for (var i=0;i<12;i++) {
					var m = this._getFreeCell(this.freeCells);
				}

				this.setCenter();
				this.scheduler = new ROT.Scheduler.Simple();
				this.scheduler.add(this.player, true);
				this.scheduler.add(player2, true);
				//scheduler.add(exit, true);
				this.engine = new ROT.Engine(this.scheduler);
				this.engine.start();
			}


		},

		_prepLands: function() {
			this._generateMap();
			var p = this._getFreeCell(this.freeCells);
			var e = this._getFreeCell(this.freeCells);
			p = p.map(function(i) {return 2 * Math.round(i / 2)});//for valid hex value
			if (this._getPath(p,e).length < 60) {
				this._prepEntities();
			} else {

				this.player = new Game.Player(p[0], p[1]);

				this.setCenter();
				var scheduler = new ROT.Scheduler.Simple();
				scheduler.add(this.player, true);

				this.engine = new ROT.Engine(scheduler);
				this.engine.start();
			}


		},

		setLand: function(player, x, y) {
			var key = x+","+y;
			if (!this.data[key]) {
				this.land[key] = {
					player: player,
					color: player.color,
					troops: 1
				}
			}
		},

		setEntity: function(entity, x, y) {
			var oldPosition = entity.getPosition();
			if (oldPosition) {
				var oldKey = oldPosition.join(",");
				if (this.entities[oldKey] == entity) { delete this.entities[oldKey]; }
				this._draw(oldPosition[0], oldPosition[1]);
			}

			var key = x+","+y;
			entity.setPosition(x, y);

			if (x !== null) {
				this.entities[key] = entity;
				this._draw(x, y);
			}
		},
		
		removeEntity: function(entity) {
			var oldPosition = entity.getPosition();
			if (!oldPosition) { return; }
			var oldKey = oldPosition.join(",");
			if (this.entities[oldKey] == entity) { delete this.entities[oldKey]; }
			this._draw(oldPosition[0], oldPosition[1]);
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

				/* hexagonal map and rules */
				var w= this.mapSize[0], h= this.mapSize[1];
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
				    Game.display.draw(x, y, value);
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


		setCenter: function() {
			var pos = [this.player._x, this.player._y];
			var opts = this.display.getOptions();
			this.offset[0] = pos[0]-Math.floor(opts.width/2);
			this.offset[1] = pos[1]-Math.floor(opts.height/2);
			if ((this.offset[0] + this.offset[1]) % 2) { this.offset[0]--; }

			/* redraw all */
			this.display.clear();

			// for (var j=0 - 1;j<opts.height + 1;j++) {
			// 	for (var i=j%2 - 2;i<opts.width + 2;i+=2) {
			// 		//this._draw(i+this.offset[0], j+this.offset[1]);
			// 		this._draw(i, j);
			// 	}
			// }

			for (var j=0 - 1;j<opts.height + 1;j++) {
				for (var i=j%2 - 2;i<opts.width+ 2;i+=2) {
					//this._draw(i+this.offset[0], j+this.offset[1]);
					this._draw(i, j);
				}
			}

			//this.drawMap();


		},

		_resize: function() {
			var size = this.display.computeSize(window.innerWidth, window.innerHeight);
			this.display.setOptions({width:size[0], height:size[1]});
			this.setCenter();
		
		},

		_resizeMiniMap: function() {
			Game.mapView = !Game.mapView;
			var scale = 8,
					fSize = 2,
					space = 0.8;
			if (Game.mapView) {
				scale = 2;
				fSize = 10;
				space = 1;
			}
			var size = Game.mapDisplay.computeSize(window.innerWidth/scale, window.innerHeight/scale);
			Game.mapDisplay.setOptions({
				width:Game.mapSize[0], 
				height:Game.mapSize[1],
				fontSize: fSize,
				spacing: space
			});
			Game.setCenter();
		
		},

		_miniMap: function() {
			this.mapDisplay = new ROT.Display({
					fontSize: 2,
					spacing: 0.8,
					layout: "hex"
			});
			var size = this.mapDisplay.computeSize(window.innerWidth/9, window.innerHeight/9);
			this.mapDisplay.setOptions({width:this.mapSize[0], height:this.mapSize[1]});
			this.mapDisplay.getContainer().id = "minimap";
			document.body.appendChild(this.mapDisplay.getContainer());
			this.mapDisplay.getContainer().addEventListener("click", this._resizeMiniMap);

		},


		_draw: function(x, y) {
			// var dispX = x - this.offset[0];
			// var dispY = y - this.offset[1];
			var dispX = x;
			var dispY = y;
			var key = x+","+y;
			var land = this.land[key];
			var tile = this.data[key];

			if (land) {
					this.display.draw(dispX, dispY, land.troops, "", land.color);
			} else if(!tile) {

				this.display.draw(dispX, dispY, null, null, "white");
			} else {
				this.display.draw(dispX, dispY, null, null, "black");
			}
		},

		getHexNeighbors: function(x,y) {
			var arr = [];
			var n = [[-2,0],[2, 0],[-1,-1],[1,1],[-1,1],[1,-1]];
			n.map(function(a) {
				arr.push([a[0]+x,a[1]+y]);
			})
			return arr;
		},

		drawMap: function() {
			//this.mapDisplay.clear();
			for (var id in this.mapVisible) {
				var parts = id.split(",");
				var x = parseInt(parts[0]);
				var y = parseInt(parts[1]);
				if (this.player._x === x && this.player._y === y) {
					this.mapDisplay.draw(x,y,"@","black","yellow");
				} else if (this.mapVisible[id]) {
					this.mapDisplay.draw(x,y,"","","white");
					if (this.data[id]) {
						this.mapDisplay.draw(x,y,"","","grey");
					} else if (this.land[id]) {
						this.mapDisplay.draw(x,y,"E","black","red");
					}
				} else {
					this.mapDisplay.draw(x,y,"","","black");
				}
			}
		},

		getColor: function(x,y) {
			if (!this.colors[x+","+y]) {
				return "black";
			}
			var c = ROT.Color.toRGB(this.colors[x+","+y])
			return c;
		}

};

$(document).ready(function() { 
	Game.init();
});

