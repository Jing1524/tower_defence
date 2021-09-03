const log = (text) => {
  const parent = document.querySelector("#events");
  const el = document.createElement("li");
  el.innerHTML = text;

  parent.appendChild(el);
  parent.scrollTop = parent.scrollHeight;
};

const onChatSubmitted = (sock) => (e) => {
  e.preventDefault();

  const input = document.querySelector("#chat");
  const text = input.value;
  input.value = "";

  sock.emit("message", text);
};

//========================== canvas ==========================
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 980;
canvas.height = 700;

//========================== global varibales ==========================
const cellSize = 70;
const cellGap = 3;
let resourcesAmount = 300;
let enemiesInterval = 600;
let gameSpeed = 1;
let frame = 0;
let gameOver = false;
let levelComplete = false;
let score = 0;
const winningScore = 100;
let chosenDefender = 1;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPosition = [];
const lasers = [];
const resources = [];

//========================== mouse ==========================
const mouse = {
  x: 10,
  y: 10,
  width: 0.1,
  height: 0.1,
  clicked: false,
};

canvas.addEventListener("mousedown", function () {
  mouse.clicked = true;
});
canvas.addEventListener("mouseup", function () {
  mouse.clicked = false;
});
let canvasPosition = canvas.getBoundingClientRect();
// console.log(canvasPosition);
canvas.addEventListener("mousemove", function (e) {
  mouse.x = e.x - canvasPosition.left;
  mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

//========================== game board ==========================
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
    if (mouse.x && mouse.y && collision(this, mouse)) {
      (ctx.strokeStyle = "green"),
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
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

//========================== lasers ==========================
const emmo = new Image();
emmo.src = "/src/image/emmo.png";

class Laser {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 5;
    this.power = 20;
    this.speed = 5;
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 3;
    this.spriteWidth = 64;
    this.spriteHeight = 64;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(
      emmo,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

const pewPew = document.createElement("audio");
pewPew.src = "/src/sound/pewpew_15.wav";

function handleLasers() {
  for (let i = 0; i < lasers.length; i++) {
    lasers[i].update();
    lasers[i].draw();
    for (let j = 0; j < enemies.length; j++) {
      if (enemies[j] && lasers[i] && collision(lasers[i], enemies[j])) {
        enemies[j].health -= lasers[i].power;
        lasers.splice(i, 1);
        pewPew.play();
        i--;
      }
    }
    if (lasers[i] && lasers[i].x > canvas.width - cellSize) {
      lasers.splice(i, 1);
      i--;
    }
  }
}
//========================== defenders ==========================
const defender1 = new Image();
defender1.src = "/src/image/superCat.png";
const defender2 = new Image();
defender2.src = "/src/image/defender2.png";

class Defender {
  constructor(x, y) {
    this.defenderProps(x, y);
  }
  defenderProps(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    this.health = 100;
    this.shooting = false;
    this.shootNow = false;
    this.lasers = [];
    this.timer = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 16;
    if (defender1) {
      this.spriteWidth = 1479;
      this.spriteHeight = 1161;
    } else if (defender2) {
      this.spriteWidth = 1138;
      this.spriteHeight = 794;
    }

    this.chosenDefender = chosenDefender;
  }

  draw() {
    ctx.fillStyle = "black";
    ctx.font = "15px Rampart One";
    ctx.fillText(Math.floor(this.health), this.x + 17, this.y + 5);
    if (this.chosenDefender === 1) {
      ctx.drawImage(
        defender1,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else if (this.chosenDefender === 2) {
      ctx.drawImage(
        defender2,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  update() {
    if (frame % 10 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
      if (this.frameX === 11) this.shootNow = true;
    }

    if (this.chosenDefender === 1) {
      if (this.shooting) {
        this.minFrame = 11;
        this.maxFrame = 16;
      } else {
        this.minFrame = 0;
        this.maxFrame = 10;
      }
    } else if (this.chosenDefender === 2) {
      if (this.shooting) {
        this.minFrame = 20;
        this.maxFrame = 21;
      } else {
        this.minFrame = 0;
        this.maxFrame = 10;
      }
    }

    if (this.shooting && this.shootNow) {
      lasers.push(new Laser(this.x + 70, this.y + 35));
      this.shootNow = false;
    }
  }
}

function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].draw();
    defenders[i].update();
    if (enemyPosition.indexOf(defenders[i].y) !== -1) {
      defenders[i].shooting = true;
    } else {
      defenders[i].shooting = false;
    }

    for (let j = 0; j < enemies.length; j++) {
      if (defenders[i] && collision(defenders[i], enemies[j])) {
        enemies[j].movement = 0;
        defenders[i].health -= 0.5;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed; // enemies movement returns to original
      }
    }
  }
}

const card1 = { x: 450, y: 3, width: 50, height: 65 };
const card2 = { x: 510, y: 3, width: 50, height: 65 };

function choseDefender() {
  let card1Stroke = "black";
  let card2Stroke = "black";
  if (collision(mouse, card1) && mouse.clicked) {
    chosenDefender = 1;
  } else if (collision(mouse, card2)) {
    chosenDefender = 2;
  }
  if (chosenDefender === 1) {
    card1Stroke = "gold";
    card2Stroke = "black";
  } else if (chosenDefender === 2) {
    card1Stroke = "black";
    card2Stroke = "gold";
  } else {
    card1Stroke = "black";
    card2Stroke = "black";
  }

  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
  ctx.strokeStyle = card1Stroke;
  ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
  ctx.drawImage(defender1, 0, 0, 1479, 1161, 435, 1, 1479 / 17, 1161 / 17);

  ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
  ctx.strokeStyle = card2Stroke;
  ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
  ctx.drawImage(defender2, 0, 0, 1138, 794, 503, 10, 1138 / 17, 794 / 15);
}

//==================== Floating Messages ====================
const floatingMessages = [];

class FloatingMessages {
  constructor(value, x, y, size, color) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.size = size;
    this.lifeSpan = 0;
    this.opacity = 1;
  }
  update() {
    this.y -= 0.3;
    this.lifeSpan += 1;
    if (this.opacity > 0.03) this.opacity -= 0.03;
  }
  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.font = this.size / 2 + "Rampart One";
    ctx.fillText(this.value, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}
function handleFloatingMessages() {
  for (let i = 0; i < floatingMessages.length; i++) {
    floatingMessages[i].update();
    floatingMessages[i].draw();
    if (floatingMessages[i].lifeSpan >= 50) {
      floatingMessages.splice(i, 1);
      i--;
    }
  }
}
//==================== enemies ====================
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = "/src/image/furryMonster.png";
enemyTypes.push(enemy1);

const enemy2 = new Image();
enemy2.src = "/src/image/greenMonster.png";
enemyTypes.push(enemy2);

class Enemy {
  constructor(verticalPosition) {
    this.newMethod(verticalPosition);
  }
  newMethod(verticalPosition) {
    this.x = canvas.width;
    this.y = verticalPosition;
    this.width = cellSize - cellGap * 2;
    this.height = cellSize - cellGap * 2;
    this.speed = Math.random() * 0.2 + 0.4;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
    this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    if (this.enemyType === enemyTypes[0]) {
      this.maxFrame = 10;
      this.spriteWidth = 654;
      this.spriteHeight = 534;
    } else if (this.enemyType === enemyTypes[1]) {
      this.maxFrame = 20;
      this.spriteWidth = 451;
      this.spriteHeight = 508;
    }
  }

  update() {
    this.x -= this.movement; //from left
    if (frame % 10 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
    }
  }
  draw() {
    // ctx.fillStyle = "red";
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "Black";
    ctx.font = "15px Rampart One";
    ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 5);

    ctx.drawImage(
      this.enemyType, //img,
      this.frameX * this.spriteWidth, //sourceX,
      0, //sourceY,
      this.spriteWidth, //sourceW,
      this.spriteHeight, //sourceH,
      this.x, //desinationX,
      this.y, //desinationY,
      this.width, //   desinationW,
      this.height //   desinationH
    );
  }
}

function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    singleEnemie(i);
    if (enemies[i].health <= 0) {
      let gainedResources = enemies[i].maxHealth / 10;
      floatingMessages.push(
        new FloatingMessages(
          "+" + gainedResources,
          enemies[i].x,
          enemies[i].y,
          5,
          "black"
        )
      );
      floatingMessages.push(
        new FloatingMessages("+" + gainedResources, 250, 50, 5, "black")
      );
      resourcesAmount += gainedResources;
      score += gainedResources;
      const findIdx = enemyPosition.indexOf(enemies[i].y);
      enemyPosition.splice(findIdx, 1);
      enemies.splice(i, 1);
      i--;
    }
  }
  if (frame % enemiesInterval === 0 && score < winningScore) {
    let verticalPosition =
      Math.floor(Math.random() * 8 + 1) * cellSize + cellGap;
    enemies.push(new Enemy(verticalPosition));
    enemyPosition.push(verticalPosition);
    if (enemiesInterval > 120) enemiesInterval -= 50;
  }

  function singleEnemie(i) {
    enemies[i].update();
    enemies[i].draw();
    if (enemies[i].x < 0) {
      gameOver = true;
    }
  }
}
//==================== resources ====================
const crystal = new Image();
crystal.src = "/src/image/bonus.png";

const amounts = [20, 30, 40];
class BonusResource {
  constructor() {
    this.forBonusResource();
  }
  forBonusResource() {
    this.x = Math.random() * (canvas.width - cellSize);
    this.y = (Math.floor(Math.random() * 8) + 1) * cellSize;
    this.width = cellSize * 0.6;
    this.height = cellSize * 0.6;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    this.frameX = 0;
    this.frameY = 0;
    this.minFrame = 0;
    this.maxFrame = 7;
    this.spriteWidth = 128;
    this.spriteHeight = 128;
  }

  draw() {
    ctx.fillStyle = "black";
    ctx.font = "15px Rampart One";
    ctx.fillText(this.amount, this.x, this.y);
    ctx.drawImage(
      crystal,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
function handleResources() {
  if (frame % 500 === 0 && score < winningScore) {
    resources.push(new BonusResource());
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].draw();
    if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
      resourcesAmount += resources[i].amount;
      floatingMessages.push(
        new FloatingMessages(
          "+" + resources[i].amount,
          resources[i].x,
          resources[i].y,
          5,
          "black"
        )
      );

      floatingMessages.push(
        new FloatingMessages("+" + resources[i].amount, 200, 50, 5, "black")
      );

      resources.splice(i, 1);
      i--;
    }
  }
}
//==================== utilities ====================

function handleGameStatus() {
  ctx.fillStyle = "black";
  ctx.font = "30px Rampart One";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Resources: " + resourcesAmount, 20, 60);
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "60px Rampart One";
    ctx.fillText("GAME OVER", 330, 350);
  }
  if (score >= winningScore && enemies.length === 0) {
    ctx.fillStyle = "black";
    ctx.font = "60px Rampart One";
    ctx.fillText("LEVEL COMPLETE", 250, 350);
    ctx.font = "30px Rampart One";
    ctx.fillText("YOU WIN!!", 440, 400);
  }
}

canvas.addEventListener("click", function () {
  //set grid position to have mouse snap to the grid
  const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
  const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
  if (gridPositionY < cellSize) return;
  for (let i = 0; i < defenders.length; i++) {
    if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY)
      return;
  }

  let defenderCost = 100;
  if (resourcesAmount >= defenderCost) {
    defenders.push(new Defender(gridPositionX, gridPositionY));
    resourcesAmount -= defenderCost;
  } else {
    floatingMessages.push(
      new FloatingMessages("need more recources", mouse.x, mouse.y, 2, "blue")
    );
  }
});

const background = new Image();
background.src = "/src/image/cloud.png";

const BG = {
  x1: 0,
  x2: canvas.width,
  y: 0,
  width: canvas.width,
  height: canvas.height / 2,
};

function handleBackground() {
  BG.x1 -= gameSpeed;
  if (BG.x1 < -BG.width) BG.x1 = BG.width;
  BG.x2 -= gameSpeed;
  if (BG.x2 < -BG.width) BG.x2 = BG.width;
  ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
  ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
}

function animate() {
  animateRender();
  handleBackground();
  hanleGameGrid();
  handleDefenders();
  handleResources();
  handleLasers();
  handleEnemies();
  choseDefender();
  handleGameStatus();
  handleFloatingMessages();
  //   ctx.fillText("Resources: " + resources, 20, 45);
  frame++;

  if (!gameOver) requestAnimationFrame(animate);

  function animateRender() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#F0E5CF";
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
  }
}
animate();

// ==================== collision ===========================
function collision(first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
}

// ==================== resize ===========================

window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});
