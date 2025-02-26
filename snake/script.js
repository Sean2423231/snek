const playBoard = document.querySelector('.play-board');
const scoreElement = document.querySelector('.score');
const highScoreElement = document.querySelector('.high-score');

let score = 0;
let gameOver = false;
let headX = 5, headY = 10;
let velocityX = 0, velocityY = 0;
let body = [
    [headX, headY],
    [headX - 1, headY],
    [headX - 2, headY]
];

class applePosition {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// Use an array to hold multiple apples.
let apples = [];

// Generate a new apple ensuring its position does not overlap the snake.
const generateApple = () => {
    let newApple;
    do {
        newApple = new applePosition(
            Math.floor(Math.random() * 30) + 1,
            Math.floor(Math.random() * 30) + 1
        );
    } while (body.some(segment => segment[0] === newApple.x && segment[1] === newApple.y));
    apples.push(newApple);
};

 // Initially create one apple (or call generateApple multiple times for more).
generateApple();

let setIntervalId;
// Flag to ensure one direction input per cycle
let changingDirection = false;

// High score stored from local storage (or 0 if not set)
let highScore = localStorage.getItem('high-score') || 0;

// Set the score threshold for apple addition.
let nextAppleThreshold = 15;

const handleGameOver = () => {
    clearInterval(setIntervalId);
    gameOver = true;
    playBoard.innerHTML = `
        <div class="game-over-screen">
            <h2>Game Over!</h2>
            <p>Score: ${score}</p>
            <p>Press any key to restart</p>
        </div>
    `;
    document.addEventListener('keydown', restartGame, {once: true});
};

const restartGame = () => {
    location.reload();
};

const changeDirection = (e) => {
    if (changingDirection) return;
    changingDirection = true;
    
    if (e.key === 'ArrowUp' && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === 'ArrowDown' && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === 'ArrowLeft' && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === 'ArrowRight' && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
};

const checkAppleCollision = () => {
    let collided = false;
    for (let i = 0; i < apples.length; i++) {
        if (headX === apples[i].x && headY === apples[i].y) {
            // Remove the collided apple.
            apples.splice(i, 1);
            collided = true;
            score++;
            highScore = score >= highScore ? score : highScore;
            localStorage.setItem('high-score', highScore);
            scoreElement.innerText = `Score: ${score}`;
            highScoreElement.innerText = `High Score: ${highScore}`;
            // Generate a new apple immediately after collision.
            generateApple();
            break;
        }
    }
    // If no collision occurred, remove the tail (snake is not growing).
    if (!collided) {
        body.pop();
    }
};

const initGame = () => {
    if (gameOver) {
        return;
    }
    
    headX += velocityX;
    headY += velocityY;

    // Game over if head goes out of bounds.
    if (headX <= 0 || headX > 30 || headY <= 0 || headY > 30) {
        return handleGameOver();
    }
    
    checkAppleCollision();
    
    // Add the new head position at the beginning of the snake body.
    body.unshift([headX, headY]);

    // Check for self-collision.
    for (let i = 1; i < body.length; i++) {
        if (body[0][0] === body[i][0] && body[0][1] === body[i][1]) {
            return handleGameOver();
        }
    }
    
    // If score reaches or exceeds the threshold, add an apple and update the threshold.
    if (score >= nextAppleThreshold) {
        generateApple();
        nextAppleThreshold += 15+Math.round(score/2);
    }
    
    // Build the HTML markup: render apples first, then snake segments.
    let htmlMarkup = '';
    apples.forEach(apple => {
        htmlMarkup += `<div class="apple" style="grid-area: ${apple.y} / ${apple.x}"></div>`;
    });
    body.forEach(segment => {
        htmlMarkup += `<div class="head" style="grid-area: ${segment[1]} / ${segment[0]}"></div>`;
    });
    
    playBoard.innerHTML = htmlMarkup;
    
    // Reset the flag at the end of the cycle to allow a new input.
    changingDirection = false;
};

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
highScoreElement.innerText = `High Score: ${highScore}`;

// Initially display the start message "Snek" until a key is pressed.
playBoard.innerHTML = `<div class="start-message">Snek</div>`;

let gameStarted = false;
document.addEventListener('keydown', (e) => {
    if (!gameStarted) {
        gameStarted = true;
        // Remove the start message.
        const startMessage = document.querySelector('.start-message');
        if (startMessage) {
            startMessage.remove();
        }
        // Set an initial movement.
        velocityX = 1;
        velocityY = 0;
        setIntervalId = setInterval(initGame, 125);
    }
    changeDirection(e);
});
