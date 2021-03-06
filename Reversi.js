var Reversi = {};
///////////////////////////////////////////////////////////
// Dictionary //
Reversi.Dictionary = function (startValues) {
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
        var property;
        for (property in object) {
            if (Object.prototype.hasOwnProperty.call(object, property)) {
                action(property, object[property]);
            }
        }
    };

    this.each = function (action) {
        this.forEachIn(this.values, action);
    };

    this.isEmpty = function () {
        var property;
        for (property in this.values) {
            if (this.values.hasOwnProperty(property)) {
                return false;
            }
        }
        return true;
    };
};

///////////////////////////////////////////////////////////
// Field's functions //
Reversi.colorsEnum = {
    white: 0,
    black: 1,
    empty: 2
};
Object.freeze(Reversi.colorsEnum);

///////////////////////////////////////////////////////////
// Grid's functions //
Reversi.Grid = function (size) {
    "use strict";
    this.size = size;
    this.cells = [];

    this.populate = function () {
        var y, x;
        for (y = 0; y < this.size; ++y) {
            for (x = 0; x < this.size; ++x) {
                this.setFieldAt(x, y, Reversi.colorsEnum.empty);
            }
        }
    };

    this.getFieldAt = function (x, y) {
        return this.cells[y * this.size + x];
    };

    this.setFieldAt = function (x, y, colour) {
        this.cells[y * this.size + x] = colour;
    };

    this.each = function (action) {
        var y, x;
        for (y = 0; y < this.size; ++y) {
            for (x = 0; x < this.size; ++x) {
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
Reversi.Player = function (id, colour) {
    "use strict";
    this.id = id;
    this.colour = colour;
    this.score = 2;
    this.legalMoves = new Reversi.Dictionary();
};

///////////////////////////////////////////////////////////
// Game's functions //
Reversi.Game = function (size) {
    "use strict";
    this.players = [];
    this.grid = new Reversi.Grid(size);
    this.pass = false; // in the beginning no player could pass
    this.currentPlayer = {};
    this.otherPlayer = {};
    this.round = 1;

    this.initialise = function () {
        this.grid.populate();
        var middleField = parseInt(this.grid.size / 2, 10);
        this.grid.setFieldAt(middleField - 1, middleField - 1, Reversi.colorsEnum.white);
        this.grid.setFieldAt(middleField, middleField, Reversi.colorsEnum.white);
        this.grid.setFieldAt(middleField, middleField - 1, Reversi.colorsEnum.black);
        this.grid.setFieldAt(middleField - 1, middleField, Reversi.colorsEnum.black);

        this.players.push(new Reversi.Player(1, Reversi.colorsEnum.white));
        this.players.push(new Reversi.Player(2, Reversi.colorsEnum.black));
        this.currentPlayer = this.players[0];
        this.changePlayer();

    };

    this.changePlayer = function () {
        this.otherPlayer = this.currentPlayer;
        this.currentPlayer = this.players[this.round];
        this.currentPlayer.legalMoves = this.getLegalMoves();
        this.pass = this.currentPlayer.legalMoves.isEmpty() ? true : false;
        this.round = (this.round + 1) % 2;
    };

    this.isGameFinished = function () {
        if (this.currentPlayer.legalMoves.isEmpty() && this.pass) {
            return true;
        } // if the currPlayer can't move and the prevPlayer passed then we finish the game
        return false;
    };

    this.makeMove = function (x, y) {
        this.updateGrid(x, y);
    };

    this.getLegalMoves = function () {
        var legalMoves = new Reversi.Dictionary(),
            tilesToChange = [],
            tempTiles = [],
            localColor, state = [],
            that = this,
            outOfBounds = false,
            advance = function (value) {
                state = that.grid.addTo(state, value);
                if (state[0] >= that.grid.size || state[1] >= that.grid.size || state[0] < 0 || state[1] < 0) {
                    outOfBounds = true;
                } else {
                    outOfBounds = false;
                    localColor = that.grid.getFieldAt(state[0], state[1]);
                }
            };

        this.grid.each(function (x, y) {
            state = [x, y];
            if (that.grid.getFieldAt(x, y) === Reversi.colorsEnum.empty) {
                that.directions.each(function (direction, value) {
                    advance(value);
                    while (!outOfBounds && localColor === that.otherPlayer.colour) {
                        tempTiles.push(state);
                        advance(value);
                    }
                    if (outOfBounds || localColor === Reversi.colorsEnum.empty) {
                        tempTiles = [];
                    }
                    tilesToChange = tilesToChange.concat(tempTiles);
                    tempTiles = [];
                    state = [x, y];
                });
                if (tilesToChange.length > 0) {
                    legalMoves.store([x, y], tilesToChange);
                }
                tilesToChange = [];
            }
        });
        return legalMoves;
    };

    this.updateGrid = function (x, y) {
        var tilesToChange = this.currentPlayer.legalMoves.lookup([x, y]),
            scoreDiff = tilesToChange.length;
        this.currentPlayer.score += (scoreDiff + 1);
        this.otherPlayer.score -= scoreDiff;
        this.grid.setFieldAt(x, y, this.currentPlayer.colour);
        tilesToChange.forEach(function (field, index, array) {
            this.grid.setFieldAt(field[0], field[1], this.currentPlayer.colour);
        }, this);
    };

    this.directions = new Reversi.Dictionary({
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