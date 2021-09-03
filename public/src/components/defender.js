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
    this.spriteWidth = 1479;
    this.spriteHeight = 1161;
  }

  draw() {
    ctx.fillStyle = "black";
    ctx.font = "15px Rampart One";
    ctx.fillText(Math.floor(this.health), this.x + 17, this.y + 5);
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
  }
  update() {
    if (frame % 10 === 0) {
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = this.minFrame;
      if (this.frameX === 11) this.shootNow = true;
    }
    if (this.shooting) {
      this.minFrame = 11;
      this.maxFrame = 16;
    } else {
      this.minFrame = 0;
      this.maxFrame = 10;
    }

    if (this.shooting && this.shootNow) {
      lasers.push(new Laser(this.x + 70, this.y + 35));
      this.shootNow = false;
    }
  }
}
