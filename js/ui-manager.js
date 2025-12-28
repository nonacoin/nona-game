/* ======================================= */
/* 🎨 فایل مدیریت رابط کاربری (UI Manager)  */
/* ======================================= */
/* این فایل مدیریت نمایش و بروزرسانی رابط کاربری بازی را بر عهده دارد */
/* شامل نمایش وضعیت بازیکنان، دکمه‌ها، نوبت و ... */
/* تاریخ ایجاد: [تاریخ امروز]               */
/* آخرین تغییر: بدون تغییر - انتقال مستقیم */
/* ======================================= */

/* ======================================= */
#### 🔄 بروزرسانی نمایش نوبت               ####
/* ======================================= */

function updateTurnDisplay() {
    const left = document.getElementById('playerBox1');
    const right = document.getElementById('playerBox2');
    
    // از game-state.js باید بازیکن فعلی را بگیریم
    const gameState = window.gameState || { currentPlayer: 1 };
    
    if (gameState.currentPlayer === 1) {
        // پلیر 1 فعال است
        if (left) {
            left.classList.remove('inactive');
            left.classList.add('active-player');
        }
        if (right) {
            right.classList.remove('active-player');
            right.classList.add('inactive');
        }
    } else {
        // پلیر 2 فعال است
        if (right) {
            right.classList.remove('inactive');
            right.classList.add('active-player');
        }
        if (left) {
            left.classList.remove('active-player');
            left.classList.add('inactive');
        }
    }
    
    // بروزرسانی نمایش تایمر
    if (typeof updateTimerDisplay === 'function') {
        updateTimerDisplay();
    }
}

/* ======================================= */
#### 🎮 مدیریت دکمه‌های بازی               ####
/* ======================================= */

// فعال‌سازی دکمه رول
function enableRollButton() {
    const rollBtn = document.getElementById("roll-btn");
    if (rollBtn) {
        rollBtn.disabled = false;
        
        // از game-state.js باید وضعیت بازی را بگیریم
        const gameState = window.gameState || { rollCount: 0, maxRolls: 3 };
        const remainingRolls = gameState.maxRolls - gameState.rollCount;
        
        if (remainingRolls > 0) {
            rollBtn.textContent = `تاس بریز (${remainingRolls})`;
        } else {
            rollBtn.textContent = "۳ بار رول کردید";
            rollBtn.disabled = true;
        }
    }
}

// غیرفعال‌سازی دکمه رول
function disableRollButton() {
    const rollBtn = document.getElementById("roll-btn");
    if (rollBtn) {
        rollBtn.disabled = true;
    }
}

// فعال‌سازی دکمه ثبت
function enablePlayButton() {
    const playBtn = document.getElementById("play-btn");
    if (playBtn) {
        playBtn.disabled = false;
    }
}

// غیرفعال‌سازی دکمه ثبت
function disablePlayButton() {
    const playBtn = document.getElementById("play-btn");
    if (playBtn) {
        playBtn.disabled = true;
    }
}

/* ======================================= */
#### 🎲 نمایش و پنهان‌سازی بخش‌های بازی     ####
/* ======================================= */

// نمایش بخش اصلی بازی
function showGameBoard() {
    const mainBox = document.getElementById('main-box');
    const scoreBoard = document.getElementById('score-board');
    const topWrapper = document.getElementById('top-wrapper');
    
    if (mainBox) mainBox.style.display = 'flex';
    if (scoreBoard) scoreBoard.style.display = 'block';
    if (topWrapper) topWrapper.style.display = 'flex';
}

// پنهان‌سازی بخش اصلی بازی
function hideGameBoard() {
    const mainBox = document.getElementById('main-box');
    const scoreBoard = document.getElementById('score-board');
    const topWrapper = document.getElementById('top-wrapper');
    
    if (mainBox) mainBox.style.display = 'none';
    if (scoreBoard) scoreBoard.style.display = 'none';
    if (topWrapper) topWrapper.style.display = 'none';
}

// نمایش صفحه نتایج
function showResultsScreen() {
    const resultsScreen = document.getElementById('results-screen');
    if (resultsScreen) {
        resultsScreen.style.display = 'block';
    }
}

// پنهان‌سازی صفحه نتایج
function hideResultsScreen() {
    const resultsScreen = document.getElementById('results-screen');
    if (resultsScreen) {
        resultsScreen.style.display = 'none';
    }
}

/* ======================================= */
#### 🏆 نمایش نتایج در صفحه نتایج          ####
/* ======================================= */

function displayResults(results) {
    const resultsColumns = document.getElementById('resultsColumns');
    if (!resultsColumns) return;
    
    resultsColumns.innerHTML = '';
    
    for (let playerNum = 1; playerNum <= 2; playerNum++) {
        const playerKey = `player${playerNum}`;
        const playerData = results[playerKey];
        
        // از game-state.js باید آمار بازی را بگیریم
        const gameStats = window.gameStats || {
            player1: { gamesPlayed: 0, wins: 0, losses: 0 },
            player2: { gamesPlayed: 0, wins: 0, losses: 0 }
        };
        
        const playerStats = gameStats[playerKey];
        
        const playerDiv = document.createElement('div');
        
        // استایل‌دهی بر اساس بازیکن
        playerDiv.style.background = playerNum === 1 
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1))'
            : 'linear-gradient(135deg, rgba(0, 255, 127, 0.15), rgba(0, 204, 102, 0.1))';
        
        playerDiv.style.padding = '12px';
        playerDiv.style.borderRadius = '8px';
        playerDiv.style.marginBottom = '12px';
        playerDiv.style.border = '2px solid ' + (playerNum === 1 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(0, 255, 127, 0.4)');
        
        // اگر برنده است، افکت ویژه
        if (results.winner === playerNum) {
            playerDiv.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.6)';
            playerDiv.style.borderColor = playerNum === 1 ? '#FFD700' : '#00FF7F';
        }
        
        playerDiv.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${playerNum === 1 ? '#FFD700' : '#00FF7F'}">
                ${playerNum === 1 ? '👑' : '⚔️'} بازیکن ${playerNum} ${results.winner === playerNum ? '🏆 برنده!' : ''}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between;">
                <div style="flex: 1; min-width: 120px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 14px;">امتیاز:</span>
                            <span style="font-weight: bold; font-size: 18px;">${playerData.totalScore}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 12px; color: #aaa;">پایه:</span>
                            <span style="font-size: 14px;">${playerData.baseScore}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 12px; color: #aaa;">ویژه:</span>
                            <span style="font-size: 14px; color: #4eff4e;">${playerData.specialBonus}</span>
                        </div>
                    </div>
                </div>
                <div style="flex: 1; min-width: 120px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 12px; color: #aaa;">بازی‌ها:</span>
                            <span style="font-size: 14px;">${playerStats.gamesPlayed}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 12px; color: #aaa;">برد:</span>
                            <span style="font-size: 14px; color: #4eff4e;">${playerStats.wins}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 12px; color: #aaa;">باخت:</span>
                            <span style="font-size: 14px; color: #ff3333;">${playerStats.losses}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        resultsColumns.appendChild(playerDiv);
    }
}

/* ======================================= */
#### 🎯 نمایش پیام‌های سیستم                ####
/* ======================================= */

// نمایش پیام موقت
function showTemporaryMessage(text, type = 'info', duration = 2000) {
    const message = document.createElement('div');
    message.className = 'turn-lost-message';
    
    // تنظیم استایل بر اساس نوع پیام
    switch(type) {
        case 'success':
            message.style.background = 'linear-gradient(135deg, #00cc66, #00994d)';
            break;
        case 'warning':
            message.style.background = 'linear-gradient(135deg, #ffcc00, #ff9900)';
            break;
        case 'error':
            message.style.background = 'linear-gradient(135deg, #ff3333, #cc0000)';
            break;
        default:
            message.style.background = 'linear-gradient(135deg, #6666ff, #3333cc)';
    }
    
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, duration);
}

/* ======================================= */
#### 🔄 مدیریت نوبت (ترکیبی)               ####
/* ======================================= */

function nextTurn() {
    // بازنشانی تاس‌ها برای نوبت جدید
    if (typeof resetDiceForNewTurn === 'function') {
        resetDiceForNewTurn();
    }
    
    // تغییر بازیکن فعلی
    const gameState = window.gameState || { currentPlayer: 1 };
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    
    // بروزرسانی نمایش
    updateTurnDisplay();
    
    // رندر تاس‌ها
    if (typeof renderDice === 'function') {
        renderDice();
    }
    
    // مدیریت دکمه‌ها
    disablePlayButton();
    enableRollButton();
    
    // شروع تایمر جدید (اگر بازی تمام نشده)
    if (!gameState.gameFinished && typeof startTimer === 'function') {
        startTimer();
    }
    
    // بروزرسانی نمایش امتیازات
    if (typeof updateScoreDisplays === 'function') {
        updateScoreDisplays();
    }
}

/* ======================================= */
#### 🏁 پایان بازی                         ####
/* ======================================= */

function endGame() {
    // علامت‌گذاری پایان بازی
    const gameState = window.gameState || {};
    gameState.gameFinished = true;
    
    // توقف تایمر
    if (typeof stopTimer === 'function') {
        stopTimer();
    }
    
    // محاسبه نتایج نهایی
    let finalResults;
    if (typeof calculateFinalScores === 'function') {
        finalResults = calculateFinalScores();
    } else {
        // محاسبه ساده اگر تابع موجود نیست
        finalResults = {
            player1: { totalScore: 0, baseScore: 0, specialBonus: 0, specialCount: 0 },
            player2: { totalScore: 0, baseScore: 0, specialBonus: 0, specialCount: 0 },
            winner: null
        };
    }
    
    // به‌روزرسانی آمار بازی
    if (typeof updateGameStats === 'function') {
        updateGameStats(finalResults);
    }
    
    // نمایش صفحه نتایج
    hideGameBoard();
    showResultsScreen();
    displayResults(finalResults);
}

/* ======================================= */
#### 🔄 بررسی تکمیل بازی                   ####
/* ======================================= */

function checkGameCompletion() {
    // بررسی آیا همه دسته‌ها پر شده‌اند؟
    if (typeof checkAllCategoriesFilled === 'function') {
        const filled = checkAllCategoriesFilled();
        if (filled.all) {
            endGame();
        } else {
            nextTurn();
        }
    } else {
        // اگر تابع موجود نیست، به نوبت بعدی برو
        nextTurn();
    }
}

/* ======================================= */
#### 🔄 بازی مجدد                         ####
/* ======================================= */

function restartGame() {
    // بازنشانی وضعیت بازی
    if (typeof resetGame === 'function') {
        resetGame();
    } else {
        // بازنشانی ساده اگر تابع موجود نیست
        const gameState = window.gameState || {};
        gameState.currentPlayer = 1;
        gameState.rollCount = 0;
        gameState.selectedCategory = null;
        gameState.confirmedCategories = {
            player1: Array(6).fill(null),
            player2: Array(6).fill(null)
        };
        gameState.gameFinished = false;
        gameState.specialBonuses = { player1: 0, player2: 0 };
        
        // بازنشانی تاس‌ها
        if (window.diceData) {
            window.diceData.forEach((dice, index) => {
                dice.locked = false;
                dice.value = Math.floor(Math.random() * 6) + 1;
            });
        }
    }
    
    // پنهان‌سازی صفحه نتایج و نمایش بازی
    hideResultsScreen();
    showGameBoard();
    
    // بروزرسانی نمایش‌ها
    updateTurnDisplay();
    
    // رندر تاس‌ها
    if (typeof renderDice === 'function') {
        renderDice();
    }
    
    // رندر جدول امتیازات
    if (typeof renderScoreBoard === 'function') {
        renderScoreBoard();
    }
    
    // مدیریت دکمه‌ها
    enableRollButton();
    disablePlayButton();
    
    // شروع تایمر
    if (typeof startTimer === 'function') {
        startTimer();
    }
}

/* ======================================= */
#### 🎯 تابع مقداردهی اولیه رابط کاربری    ####
/* ======================================= */

function initUIManager() {
    console.log("🎨 مدیریت رابط کاربری راه‌اندازی شد");
    
    // ثبت event listener برای دکمه بازی مجدد
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            restartGame();
        });
    }
    
    // بروزرسانی اولیه نمایش
    updateTurnDisplay();
    
    // نمایش اولیه دکمه‌ها
    enableRollButton();
    disablePlayButton();
}

/* ======================================= */
#### 📤 صادر کردن توابع و متغیرها          ####
/* ======================================= */

// در صورت نیاز به استفاده در ماژول‌های ES6
// export {
//   updateTurnDisplay,
//   enableRollButton,
//   disableRollButton,
//   enablePlayButton,
//   disablePlayButton,
//   showGameBoard,
//   hideGameBoard,
//   showResultsScreen,
//   hideResultsScreen,
//   displayResults,
//   showTemporaryMessage,
//   nextTurn,
//   endGame,
//   checkGameCompletion,
//   restartGame,
//   initUIManager
// };