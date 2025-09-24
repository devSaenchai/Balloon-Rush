document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const startScreen = document.getElementById('start-screen');
  const gameOverScreen = document.getElementById('game-over-screen');
  const startButton = document.getElementById('start-button');
  const restartButton = document.getElementById('restart-button');
  const startHighScoreDisplay = document.getElementById('start-high-score');
  const currentScoreDisplay = document.getElementById('current-score');
  const highestScoreDisplay = document.getElementById('highest-score');
  const finalScoreDisplay = document.getElementById('final-score');
  const gameOverHighScoreDisplay = document.getElementById('game-over-high-score');

  let gameLoop;
  let balloon;
  let obstacles;
  let score;
  let highScore = localStorage.getItem('balloonHighScore') || 0;
  let isPlaying = false;
  let isGameOver = false;

  const GRAVITY = 0.5;
  const JUMP_POWER = -8;
  const OBSTACLE_WIDTH = 50;
  const OBSTACLE_GAP = 150;
  const SCROLL_SPEED = 2;
  const BALLOON_RADIUS = 20;

  function resetGame() {
    balloon = {
      x: 50,
      y: canvas.height / 2,
      radius: BALLOON_RADIUS,
      velocity: 0,
      gravity: GRAVITY,
    };
    obstacles = [];
    score = 0;
    isGameOver = false;
    isPlaying = false;
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    updateHighScoreDisplay();
  }

  function handleTap() {
    if (!isPlaying && !isGameOver) {
      startGame();
    } else if (isPlaying) {
      balloon.velocity = JUMP_POWER;
    } else if (isGameOver) {
      resetGame();
    }
  }

  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', resetGame);
  canvas.addEventListener('touchstart', handleTap);

  function startGame() {
    startScreen.classList.add('hidden');
    isGameOver = false;
    isPlaying = true;
    score = 0;
    currentScoreDisplay.textContent = score;
    highestScoreDisplay.textContent = highScore;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000 / 60);
  }

  function update() {
  if (!isPlaying || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  balloon.velocity += balloon.gravity;
  balloon.y += balloon.velocity;

  if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 200) {
    const gapY = Math.random() * (canvas.height - OBSTACLE_GAP - 100) + 50;
    obstacles.push({
      x: canvas.width,
      gapY: gapY,
      width: OBSTACLE_WIDTH,
      scored: false,
    });
  }

  obstacles.forEach((obstacle, index) => {
    obstacle.x -= SCROLL_SPEED;

    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.gapY - OBSTACLE_GAP / 2);
    ctx.fillRect(obstacle.x, obstacle.gapY + OBSTACLE_GAP / 2, obstacle.width, canvas.height - (obstacle.gapY + OBSTACLE_GAP / 2));

    if (
      balloon.x + balloon.radius > obstacle.x &&
      balloon.x - balloon.radius < obstacle.x + obstacle.width &&
      (balloon.y - balloon.radius < obstacle.gapY - OBSTACLE_GAP / 2 ||
        balloon.y + balloon.radius > obstacle.gapY + OBSTACLE_GAP / 2)
    ) {
      endGame();
    }

    if (balloon.x > obstacle.x + obstacle.width && !obstacle.scored) {
      score++;
      currentScoreDisplay.textContent = score;
      obstacle.scored = true;
    }

    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(index, 1);
    }
  });

  if (balloon.y + balloon.radius > canvas.height || balloon.y - balloon.radius < 0) {
    endGame();
  }

  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(balloon.x, balloon.y, balloon.radius, 0, 2 * Math.PI);
  ctx.fill();
}

function endGame() {
  isPlaying = false;
  isGameOver = true;
  clearInterval(gameLoop);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('balloonHighScore', highScore);
  }
  finalScoreDisplay.textContent = score;
  gameOverHighScoreDisplay.textContent = highScore;
  gameOverScreen.classList.remove('hidden');
}

function updateHighScoreDisplay() {
  startHighScoreDisplay.textContent = highScore;
}

function init() {
  const resizeCanvas = () => {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  resetGame();
}

init();
});
