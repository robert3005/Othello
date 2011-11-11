window.onload = function () {
    "use strict";
    var ReversiUI = function (size) {
            this.boardColorLight = "#B2CBD9";
            this.boardColorDark = "#7F8E98";
            this.boardBorderColor = "#EFDAAD";
            this.whites = "#E5EEF5";
            this.blacks = "#4F443A";
            this.tokenBorder = "#000";
            this.size = size;
            this.cellsize = 64;
            this.baseOffset = 100;
            this.gridsize = this.size * this.cellsize + 2 * this.baseOffset;
            this.Game = new Reversi.Game(this.size);
            this.drawable = new Raphael("othello", this.gridsize, this.gridsize);
            this.header = 0;
            this.scores = [];
            this.scoreBoard = [
                [],
                []
            ];
            this.fieldList = [];

            this.field = function (xcord, ycord, column, row) {
                var that = this;
                var colour = this.Game.grid.getFieldAt(row, column);
                var defined = colour === Reversi.colorsEnum.empty ? false : true;
                colour = colour === Reversi.colorsEnum.white ? this.whites : this.blacks;
                var backgroundColour = ((row * this.size + column) % 2) === (row % 2) ? this.boardColorLight : this.boardColorDark;

                var fieldBackground = this.drawable.rect(xcord, ycord, this.cellsize, this.cellsize).attr({
                    fill: backgroundColour,
                    stroke: this.boardBorderColor
                });

                var token = this.drawable.circle(xcord + this.cellsize / 2, ycord + this.cellsize / 2, 20).attr({
                    fill: colour,
                    stroke: this.tokenBorder,
                    opacity: defined ? 1 : 0
                }).data("defined", defined);

                var toggleTokenColor = function (op) {
                        return function () {
                            if (this.Game.currentPlayer.legalMoves.lookup([row, column]) !== undefined) {
                                token.attr({
                                    fill: this.translateColorEnum(this.Game.currentPlayer.colour)
                                });
                                if (!token.data("defined")) {
                                    token.animate({
                                        opacity: op
                                    }, 300, "backOut");
                                }
                            }
                        };
                    };

                var placeToken = function (obj) {
                        return function () {
                            if (obj.Game.currentPlayer.legalMoves.lookup([row, column]) !== undefined) {
                                token.data("defined", true);
                                obj.makeMove(row, column);
                            }
                        };
                    };

                var eventField = this.drawable.rect(xcord, ycord, this.cellsize, this.cellsize).attr({
                    fill: this.boardColorLight,
                    stroke: this.boardBorderColor,
                    opacity: 0
                }).hover(toggleTokenColor(0.4), toggleTokenColor(0), this, this).click(placeToken(this));

                return token.id;
            };

            this.initialise = function () {
                this.Game = new Reversi.Game(this.size);
                this.Game.initialise();
                this.header = 0;
                this.scores = [];
                this.scoreBoard = [
                    [],
                    []
                ];
                this.fieldList = [];
            };

            this.makeMove = function (row, column) {
                this.Game.makeMove(row, column);

                var tilesToChange = this.Game.currentPlayer.legalMoves.lookup([row, column]);
                var tilesDrawables = this.drawable.set();
                tilesToChange.forEach(function (coords, index, array) {
                    tilesDrawables.push(this.drawable.getById(this.fieldList[coords[1] * this.size + coords[0]]));
                }, this);
                tilesDrawables.push(this.drawable.getById(this.fieldList[column * this.size + row]));

                tilesDrawables.animate({
                    opacity: 1,
                    fill: this.translateColorEnum(this.Game.currentPlayer.colour)
                }, 500, "backOut");

                this.Game.changePlayer();
                this.updateScores();
                this.updateCurrentPlayer();

                if (this.Game.pass) {
                    this.Game.changePlayer();
                    this.updateCurrentPlayer();
                }

                if (this.Game.isGameFinished()) {
                    this.printWinner();
                }
            };

            this.updateCurrentPlayer = function () {
                if (this.header !== 0) {
                    this.drawable.getById(this.header).attr({
                        text: this.getCurrentPlayer(this.Game.currentPlayer.colour) + " Turn"
                    });
                } else {
                    var header = this.drawable.text(this.gridsize / 2, 50).attr({
                        font: "bold 40px Verdana",
                        fill: this.blacks,
                        text: this.getCurrentPlayer(this.Game.currentPlayer.colour) + " Turn"
                    });
                    this.header = header.id;
                }
            };

            this.updateScores = function () {
                for (var i = this.scores.length; i > 0; --i) {
                    this.scores[i] = this.scores[i - 1];
                }
                this.scores[0] = [this.Game.players[0].score, this.Game.players[1].score];
                var lastScores = this.scores.slice(0, 5);
                lastScores.forEach(function (score, index, scoresArray) {
                    this.scoreBoard.forEach(function (scoresDisplay, player, scoreBoardArray) {
                        var screenEdge = player === 0 ? 40 : 120;
                        var fontSize = 32 - index * 3;
                        var position = 160 + index * 25;
                        if (scoresDisplay[index] !== undefined) {
                            scoresDisplay[index].attr({
                                text: this.scores[index][player]
                            });
                        } else {
                            scoresDisplay[index] = this.drawable.text(screenEdge, position).attr({
                                font: "bold " + fontSize + "px Verdana",
                                fill: this.blacks,
                                text: this.scores[index][player]
                            });
                        }
                    }, this);
                }, this);
            };

            this.printWinner = function () {
                var winner;
                var winnerScore = 0;
                this.Game.players.forEach(function (player, index, array) {
                    if (player.score > winnerScore) {
                        winnerScore = player.score;
                        winner = player.colour;
                    } else if (player.score === winnerScore) {
                        winner = Reversi.colorsEnum.empty;
                    }
                });
                this.drawable.text(this.gridsize / 2, this.gridsize - 40).attr({
                    font: "bold 40px Verdana",
                    fill: this.blacks,
                    text: winner === Reversi.colorsEnum.empty ? "Draw" : this.getCurrentPlayer(winner) + " Win"
                });

            };

            this.translateColorEnum = function (colorEnum) {
                return colorEnum === Reversi.colorsEnum.white ? this.whites : this.blacks;
            };

            this.getCurrentPlayer = function (color) {
                return color === Reversi.colorsEnum.white ? "Whites" : "Blacks";
            };

           this.redraw = function(obj) {
                return function () {
                    var othello = document.getElementById("othello");
                    othello.parentNode.removeChild(othello);
                    var _body = document.getElementsByTagName('body')[0];
                    var _div = document.createElement('div');
                    _div.setAttribute("id", "othello");
                    _body.appendChild(_div);
                    obj.drawable = new Raphael("othello", obj.gridsize, obj.gridsize);
                    obj.initialise();
                    obj.drawBoard();
                };
            };

            this.drawBoard = function () {
                var _canvas = document.getElementById("othello");
                _canvas.style.width = this.gridsize + "px";
                _canvas.style.margin = "0 auto";

                var playerScores = this.drawable.text(80, 105, "Scores").attr({
                    font: "bold 20px Verdana",
                    fill: this.boardColorDark
                });
                var whitePlayerScores = this.drawable.text(40, 130, "Whites").attr({
                    font: "bold 16px Verdana",
                    fill: this.blacks
                });
                var blackPlayerScores = this.drawable.text(120, 130, "Blacks").attr({
                    font: "bold 16px Verdana",
                    fill: this.blacks
                });
                var shiftColours = function (colour) {
                        return function () {
                            this.animate({
                                fill: colour
                            }, 200, "backOut");
                        };
                    };
                var changeSize = this.drawable.text(80, this.gridsize - this.baseOffset - 50, "Change Size").attr({
                    font: "bold 20px Verdana",
                    fill: this.blacks
                }).click((function(obj) {
                    return function() {
                        var newSize = parseInt(prompt("Please provide the new size of the board","8"),10);
                        obj.size = isNaN(newSize) ? 8 : newSize;
                        obj.gridsize = obj.size * obj.cellsize + 2 * obj.baseOffset;
                        (obj.redraw(obj))();
                    };
                })(this)).hover(shiftColours(this.boardColorDark), shiftColours(this.blacks));

                var newGame = this.drawable.text(80, this.gridsize - this.baseOffset, "Restart").attr({
                    font: "bold 32px Verdana",
                    fill: this.blacks
                }).click(this.redraw(this)).hover(shiftColours(this.boardColorDark), shiftColours(this.blacks));

                var topSeparatorOffset = this.baseOffset - 8;
                var topSeparatorPath = "M0 " + topSeparatorOffset + " L" + this.gridsize + " " + topSeparatorOffset;
                var topSeparator = this.drawable.path(topSeparatorPath);

                var bottomSeparatorOffset = this.gridsize - this.baseOffset + (this.size + 2) * 2;
                var bottomSeparatorPath = "M0 " + bottomSeparatorOffset + " L" + this.gridsize + " " + bottomSeparatorOffset;
                var bottomSeparator = this.drawable.path(bottomSeparatorPath);

                for (var i = 0; i < this.size * this.size; ++i) {
                    var column = Math.floor(i / this.size);
                    var row = i % this.size;
                    var xcord = this.baseOffset * 1.75 + row * (this.cellsize + 2);
                    var ycord = this.baseOffset + column * (this.cellsize + 2);
                    var fieldId = this.field(xcord, ycord, row, column);
                    this.fieldList[row * this.size + column] = fieldId;
                }
                this.updateScores();
                this.updateCurrentPlayer();
            };
        };

    var UI = new ReversiUI(8);
    UI.Game.initialise();
    UI.drawBoard();
};