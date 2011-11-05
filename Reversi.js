// One Global // dunno about it // 
var MY = {};
///////////////////////////////////////////////////////////
// Dictionary //
var Dictionary = function (startValues) {
        "use strict";
        this.values = startValues || {};

        this.store = function (name, value) {
            this.values[name] = value;
        };

        this.lookup = function (name) {
            return this.values[name];
        };

        this.contains = function (name) {
            return Object.prototype.propertyIsEnumerable.call(this.values, name);
        };

        this.forEachIn = function (object, action) {
            for (var property in object) {
                if (Object.prototype.hasOwnProperty.call(object, property)) {
                    action(property, object[property]);
                }
            }
        };

        this.each = function (action) {
            this.forEachIn(this.values, action);
        };

        this.isEmpty = function () {
            return this.values === {};
        }

    };

///////////////////////////////////////////////////////////
// Field's functions //
MY.colorsEnum = {
    white: 0,
    black: 1,
    empty: 2
};
Object.freeze(MY.colorsEnum);

var Field = function (color) {
        "use strict";
        this.color = color;
};

///////////////////////////////////////////////////////////
// Grid's functions //
var Grid = function (size) {
        "use strict";
        this.size = size;
        this.cells = [];

        this.populate = function () {
            for (var y = 0; y < this.size; ++y) {
                for (var x = 0; x < this.size; ++x) {
                    this.setFieldAt(x, y, new Field(MY.colorsEnum.empty));
                }
            }
        };

        this.getFieldAt = function (x, y) {
            return this.cells[y * this.size + x];
        };

        this.setFieldAt = function (x, y, field) {
            this.cells[y * this.size + x] = field;
        };

        this.each = function (action) {
            for (var y = 0; y < this.size; ++y) {
                for (var x = 0; x < this.size; ++x) {
                    action(x, y);
                }
            }
        };

        this.addTo = function (state, value) {
            return [state[0] + value[0], state[1] + value[1]];
        };
    };

///////////////////////////////////////////////////////////
// Player's functions //
var Player = function (id, color) {
        "use strict";
        this.id = id;
        this.color = color;
        this.score = 2;
        this.legalMoves = new Dictionary();
    };

///////////////////////////////////////////////////////////
// Game's functions //
var Game = function (size) {
        "use strict";
        this.players = [];
        this.grid = new Grid(size);
        this.pass = false; // in the beginning no player could pass
        this.currentPlayer = {};
        this.otherPlayer = {};
        this.round = 0;

        this.initialise = function () {
            this.grid.populate();
            var middleField = parseInt(this.grid.size / 2);
            this.grid.getFieldAt(middleField - 1, middleField - 1).color = MY.colorsEnum.white;
            this.grid.getFieldAt(middleField, middleField).color = MY.colorsEnum.white;
            this.grid.getFieldAt(middleField, middleField - 1).color = MY.colorsEnum.black;
            this.grid.getFieldAt(middleField - 1, middleField).color = MY.colorsEnum.black;

            this.players.push(new Player(1, MY.colorsEnum.white));
            this.players.push(new Player(2, MY.colorsEnum.black));
            this.currentPlayer = this.players[0];
            this.changePlayer();

        };

        this.play = function () {
            var i = 0;
            var changePlayer = function () {
                    this.otherPlayer = this.currentPlayer;
                    this.currentPlayer = this.players[i];
                    this.currentPlayer.legalMoves = this.getLegalMoves();
                };

            this.initialise();
            this.players.push(new Player(1, MY.colorsEnum.white));
            this.players.push(new Player(2, MY.colorsEnum.black));
            this.currentPlayer = this.players[1];
            changePlayer();
            while (!this.isGameFinished()) {
                if (!this.pass) {
                    this.makeMove();
                }
                i = (i + 1) % 2;
                changePlayer();
            }
        };

        this.changePlayer = function () {
            this.otherPlayer = this.currentPlayer;
            this.currentPlayer = this.players[this.round];
            this.currentPlayer.legalMoves = this.getLegalMoves();
            this.round = (this.round + 1) % 2;
        };

        this.isGameFinished = function () {
            if (this.currentPlayer.legalMoves.isEmpty() && this.pass) {
                return true;
            } // if the currPlayer can't move and the prevPlayer passed then we finish the game
            if (this.currentPlayer.legalMoves.isEmpty()) {
                this.pass = true;
            } // if the current player can't move then he must pass and we have to check whether the second player can move
            else {
                this.pass = false;
            } // if currPlayer can move we have to change the valueof pass to false
            return false;
        };
        //return (this.currentPlayer.legalMoves === []) ? !this.pass : true;
        this.makeMove = function (x, y) {
            var coords = [x,y]; // read Coords here
            this.updateGrid(coords);
        };

        this.getLegalMoves = function () {
            var legalMoves = new Dictionary(),
                tilesToChange = [],
                tempTiles = [],
                localColor, state = [],
				that = this,
                outOfBounds = false;

            var advance = function (value) {
                    state = that.grid.addTo(state, value);
                    if (state[0] >= that.grid.size || state[1] >= that.grid.size || state[0] < 0 || state[1] < 0) {
                        outOfBounds = true;
                    } else {
                        outOfBounds = false;
                        localColor = that.grid.getFieldAt(state[0], state[1]).color;
                    }
                };

            this.grid.each(function (x, y) {
                state = [x, y];
                if (that.grid.getFieldAt(x, y).color === MY.colorsEnum.empty) {
                    that.directions.each(function (direction, value) {
                        advance(value);
                        while (!outOfBounds && localColor === that.otherPlayer.color) {
                            tempTiles.push(state);
                            advance(value);
                        }
                        if (outOfBounds || localColor === MY.colorsEnum.empty) {
                            tempTiles = [];
                        }
                        tilesToChange = tilesToChange.concat(tempTiles);
                        tempTiles = [];
                        state = [x,y];
                    });
                    if (tilesToChange.length > 0) {
                        legalMoves.store([x, y], tilesToChange);
                    }
                    tilesToChange = [];
                }
            });
            return legalMoves;
        };

        this.updateGrid = function (coords) {
            var tilesToChange = this.currentPlayer.legalMoves.lookup([coords[0], coords[1]]),
                fieldToChange, scoreDiff = tilesToChange.size;
            this.currentPlayer.score += (scoreDiff + 1);
            this.otherPlayer.score -= scoreDiff;
            this.grid.getFieldAt(coords[0], coords[1]).color = this.currentPlayer.color;
            for (var i = 0; i < tilesToChange.size; ++i) {
                fieldToChange = tilesToChange[i];
                this.grid.getFieldAt(fieldToChange[0], fieldToChange[1]).color = this.currentPlayer.color;
            }
        };

        this.directions = new Dictionary({
            "n": [0, -1],
            "ne": [1, -1],
            "e": [1, 0],
            "se": [1, 1],
            "s": [0, 1],
            "sw": [-1, 1],
            "w": [-1, 0],
            "nw": [-1, -1]
        });
    };

///////////////////////////////////////////////////////////
// main //
var main = function () {
        "use strict";
        var size, game;
        while (1) {
            size = 8; // = prompt("Could you enter the size of the grid (only even numbers): ", "");
            if (size % 2 === 0) {
                break;
            }
        }
        game = new Game(size);
        game.play();
    };

//main();