const cellSize = 70;
const cellGap = 3;
const gameGrid = [];

const gameBoard = {
    cellSize: 70,
    cellGap = 3,
    gameGrid = []
}

//game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
  };
  
  class Cell {
    constructor(x, y) {
      (this.x = x),
        (this.y = y),
        (this.width = cellSize),
        (this.height = cellSize);
    }
    draw() {
        (ctx.strokeStyle = "black"),
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
  
  function createGrid() {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
      for (let x = 0; x < canvas.width; x += cellSize) {
        gameGrid.push(new Cell(x, y));
      }
    }
  }
  createGrid();


  function hanleGameGrid() {
    for (let i = 0; i < gameGrid.length; i++) {
      gameGrid[i].draw();
    }
  }