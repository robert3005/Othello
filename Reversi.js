// One Global // dunno about it // 
var MY = {};

///////////////////////////////////////////////////////////
// Grid's functions //
var Grid = function(size){
	this.size = size;
	this.cells = [];

		populate: function(){
			for(var y = 0; y < this.height; ++y){
				for(var x = 0; x < this.width; ++x){
					this.setFieldAt(x, y, new Field());
				}
			}
		},	

		getFieldAt: function(x, y){
			return this.cells[y * this.width + x];	
		},
		
		setFieldAt: function(x, y, field){
			this.cells[y * this.width + x] = field;
		},

		each: function(action){
			for(var y = 0; y < this.height; ++y){
				for(var x = 0; this.width; ++x){
					action(x, y, this.getFieldAt(x, y));
				}
			}
		},

		addTo: function(state, value){
			return [state[0] + value[0], state[1] + value[1]];
		};
};

///////////////////////////////////////////////////////////
// Field's functions //
var Field = function(color){
	this.color = colorsEnum.empty;

	setColor: function(color){
		this.color = color;
	},

	getColor: function(){
		return this.color;		
	};

};

MY.colorsEnum = {black:1, white:2, empty:3};
Object.freeze(MY.colorsEnum);

///////////////////////////////////////////////////////////
// Player's functions //

var Player = function(id, color){
	this.id = id;
	this.color = color;
	this.score = 0;
	this.legalMoves = [];
};

///////////////////////////////////////////////////////////
// Game's functions //

var Game = function(size){
	this.players = [];
	this.grid = new Grid(size);
  	this.pass = false;  // in the beginning no player could pass
  	this.currentPlayer = {};
	
	initialise: function(){
		var middleField = grid.size/2;
		this.grid.getFieldAt(middleField, middleField).setColor(MY.colorsEnum.white);
		this.grid.getFieldAt(middleField+1, middleField+1).setColor(MY.colorsEnum.white);
		this.grid.getFieldAt(middleField+1, middleField).setColor(MY.colorsEnum.black);
		this.grid.getFieldAt(middleField, middleField+1).setColor(MY.colorsEnum.black);
	},

	play: function(){
		var i = 0;
		while(!isGameFinished()){
			currentPlayer = players[i];
			this.makeMove();
			//alert(this.toString);
			//alert(this.printScore);
			i = (i+1)%2;
		}
	//alert("Game is over./n")
	//alert(this.printScore);
	},

	isGameFinished: function(){
	  return (this.currentPlayer.legalMoves === []) ? !this.pass : true;
  },

	makeMove: function(){
		var move = "", coords = [0,0], this.currentPlayer.legalMoves = getLegalMoves();
		updateGrid(coords);
	},

	getLegalMoves: function(){
		var legalMoves = new Dictionary,tilesToChange = [], tempTiles = [], localColor, state = [], outOutBounds = false;
	
		var advance = function(){
			state = grid.addTo(state, value);
			if(state[0] == this.grid.size || state[1] == this.grid.size){
				outOfBounds = true;
			} else {
				localColor = grid.getFieldAt(state[0], state[1]).getColor;
			}
		};

		grid.each(function(x, y){
			state = [x, y];
			if(this.grid.getFieldAt(x, y).getColor == MY.colorsEnum.empty){
				this.directions.each(function(direction, value){
					advance();
					while(!outOfBounds && localColor != currentPlayer.getColor && localColor != MY.colorsEnum.empty){
						tempTiles.push(state);
						advance();
					}
					if(outOfBounds && localColor == MY.colorsEnum.empty){
						tempTiles.clear;
					}
					tilesToChange = tilesToChange.concat(tempTiles);
				});
				if(tilesToChange.size > 0){
					legalMoves.store([x, y], tilesToChange);
				}
				tilesToChange.clear;
			}	
		});
		return legalMoves;
	},

	updateGrid: function(coords){
		var tilesToChange = this.currentPlayer.legalMoves.lookup([coords[0], coords[1]]),
			fieldToChange;
		this.currentPlayer.score += tilesToChange.size;
		for(var i = 0; i < tilesToChange.size; ++i){
			fieldToChange = tilesToChange[i];
			this.grid.getFieldAt(fieldToChange[0], fieldToChange[1]).setColor(this.currentPlayer.getColor);
		}
	},

	directions: function() {return new Dictionary(
		{"n": [0, -1],
		"ne": [1, -1],
		"e":  [1, 0],
		"se": [1, 1],
		"s": [0, 1],
		"sw": [-1, 1],
		"w": [-1, 0],
		"nw": [-1, -1]});
	};

};

///////////////////////////////////////////////////////////
// Dictionary //

var Dictionary = function(startValues) {
	this.values = startValues || {};

	store: function(name, value) {
		this.values[name] = value;
	},

	lookup: function(name) {
		return this.values[name];
	},

	contains: function(name) {
		return Object.prototype.propertyIsEnumerable.call(this.values, name);
	},
	each: function(action) {
		forEachIn(this.values, action);
	},

	forEachIn: function(object, action) {
		for (var property in object) {
			if (Object.prototype.hasOwnProperty.call(object, property))
				action(property, object[property]);
	}
	};
};

///////////////////////////////////////////////////////////
// main //

var main = function(){
	while(1){
		var size=8;// = prompt("Could you enter the size of the grid (only even numbers): ", "");
		if(size%2==0)
			break;
	}
	var game = new Game(size);
	game.play;
};

main();






























