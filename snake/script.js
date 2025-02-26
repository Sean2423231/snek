const playBoard = document.querySelector('.play-board');
const scoreElement = document.querySelector('.score');
const highScoreElement = document.querySelector('.high-score');

let score = 0;
let gameOver = false;
let appleX, appleY;
let headX = 5, headY = 10;
let velocityX = 0, velocityY = 0;
let body = [];
let setIntervalId;
// Flag to ensure one direction input per cycle
let changingDirection = false;

//high score
//if there is no high score in local storage, set it to 0
let highScore = localStorage.getItem('high-score') || 0;

const changeApplePosition = () => {
    appleX = Math.floor(Math.random() * 30) + 1;
    appleY = Math.floor(Math.random() * 30) + 1;
}

const handleGameOver = () => {
    //clears timer and reloads the page
    clearInterval(setIntervalId);
    alert('Game Over! Press ok to try again');
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
        return handleGameOver();
    }
    headX += velocityX;
    headY += velocityY;

    // Game over if head goes out of bounds
    if (headX <= 0 || headX > 30 || headY <= 0 || headY > 30) {
        gameOver = true;
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
        if(score< 250)
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
            gameOver = true;
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
highScoreElement.innerText = `High Score: ${highScore}`;
changeApplePosition();
setIntervalId = setInterval(initGame, 125);

//event listener for keydown
document.addEventListener('keydown', changeDirection);