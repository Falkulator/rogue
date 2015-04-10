Game.AI = function(player) {
	this.player = player;
}

Game.AI.prototype.update = function() {
	//look for empty spaces to move
	if (Object.keys(this.player.emNeighbors).length === 0) {
		this.player.getEmNeighbors();
	}

	for (var i=0;i<this.player.troopsPerTurn;i++) {
		var l = pickRandomProp(this.player.emNeighbors);

		//there is no easy move
		if (l === undefined) {
			var place = this.bestPlacment();

		} else {
			var parts = l.split(",");
			delete this.player.emNeighbors[l];
			var x = parseInt(parts[0]);
			var y = parseInt(parts[1]);
			this.player.addLand(x,y);			
		}
	
	}


}


Game.AI.prototype.bestPlacment = function() {

}

function pickRandomProp(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}