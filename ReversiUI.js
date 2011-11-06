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
			this.scoreBoard = [];
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

				var toggleTokenColor = function (op, field) {
						return function () {

							if (that.Game.currentPlayer.legalMoves.lookup([row, column]) !== undefined) {
								field.attr({
									fill: that.translateColor(that.Game.currentPlayer.color)
								});
								if (!field.data("defined")) {
									field.animate({
										opacity: op
									}, 200, "backOut");
								}
							}
						}
					};

				var placeToken = function (field) {
						return function () {
							if (that.Game.currentPlayer.legalMoves.lookup([row, column]) !== undefined) {
								field.data("defined", true);
								field.attr({
									opacity: 1,
								});
								that.makeMove(row, column);
							}
						}
					};

				var eventField = r.rect(xcord, ycord, this.cellsize, this.cellsize).data("row", row).data("column", column).attr({
					fill: this.boardColor,
					stroke: this.cellBorderColor,
					opacity: 0
				}).hover(toggleTokenColor(1, token), toggleTokenColor(0, token)).click(placeToken(token));
				return token.id;
			};

			this.initialise = function () {
				this.Game = new Game(this.size);
				this.Game.initialise();
			}

			this.makeMove = function (row, column) {
				var that = this;
				if (!this.Game.isGameFinished()) {
					if (!this.Game.pass) {
						this.Game.makeMove(row, column);
						var tilesToChange = this.Game.currentPlayer.legalMoves.lookup([row, column]);
						tilesToChange.forEach(function (coords, index, array) {
							that.drawingObject.getById(that.fieldList[coords[1] * that.size + coords[0]]).attr({
								fill: that.translateColor(that.Game.currentPlayer.color)
							});
						});
					}
					this.Game.changePlayer();
				} else {
					this.printWinner();
				}
				this.updateScore();

			}

			this.updateScore = function () {
				for (var i = this.scores.length; i > 0; --i) {
					this.scores[i] = this.scores[i - 1];
				}
				this.scores[0] = [this.Game.players[0].score, this.Game.players[1].score];
				var whiteScores = "",
					blackScores = "";
				for (var j = 0; j < this.scores.length; ++j) {
					whiteScores += this.scores[j][0] + "\n";
					blackScores += this.scores[j][1] + "\n";
				}
				if (this.scoreBoard[0] !== undefined) {
					this.scoreBoard[0].remove();
				}
				if (this.scoreBoard[1] !== undefined) {
					this.scoreBoard[1].remove();
				}
				var position = 150 + this.scores.length * 9;
				this.scoreBoard[0] = this.drawingObject.text(40, position).attr({
					font: "bold 14px Helvetica",
					fill: "#fa1247",
					text: whiteScores,
					"text-anchor": "end"
				});
				this.scoreBoard[1] = this.drawingObject.text(672, position).attr({
					font: "bold 14px Helvetica",
					fill: "#fa1247",
					text: blackScores,
					"text-anchor": "end"
				});
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
				this.drawingObject.text(356, 662).attr({
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
				this.header = r.text(356, 50).attr({
					font: "bold 40px Helvetica",
					fill: "#9872fa",
					text: "Blacks Turn"
				});
				var whitePlayerScores = r.text(40, 130, "White\n Scores").attr({
					font: "bold 14px Helvetica",
					fill: "#fa1247"
				});
				var blackPlayerScores = r.text(672, 130, "Black\n Scores").attr({
					font: "bold 14px Helvetica",
					fill: "#fa1247"
				});
				for (var i = 0; i < this.size * this.size; ++i) {
					var column = Math.floor(i / 8);
					var row = i % this.size;
					var xcord = this.baseOffset + row * (this.cellsize + 1);
					var ycord = this.baseOffset + column * (this.cellsize + 1);
					var fieldId = this.field(xcord, ycord, row, column, r);
					this.fieldList[row * this.size + column] = fieldId;
				}
				this.updateScore();
			}
		}

	var UI = new ReversiUI();
	UI.initialise();
	UI.drawBoard();
}