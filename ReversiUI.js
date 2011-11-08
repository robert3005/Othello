window.onload = function () {
	var ReversiUI = function () {
			"use strict";
			this.boardColor = "#333";
			this.cellBorderColor = "#422faa";
			this.whites = "#9d9d9d";
			this.blacks = "#222";
			this.tokenBorder = "#000";
			this.size = 8;
			this.cellsize = 64;
			this.baseOffset = 100;
			this.gridsize = this.size * this.cellsize + 2 * this.baseOffset;
			this.Game;
			this.drawingObject = Raphael("othello", this.gridsize, this.gridsize);
			this.header;
			this.scores = [];
			this.scoreBoard = [
				[],
				[]
			];
			this.fieldList = [];

			this.field = function (xcord, ycord, column, row, r) {
				var that = this;
				var colour = this.Game.grid.getFieldAt(row, column).color;
				var defined = colour === MY.colorsEnum.empty ? false : true;
				colour = colour === MY.colorsEnum.white ? this.whites : this.blacks;

				var fieldBackground = r.rect(xcord, ycord, this.cellsize, this.cellsize).attr({
					fill: this.boardColor,
					stroke: this.cellBorderColor
				});

				var token = r.circle(xcord + this.cellsize / 2, ycord + this.cellsize / 2, 20).attr({
					fill: colour,
					stroke: this.tokenBorder,
					opacity: defined ? 1 : 0
				}).data("defined", defined);

				var toggleTokenColor = function (op) {
						return function () {
							if (this.Game.currentPlayer.legalMoves.lookup([row, column]) !== undefined) {
								token.attr({
									fill: this.translateColor(this.Game.currentPlayer.color)
								});
								if (!token.data("defined")) {
									token.animate({
										opacity: op
									}, 200, "backOut");
								}
							}
						}
					};

				var placeToken = function (obj) {
						return function () {
							if (obj.Game.currentPlayer.legalMoves.lookup([row, column]) !== undefined) {
								token.data("defined", true);
								token.attr({
									opacity: 1,
								});
								obj.makeMove(row, column);
							}
						}
					};

				var eventField = r.rect(xcord, ycord, this.cellsize, this.cellsize).attr({
					fill: this.boardColor,
					stroke: this.cellBorderColor,
					opacity: 0
				}).hover(toggleTokenColor(1), toggleTokenColor(0), this, this).click(placeToken(this));
				return token.id;
			};

			this.initialise = function () {
				this.Game = new Game(this.size);
				this.Game.initialise();
			}

			this.makeMove = function (row, column) {
				this.Game.makeMove(row, column);
				var tilesToChange = this.Game.currentPlayer.legalMoves.lookup([row, column]);
				var tilesDrawables = this.drawingObject.set();
				tilesToChange.forEach(function (coords, index, array) {
					tilesDrawables.push(this.drawingObject.getById(this.fieldList[coords[1] * this.size + coords[0]]))
				}, this);
				tilesDrawables.animate({
					fill: this.translateColor(this.Game.currentPlayer.color)
				}, 300, "backOut");
				this.Game.changePlayer();
				this.updateBoardInfo();
				if (this.Game.pass) {
					this.Game.changePlayer();
					this.updateBoardInfo();
				}
				if (this.Game.isGameFinished()) {
					this.printWinner();
				}
			}

			this.updateBoardInfo = function () {
				for (var i = this.scores.length; i > 0; --i) {
					this.scores[i] = this.scores[i - 1];
				}
				this.scores[0] = [this.Game.players[0].score, this.Game.players[1].score];
				var lastScores = this.scores.slice(0, 5);
				lastScores.forEach(function (score, index, scoresArray) {
					this.scoreBoard.forEach(function (scoresDisplay, player, scoreBoardArray) {
						var screenEdge = player === 0 ? 40 : this.gridsize - 40;
						var position = 150 + (index + 1) * 15;
						if (scoresDisplay[index] !== undefined) {
							scoresDisplay[index].remove();
						}
						scoresDisplay[index] = this.drawingObject.text(screenEdge, position).attr({
							font: "bold 14px Helvetica",
							fill: "#fa1247",
							text: this.scores[index][player]
						});
					}, this)
				}, this);
				this.header.attr({
					text: this.getCurrentPlayer(this.Game.currentPlayer.color) + " Turn"
				});
			}

			this.printWinner = function () {
				var winner;
				var winnerScore = 0;
				this.Game.players.forEach(function (player, index, array) {
					if (player.score > winnerScore) {
						winnerScore = player.score;
						winner = player;
					}
				});
				this.drawingObject.text(this.gridsize / 2, this.gridsize - 40).attr({
					font: "bold 40px Helvetica",
					fill: "#9872fa",
					text: this.getCurrentPlayer(winner.color) + " Win"
				});

			}

			this.translateColor = function (colorEnum) {
				return colorEnum === MY.colorsEnum.white ? this.whites : this.blacks;
			}

			this.getCurrentPlayer = function (color) {
				return color === MY.colorsEnum.white ? "Whites" : "Blacks";
			}

			this.drawBoard = function () {
				var r = this.drawingObject;
				this.header = r.text(this.gridsize / 2, 50).attr({
					font: "bold 40px Helvetica",
					fill: "#9872fa",
					text: "Blacks Turn"
				});
				var whitePlayerScores = r.text(40, 130, "White\n Scores").attr({
					font: "bold 16px Helvetica",
					fill: "#fa1247"
				});
				var blackPlayerScores = r.text(this.gridsize - 40, 130, "Black\n Scores").attr({
					font: "bold 16px Helvetica",
					fill: "#fa1247"
				});
				for (var i = 0; i < this.size * this.size; ++i) {
					var column = Math.floor(i / this.size);
					var row = i % this.size;
					var xcord = this.baseOffset + row * (this.cellsize + 1);
					var ycord = this.baseOffset + column * (this.cellsize + 1);
					var fieldId = this.field(xcord, ycord, row, column, r);
					this.fieldList[row * this.size + column] = fieldId;
				}
				this.updateBoardInfo();
			}
		}

	var UI = new ReversiUI();
	UI.initialise();
	UI.drawBoard();
}