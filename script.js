const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const distanceEl = document.getElementById('distance');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// Set canvas dimensions based on common mobile screen aspect ratio
const aspectRatio = 9 / 16;
canvas.height = window.innerHeight * 0.9;
canvas.width = canvas.height * aspectRatio;

// --- GAME VARIABLES ---
let score = 0;
let distance = 0;
let isGameOver = false;
let roadSpeed = 5; // This controls the illusion of player speed

// Lane configuration
const numLanes = 4;
const laneWidth = canvas.width / numLanes;
const lanePositions = Array.from({ length: numLanes }, (_, i) => i * laneWidth);

// Player setup
const player = {
    width: laneWidth * 0.6,
    height: 100,
    lane: 2, // Start in the third lane (0-indexed)
    color: '#0095DD'
};
player.x = lanePositions[player.lane] + (laneWidth - player.width) / 2;
player.y = canvas.height - player.height - 20;

// NPC cars
let npcCars = [];

// Road markings
let roadMarkings = [];

// --- DRAWING FUNCTIONS ---
function drawRoad() {
    ctx.fillStyle = '#333'; // Road color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw lane dividers
    ctx.fillStyle = '#fff';
    for (let i = 1; i < numLanes; i++) {
        for (let y = 0; y < roadMarkings.length; y++) {
            ctx.fillRect(i * laneWidth - 2.5, roadMarkings[y].y, 5, 50);
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawNpcCars() {
    npcCars.forEach(car => {
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, car.y, car.width, car.height);
    });
}

// --- GAME LOGIC & UPDATES ---
function updateRoad() {
    // Animate road markings
    roadMarkings.forEach(mark => {
        mark.y += roadSpeed;
    });

    // Remove markings that are off-screen and add new ones
    if (roadMarkings[0] && roadMarkings[0].y > canvas.height) {
        roadMarkings.shift();
    }
    if (roadMarkings[roadMarkings.length - 1].y > 0) {
        roadMarkings.push({ y: roadMarkings[roadMarkings.length - 1].y - 100 });
    }
}

function spawnNpcCar() {
    const shouldSpawn = Math.random() < 0.03; // Adjust for more/less traffic
    if (shouldSpawn) {
        const lane = Math.floor(Math.random() * numLanes);
        const car = {
            width: player.width,
            height: player.height,
            lane: lane,
            x: lanePositions[lane] + (laneWidth - player.width) / 2,
            y: -player.height, // Start above the screen
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            isOvertaken: false
        };
        // Oncoming traffic (left 2 lanes) moves faster
        car.speed = (lane < 2) ? roadSpeed + 3 : roadSpeed - 2;
        npcCars.push(car);
    }
}

function updateNpcCars() {
    npcCars.forEach((car, index) => {
        car.y += car.speed;

        // Scoring: Car is overtaken
        if (car.lane >= 2 && car.y > player.y && !car.isOvertaken) {
            score++;
            car.isOvertaken = true;
        }

        // Remove cars that are off-screen
        if (car.y > canvas.height) {
            npcCars.splice(index, 1);
        }
    });
}

function checkCollisions() {
    npcCars.forEach(car => {
        if (
            player.lane === car.lane &&
            player.y < car.y + car.height &&
            player.y + player.height > car.y
        ) {
            isGameOver = true;
        }
    });
}

function updateScore() {
    distance += roadSpeed / 1000; // Arbitrary conversion to "km"
    scoreEl.textContent = score;
    distanceEl.textContent = distance.toFixed(2);
}

// --- CONTROLS ---
function movePlayer(direction) {
    if (direction === 'left' && player.lane > 0) { // Only allow movement in the 2 right lanes
        player.lane--;
    } else if (direction === 'right' && player.lane < numLanes - 1) {
        player.lane++;
    }
    // Snap to new lane position
    player.x = lanePositions[player.lane] + (laneWidth - player.width) / 2;
}

// PC Controls
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') movePlayer('left');
    if (e.key === 'ArrowRight') movePlayer('right');
});

// Mobile Controls
let touchStartX = 0;
canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
}, { passive: true });

canvas.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance > 50) { // Swipe right
        movePlayer('right');
    } else if (swipeDistance < -50) { // Swipe left
        movePlayer('left');
    }
}, { passive: true });


// --- GAME LOOP ---
function gameLoop() {
    if (isGameOver) {
        gameOverScreen.classList.remove('hidden');
        finalScoreEl.textContent = score;
        return; // Stop the loop
    }

    updateRoad();
    spawnNpcCar();
    updateNpcCars();
    drawRoad();
    drawPlayer();
    drawNpcCars();
    checkCollisions();
    updateScore();

    requestAnimationFrame(gameLoop);
}

// --- INITIALIZE & RESTART ---
function init() {
    // Reset all game state variables
    score = 0;
    distance = 0;
    isGameOver = false;
    player.lane = 2; // Reset player position
    player.x = lanePositions[player.lane] + (laneWidth - player.width) / 2;
    npcCars = [];
    roadMarkings = [];
    for (let i = 0; i < canvas.height / 50; i++) {
        roadMarkings.push({ y: i * 100 });
    }

    gameOverScreen.classList.add('hidden');
    gameLoop();
}

restartButton.addEventListener('click', init);

// Start the game!
init();
