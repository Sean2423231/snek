const playBoard = document.querySelector('.play-board');
const scoreElement = document.querySelector('.score');
const highScoreElement = document.querySelector('.high-score');

let score = 0;
let gameOver = false;
let appleX, appleY;
let headX = 5, headY = 10;
let velocityX = 0, velocityY = 0;
let body = [
    [headX, headY],
    [headX - 1, headY],
    [headX - 2, headY]
];
let setIntervalId;
// Flag to ensure one direction input per cycle
let changingDirection = false;

//high score from local storage (or 0 if not set)
let highScore = localStorage.getItem('high-score') || 0;

const changeApplePosition = () => {
    appleX = Math.floor(Math.random() * 30) + 1;
    appleY = Math.floor(Math.random() * 30) + 1;
}

const handleGameOver = () => {
    // clear the interval and display a game over screen
    clearInterval(setIntervalId);
    gameOver = true;
    playBoard.innerHTML = `
        <div class="game-over-screen">
            <h2>Game Over!</h2>
            <p>Score: ${score}</p>
            <p>Press any key to restart</p>
        </div>
    `;
    // Listen for a key press to restart the game (once)
    document.addEventListener('keydown', restartGame, {once: true});
}

const restartGame = () => {
    location.reload();
}

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
}

const initGame = () => {
    if (gameOver) {
        return;
    }
    
    headX += velocityX;
    headY += velocityY;

    // Game over if head goes out of bounds
    if (headX <= 0 || headX > 30 || headY <= 0 || headY > 30) {
        return handleGameOver();
    }
    
    // If the snake eats the apple, change its position.
    // Otherwise, remove the tail segment (to keep the snake size constant).
    if (headX === appleX && headY === appleY) {
        changeApplePosition();
        score++;
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem('high-score', highScore);

        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
        if (score < 250)
            clearInterval(setIntervalId);
        setIntervalId = setInterval(initGame, 125 - score/2);
    } else {
        body.pop();
    }
    
    // Add the new head position at the beginning of the snake body.
    body.unshift([headX, headY]);

    // Check for self-collision.
    for (let i = 1; i < body.length; i++) {
        if (body[0][0] === body[i][0] && body[0][1] === body[i][1]) {
            return handleGameOver();
        }
    }
    
    let htmlMarkup = `<div class="apple" style="grid-area: ${appleY} / ${appleX}"></div>`;
    body.forEach(segment => {
        htmlMarkup += `<div class="head" style="grid-area: ${segment[1]} / ${segment[0]}"></div>`;
    });
    
    playBoard.innerHTML = htmlMarkup;
    
    // Reset the flag at the end of the cycle to allow a new input.
    changingDirection = false;
}

//start of code
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
highScoreElement.innerText = `High Score: ${highScore}`;
changeApplePosition();

// Display the start message "Snek" until a key is pressed
playBoard.innerHTML = `<div class="start-message">Snek</div>`;

// Game remains paused until the first key press.
let gameStarted = false;
document.addEventListener('keydown', (e) => {
    // Start game only on the first key press.
    if (!gameStarted) {
        gameStarted = true;
        // Remove the start message
        const startMessage = document.querySelector('.start-message');
        if (startMessage) {
            startMessage.remove();
        }
        // Set an initial movement
        velocityX = 1;
        velocityY = 0;
        setIntervalId = setInterval(initGame, 125);
    }
    changeDirection(e);
});
