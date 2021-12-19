// Setup
const screenX = 320;
const screenY = 450;

// Color
const translucent = "rgba(0, 0, 0, 0.3)";

// Statistics
var frame = 0;
var score = 0;
var dead = false;

// Physics
var gravity = 0;

// Bird
const birdSizeX = 32;
const birdSizeY = 32;
var birdPositionX = screenX / 8;
var birdPositionY = screenY / 2;
var birdVelocity = 0;

// Pipe
var pipeAmount = 0;
var pipePositions = [];
var pipeShift = [];
const pipeSizeX = 52;
const pipeSizeY = 450;
var pipeGap = 200;
var pipeGaps = [];

$(() => {
  // When the player jumps
  $("#game").on("click", () => {
    if (!dead) {
      gravity = 0.1;
      birdVelocity = 2;
    } else {
      replay();
    }
  });

  gameStart(true);
});

function gameStart(setupLoop) {
  console.log("Game Start...");
  
  // Create bird
  $("<img/>", {
    id: "bird",
    src: "content/flappy_bird.png"
  }).appendTo("#game");

  setBirdPosition(birdPositionX, birdPositionY);
  
  $("#game").css("background-color", "#0094ca");
  
  createPipe(0);
  createPipe(128);
  createPipe(256);
  
  // Score label
  $("<div/>", {
    id: "score-label"
  }).css({
    "color": "white",
    "margin": "4px",
    "padding": "4px",
    "border-radius": "4px",
    "background-color": translucent
  }).text("Score: 0")
  .appendTo("#game");
  
  // Setup game loop
  if (setupLoop) {
    setInterval(() => {
      if (!dead) {
        frame++;
        gameLoop();
      }
    }, 10);
  }
}

function gameLoop() {
  birdVelocity += -gravity;
  
    if (frame % 1280 == 0) {
      pipeGap -= 20;
    }
    
    score = Math.round(frame / (128 + (pipeSizeX)));
    
    // Update UI
    $("#score-label").text(`Score ${score}`);
    
    movePipes();
    
    // Check pipe collisions
    for (let i = 0; i < pipeAmount; i++) {
      if (pipePositions.length > 0) {
        // Check left
        if (birdPositionX + birdSizeX >= pipePositions[i]) {
          // Check right
          if (birdPositionX <= pipePositions[i] + pipeSizeX) {
            // Top pipe
            if (birdPositionY <= (screenY / 2) - (pipeGaps[i] / 2) - pipeShift[i]) {
              gameEnd();
            } else if (birdPositionY + birdSizeY >= (screenY / 2) + (pipeGaps[i] / 2) + pipeShift[i]) { // Bottom pipe
              gameEnd();
            }
          }
        }
      }
    }
    
    // Cap physics
    birdVelocity = Math.min(Math.max(birdVelocity, -30), 30);
    
    // Check collisions
    if (checkCollision(birdPositionY)) {
      birdPositionY = birdPositionY - birdVelocity;
    } else {
      gameEnd();
    }
    
    setBirdPosition(birdPositionX, birdPositionY);
}

function setTransform(id, positionX, positionY, sizeX, sizeY) {
  $(`#${id}`).css({
    "left": `${positionX}px`,
    "top": `${positionY}px`,
    "width": `${sizeX}px`,
    "height": `${sizeY}px`
  });
}

function setBirdPosition(x, y) {
  setTransform("bird", x, y, birdSizeX, birdSizeY);
}

function checkCollision(y) {
  if (y < 0 - birdSizeY) {
    return false;
  } else if (y > screenY - birdSizeY) {
    return false;
  } else {
  return true;
  }
}

function gameEnd() {
  if (!dead) {
    $("<div/>", {
      id: "game-over-label"
    }).css({
      "color": "red",
      "margin": "4px",
      "padding": "4px",
      "border-radius": "4px",
      "background-color": translucent
    }).text("Game Over );")
    .appendTo("#game");
    
    birdVelocity = 0;
    dead = true;
  }
}

function replay() {
  birdVelocity = 0;
  birdPositionY = screenY / 2;
  setBirdPosition(birdPositionX, birdPositionY);

  $("#game-over-label").remove();
  $("#bird").remove();
  $("#score-label").remove();
  
  // Reset pipes
  for (let i = 0; i < pipeAmount; i++) {
    $(`#pipe-top-${i}`).remove();
    $(`#pipe-bottom-${i}`).remove();
  }
  pipeAmount = 0;
  pipePositions = [];
  pipeShift = [];
  pipeGap = 200;
  pipeGaps = [];
  
  score = 0;
  frame = 0;
  
  gameStart(false);
  
  dead = false;
}

function movePipes() {
  for (let i = 0; i < pipePositions.length; i++) {
    var topId = `pipe-top-${i}`;
    var bottomId = `pipe-bottom-${i}`;
    
    var x = pipePositions[i] - 1;
    
    // Move back onto the screen
    if (x < -(pipeSizeX + 32)) {
      x = screenX + pipeSizeX;
      pipeShift[i] = Math.round(Math.random(-50, 50));
      pipeGaps[i] = pipeGap;
    }
    
    setTransform(topId, x, (screenY / 2) - pipeSizeY - (pipeGaps[i] / 2) + pipeShift[i], pipeSizeX, pipeSizeY);
    setTransform(bottomId, x, (screenY / 2) + (pipeGaps[i] / 2) + pipeShift[i], pipeSizeX, pipeSizeY);
    
    pipePositions[i] = x;
  }
}

// Creates a top and bottom pipe
function createPipe(shiftX) {
  var topId = `pipe-top-${pipeAmount}`;
  var bottomId = `pipe-bottom-${pipeAmount}`;

  // Create top pipe
  $("<img/>", {
    id: topId,
    src: "content/pipe_top.png"
  }).appendTo("#game");

  // Create bottom pipe
  $("<img/>", {
    id: bottomId,
    src: "content/pipe_bottom.png"
  }).appendTo("#game");
  
  var x = screenX - pipeSizeX + shiftX;
  
  var shiftY = Math.round(Math.random(-50, 50));
  
  // Set position
  setTransform(topId, x,(screenY / 2) - pipeSizeY - (pipeGap / 2) - shiftY, pipeSizeX, pipeSizeY);
  setTransform(bottomId, x,(screenY / 2) + (pipeGap / 2) + shiftY, pipeSizeX, pipeSizeY);
  
  pipePositions.push(x);
  pipeShift.push(shiftY);
  pipeGaps.push(pipeGap);
  
  pipeAmount++;
}
