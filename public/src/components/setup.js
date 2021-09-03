const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 980;
canvas.height = 700;

const canvas = document.getElementById("canvas2");
const ctx = canvas.getContext("2d");
canvas2.width = 980;
canvas2.height = 700;

const canvas = document.getElementById("canvas3");
const ctx = canvas.getContext("2d");
canvas3.width = 980;
canvas3.height = 700;

const canvas = document.getElementById("canvas4");
const ctx = canvas.getContext("2d");
canvas4.width = 980;
canvas4.height = 700;

//========================== global varibales ==========================
const cellSize = 70;
const cellGap = 3;
let resourcesAmount = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 100;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPosition = [];
const lasers = [];
const resources = [];
