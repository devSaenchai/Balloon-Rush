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
    
    // Game variables
    let gameLoop;
    let balloon;
    let obstacles;
    let score;
    let highScore = localStorage.getItem('balloonHighScore') || 0;
    let isPlaying = false;
    let isGameOver = false;

    // Image assets (replace with your own paths)
    const balloonImg = new Image();
    balloonImg.src = 'assets/balloon.png'; // Make sure you have a balloon.png in your assets folder
    const obstacleImgTop = new Image();
    obstacleImgTop.src = 'assets/obstacle_top.png'; // Example image for top obstacle
    const obstacleImgBottom = new Image();
    obstacleImgBottom.src = 'assets/obstacle_bottom.png'; // Example image for bottom obstacle

    // Game constants
    const GRAVITY = 0.5;
    const JUMP_POWER = -8;
    const OBSTACLE_WIDTH = 50;
    const OBSTACLE_GAP = 150;
    const SCROLL_SPEED = 2;
    const BALLOON_SIZE = 40;

    // Game state
    function resetGame() {
        balloon = {
            x: 50,
            y: canvas.height / 2,
            width: BALLOON_SIZE,
            height: BALLOON_SIZE,
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

    // Touch controls for mobile
    function handleTap() {
        if (!isPlaying && !isGameOver) {
            startGame();
        } else if (isPlaying) {
            balloon.velocity = JUMP_POWER;
        } else if (isGameOver) {
            resetGame();
        }
    }

    // Event listeners for game controls and screens
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', resetGame);
    canvas.addEventListener('touchstart', handleTap);

    // Main game logic
    function startGame() {
        startScreen.classList.add('hidden');
        isGameOver = false;
        isPlaying = true;
        
        // Initial setup
        score = 0;
        currentScoreDisplay.textContent = score;
        highestScoreDisplay.textContent = highScore;

        // Start game loop
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(update, 1000 / 60);
    }

    function update() {
        if (!isPlaying || isGameOver) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update balloon
        balloon.velocity += balloon.gravity;
        balloon.y += balloon.velocity;

        // Spawn new obstacles
        if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 200) {
            const gapY = Math.random() * (canvas.height - OBSTACLE_GAP - 100) + 50;
            obstacles.push({
                x: canvas.width,
                gapY: gapY,
                width: OBSTACLE_WIDTH,
                scored: false,
            });
        }

        // Update and draw obstacles
        obstacles.forEach((obstacle, index) => {
            obstacle.x -= SCROLL_SPEED;
            
            // Draw top obstacle
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.gapY - OBSTACLE_GAP / 2);
            // Draw bottom obstacle
            ctx.fillRect(obstacle.x, obstacle.gapY + OBSTACLE_GAP / 2, obstacle.width, canvas.height - (obstacle.gapY + OBSTACLE_GAP / 2));

            // Check collision with obstacles
            if (
                balloon.x + balloon.width > obstacle.x && 
                balloon.x < obstacle.x + obstacle.width && (
                    balloon.y < obstacle.gapY - OBSTACLE_GAP / 2 || 
                    balloon.y + balloon.height > obstacle.gapY + OBSTACLE_GAP / 2
                )
            ) {
                endGame();
            }

            // Score point
            if (balloon.x > obstacle.x + obstacle.width && !obstacle.scored) {
                score++;
                currentScoreDisplay.textContent = score;
                obstacle.scored = true;
            }

            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(index, 1);
            }
        });
        
        // Check collision with ground/sky
        if (balloon.y + balloon.height > canvas.height || balloon.y < 0) {
            endGame();
        }

        // Draw balloon
        ctx.fillStyle = 'red';
        ctx.fillRect(balloon.x, balloon.y, balloon.width, balloon.height);
    }

    function endGame() {
        isPlaying = false;
        isGameOver = true;
        clearInterval(gameLoop);

        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('balloonHighScore', highScore);
        }

        // Show game over screen
        finalScoreDisplay.textContent = score;
        gameOverHighScoreDisplay.textContent = highScore;
        gameOverScreen.classList.remove('hidden');
    }

    function updateHighScoreDisplay() {
        startHighScoreDisplay.textContent = highScore;
    }

    // Initialize game
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

