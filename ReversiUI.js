window.onload = function () {
	var ReversiUI = function () {
			"use strict";
			this.boardColor = "#333";
			this.cellBorderColor = "#422faa";
			this.whites = "#E5EEF5";
			this.blacks = "#4F443A";
			this.tokenBorder = "#000";
			this.size = 8;
			this.cellsize = 64;
			this.baseOffset = 100;
			this.gridsize = this.size * this.cellsize + 2 * this.baseOffset;
			this.Game;
			this.drawingObject;
			this.header;
			this.scores = [];
			this.scoreBoard = [
				[],
				[]
			];
			this.fieldList = [];

			this.field = function (xcord, ycord, column, row) {
				var that = this;
				var colour = this.Game.grid.getFieldAt(row, column).color;
				var defined = colour === MY.colorsEnum.empty ? false : true;
				colour = colour === MY.colorsEnum.white ? this.whites : this.blacks;
				var backgroundColour = ((row * this.size +  column) % 2) === row % 2 ? '#B2CBD9' : '#7F8E98';

				var fieldBackground = this.drawingObject.rect(xcord, ycord, this.cellsize, this.cellsize).attr({
					fill: backgroundColour,
					stroke: '#EFDAAD'
				});

				var token = this.drawingObject.circle(xcord + this.cellsize / 2, ycord + this.cellsize / 2, 20).attr({
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
								obj.makeMove(row, column);
							}
						}
					};

				var eventField = this.drawingObject.rect(xcord, ycord, this.cellsize, this.cellsize).attr({
					fill: this.boardColor,
					stroke: this.cellBorderColor,
					opacity: 0
				}).hover(toggleTokenColor(0.4), toggleTokenColor(0), this, this).click(placeToken(this));
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
				tilesDrawables.push(this.drawingObject.getById(this.fieldList[column * this.size + row]));
				tilesDrawables.animate({
					opacity: 1,
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
						var screenEdge = player === 0 ? 40 : 120;
						var fontSize = 32 - index * 3
						var position = 150 + index * 25
						console.log(scoresDisplay[index]);
						if (scoresDisplay[index] !== undefined) {
							scoresDisplay[index].attr({
								text: this.scores[index][player]
							});
						} else {
						scoresDisplay[index] = this.drawingObject.text(screenEdge, position).attr({
							font: "bold " + fontSize + "px Verdana",
							fill: "#4F443A",
							text: this.scores[index][player]
						});
					}
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
					} else if(player.score === winnerScore) {
						winner = MY.colorsEnum.empty;
					}
				});
				this.drawingObject.text(this.gridsize / 2, this.gridsize - 40).attr({
					font: "bold 40px Verdana",
					fill: "#4F443A",
					text: this.getCurrentPlayer(winner.color) + " Win"
				});

			}

			this.translateColor = function (colorEnum) {
				return colorEnum === MY.colorsEnum.white ? this.whites : this.blacks;
			}

			this.getCurrentPlayer = function (color) {
				return color === MY.colorsEnum.white ? "Whites" :  color === MY.colorsEnum.black ? "Blacks" : "Draw";
			}

			this.drawBoard = function () {
				var canvas =  document.getElementById("othello");
				canvas.style.width = this.gridsize + "px";
				canvas.style.margin = "0 auto";
				this.drawingObject = Raphael("othello", this.gridsize, this.gridsize);
				this.header = this.drawingObject.text(this.gridsize / 2 + 0.75 * this.baseOffset, 50).attr({
					font: "bold 40px Verdana",
					fill: "#4F443A",
					text: "Blacks Turn"
				});
				var playerScores = this.drawingObject.text(80, 105, "Scores").attr({
					font: "bold 20px Verdana",
					fill: "#7F8E98"
				});
				var whitePlayerScores = this.drawingObject.text(40, 130, "Whites").attr({
					font: "bold 16px Verdana",
					fill: "#4F443A"
				});
				var blackPlayerScores = this.drawingObject.text(120, 130, "Blacks").attr({
					font: "bold 16px Verdana",
					fill: "#4F443A"
				});
				var path = "M0 " + 92 + " L" + this.gridsize + " " + 92;
				console.log(path);
				var separator = this.drawingObject.path(path);
				var path2 = "M0 " + 635 + " L" + this.gridsize + " " + 635;
				console.log(path2);
				var separator2 = this.drawingObject.path(path2);

				for (var i = 0; i < this.size * this.size; ++i) {
					var column = Math.floor(i / this.size);
					var row = i % this.size;
					var xcord = this.baseOffset * 1.75 + row * (this.cellsize + 2);
					var ycord = this.baseOffset + column * (this.cellsize + 2);
					var fieldId = this.field(xcord, ycord, row, column);
					this.fieldList[row * this.size + column] = fieldId;
				}
				this.updateBoardInfo();
			}
		}

	var UI = new ReversiUI();
	UI.initialise();
	UI.drawBoard();
	/*var othello = document.getElementById("othello");
	othello.parentNode.removeChild(othello);
	var _body = document.getElementsByTagName('body') [0];
	var _div = document.createElement('div');
	_div.setAttribute("id", "othello");
	_body.appendChild(_div);
	UI.initialise();
	UI.drawBoard();*/

}