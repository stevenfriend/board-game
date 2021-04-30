'use strict'

const board = document.getElementById('board');
const canvas = document.getElementById('canvas');
const deletebutton = document.getElementById('delete-btn');
const addbutton = document.getElementById('add-btn');
const dicebutton = document.getElementById('dice-btn');
const dice = document.getElementById('dice');
const number = document.getElementById('number');
const time = { roll: 0, background: 0 };
const mouse = { down: false };
const maxPlayers = 8;
const colors = [
  `rgba(255, 0, 0, .9)`,
  `rgba(0, 153, 0, .9)`,
  `rgba(0, 51, 255, .9)`,
  `rgba(255, 153, 0, .9)`,
  `rgba(102, 0, 204, .9)`,
  `rgba(240, 240, 0, .9)`,
  `rgba(255, 153, 255, .9)`,
  `rgba(102, 0, 0, .9)`
]
const counters = [];
let state = 'idle';
let color = random(1, 7);

window.addEventListener('resize', () => {
  resizeCounters();
  resizeCanvas();
});
window.addEventListener('scroll', resizeCanvas);
deletebutton.addEventListener('click', deletePlayer);
addbutton.addEventListener('click', addPlayer);
dicebutton.addEventListener('click', changeState);
dice.addEventListener('click', changeState);
canvas.addEventListener('mousemove', (event) => {
  mouse.x = event.offsetX;
  mouse.y = event.offsetY;
});
canvas.addEventListener('mousedown', () => {
  mouse.down = true;
  mouse.click = true;
});
canvas.addEventListener('mouseup', () => {
  mouse.down = false;
});
resizeCanvas();
main();

function main() {
  update();
  draw();
  requestAnimationFrame(main);
}

function update() {
  for (const counter of counters) {
    const dx = mouse.x - counter.x;
    const dy = mouse.y - counter.y;
    const r = Math.hypot(dx, dy);
    if (r < counter.radius) counter.over = true;
    else counter.over = false;
    if (counter.over && mouse.click) {
      counter.drag = true;
      counter.dx = dx;
      counter.dy = dy;
    }
    if (counter.drag && mouse.down) {
      counter.x = mouse.x - counter.dx;
      counter.y = mouse.y - counter.dy;
    } else {
      counter.drag = false;
    }
  }
  mouse.click = false;
}

function draw() {
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const counter of counters) {
      ctx.beginPath();
      ctx.arc(counter.x, counter.y, counter.radius, 0, 2 * Math.PI);
      ctx.fillStyle = counter.color;
      ctx.fill();
    }
  }
}

function resizeCounters() {
  const dimensions = board.getBoundingClientRect();
  for (const counter of counters) {
    counter.resize(canvas.width, canvas.height, dimensions.width, dimensions.height)
  }
}

function resizeCanvas() {
  const dimensions = board.getBoundingClientRect();
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  canvas.style.left = `${dimensions.left}px`;
}

function addPlayer() {
  if (counters.length < maxPlayers) {
    const r = canvas.height/30;
    const x = canvas.height/16 + ( 2.2 * r * counters.length );
    const counter = new Counter(r, x, canvas.height/20, colors[counters.length]);
    counters.push(counter);
    if (counters.length === 1) {
      deletebutton.className = 'player-btn delete-player';
    } else if ( counters.length === maxPlayers) {
      addbutton.className = 'player-btn disabled-btn';
    }
  }
}

function deletePlayer() {
  counters.pop();
  if (counters.length === 0) {
    deletebutton.className = 'player-btn disabled-btn';
  } else if ( counters.length < maxPlayers) {
    addbutton.className = 'player-btn add-player';
  }
}

function changeState() {
  if (state == 'idle') {
    reroll();
    pickColor();
    dice.style.transform = `translate(-50%, -50%)`;
    dice.style.opacity = 1;
    state = 'rolling'
    window.requestAnimationFrame(roll);
  } else if (state == 'rolling') {
    state = 'stop';
  } else {
    dice.style.transform = `translate(-50%, 100%)`;
    dice.style.opacity = 0;
    state = 'idle';
  }
}

function roll(now) {
  checkTime(now);
  if(state == 'rolling') {
    if (time.roll > 100) {
      reroll();
      time.roll = 0;
    }
    if (time.background > 600) {
      pickColor();
      time.background = 0;
    }
    window.requestAnimationFrame(roll);
  }  
}

function checkTime(now) {
  if (time.before !== undefined) {
    time.roll += now - time.before;
    time.background += now - time.before;
  }
  time.before = now;
}

function reroll() {
  const roll = random(1, 6);
  if (number.innerHTML == roll) reroll();
  else number.innerHTML = roll;
}

function random(min, max) {
  return Math.floor((Math.random() * ((max+1) - min)) + min);
}

function pickColor() {
  let newColor = random(0, 6);
  if (newColor == color) pickColor();
  else {
    dice.style.background = colors[newColor];
    color = newColor;
  }
}

class Counter {
  constructor(radius, x, y, color) {
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.color = color;
  }

  update(x, y) {
    const dx = x - counter.x;
    const dy = y - counter.y;
    return Math.hypot(dx, dy);
  }

  resize(oldWidth, oldHeight, newWidth, newHeight) {
    this.radius = newHeight/30; 
    this.x *= (newWidth/oldWidth); 
    this.y *= (newHeight/oldHeight); 
  }
}