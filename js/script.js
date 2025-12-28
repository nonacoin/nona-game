/* ======================================= */
/* 🎮 فایل اصلی بازی - هماهنگ‌کننده کلی    */
/* ======================================= */

// 📦 ایمپورت ماژول‌های دیگر
import { gameState, resetGameState } from './game-state.js';
import { diceData, renderDice, rollSingleDice } from './dice-3d.js';
import { startTimer, clearTimer, updateTimerDisplay } from './timer.js';
import { renderScoreBoard, updateScoreDisplays, showResultsScreen } from './score-board.js';
import { callServer, loadGameFromServer, disablePlayerControls } from './server-api.js';

// 🎯 اتصال به المان‌های DOM
const rollBtn = document.getElementById("roll-btn");
const playBtn = document.getElementById("play-btn");
const restartBtn = document.getElementById("restart-btn");
const resultsScreen = document.getElementById('results-screen');
const mainBox = document.getElementById('main-box');
const scoreBoard = document.getElementById('score-board');
const topWrapper = document.getElementById('top-wrapper');

// 🔊 اتصال به المان‌های صدا
const diceSound = document.getElementById('diceSound');
const lockSound = document.getElementById('lockSound');
const selectSound = document.getElementById('selectSound');
const confirmSound = document.getElementById('confirmSound');
const timeoutSound = document.getElementById('timeoutSound');
const warningSound = document.getElementById('warningSound');
const tickSound = document.getElementById('tickSound');

// 🎲 تنظیمات صداها
[diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound].forEach(sound => {
    sound.volume = 0.7;
    sound.preload = 'auto';
});

// 🔄 وضعیت چرخش تاس
let isRolling = false;

/* ======================================= */
/* 🎲 توابع کمکی تاس                       */
/* ======================================= */

/**
 * تابع تولید عدد تصادفی بین 1 تا 6
 * @returns {number} عدد تصادفی 1 تا 6
 */
function rand1to6() { 
    return Math.floor(Math.random() * 6) + 1; 
}

/**
 * محاسبه امتیازات بالقوه بر اساس تاس‌های فعلی
 * @returns {Array} آرایه 6 عنصری از امتیازات
 */
function calculatePotentialScores() {
    const scores = Array(6).fill(0);
    for (let category = 1; category <= 6; category++) {
        scores[category-1] = diceData
            .filter(dice => dice.value === category)
            .reduce((sum, dice) => sum + dice.value, 0);
    }
    return scores;
}

/* ======================================= */
/* 🎮 مدیریت چرخش تاس (دکمه رول)            */
/* ======================================= */

/**
 * مدیریت کلیک روی دکمه "تاس بریز"
 */
rollBtn.addEventListener("click", async () => {
    if (isRolling) return;
    if (gameState.rollCount >= gameState.maxRolls) return;
    if (gameState.gameFinished) return;

    isRolling = true;
    rollBtn.disabled = true;
    
    // پاک کردن انتخاب قبلی
    gameState.selectedCategory = null;
    document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
        r.classList.remove('selected');
    });
    playBtn.disabled = true;

    // پیدا کردن تاس‌های قفل نشده
    const unlockedIndices = diceData
        .map((d, idx) => !d.locked ? idx : -1)
        .filter(idx => idx !== -1);

    // چرخاندن تاس‌ها
    if (unlockedIndices.length > 0) {
        const promises = unlockedIndices.map(idx => rollSingleDice(idx));
        await Promise.all(promises);
    }

    gameState.rollCount++;
    renderDice();
    updateScoreDisplays();

    // به‌روزرسانی دکمه رول
    if (gameState.rollCount >= gameState.maxRolls) {
        rollBtn.disabled = true;
        rollBtn.textContent = "۳ بار رول کردید";
    } else {
        rollBtn.disabled = false;
        rollBtn.textContent = `تاس بریز (${3 - gameState.rollCount})`;
    }

    isRolling = false;
});

/* ======================================= */
/* 📝 ثبت امتیاز (دکمه پلی)                */
/* ======================================= */

/**
 * مدیریت کلیک روی دکمه "ثبت کن"
 */
playBtn.addEventListener("click", function() {
    if (!gameState.selectedCategory) return;
    if (gameState.gameFinished) return;

    const { player, rowIndex } = gameState.selectedCategory;
    const playerKey = `player${player}`;
    const potentialScores = calculatePotentialScores();
    const score = potentialScores[rowIndex];

    // ثبت امتیاز
    gameState.confirmedCategories[playerKey][rowIndex] = score;
    
    // انیمیشن تأیید
    const selectedRow = document.querySelector('#score-board .score-row.selected');
    if (selectedRow) {
        const valueBox = selectedRow.querySelector(`.value-box[data-player="${player}"]`);
        if (valueBox) {
            valueBox.style.animation = 'scorePop 0.5s';
            setTimeout(() => valueBox.style.animation = '', 500);
        }
    }
    
    // پخش صدا
    confirmSound.currentTime = 0;
    confirmSound.play();
    
    // پاک کردن انتخاب
    gameState.selectedCategory = null;
    document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
        r.classList.remove('selected');
    });
    
    this.disabled = true;
    
    // بررسی پایان بازی
    checkSpecialBonus();
    checkGameCompletion();
});

/* ======================================= */
/* 🔄 مدیریت نوبت‌ها و تغییر بازیکن         */
/* ======================================= */

/**
 * ریست تاس‌ها برای شروع نوبت جدید
 */
function resetDiceForNewTurn() {
    diceData.forEach(d => d.locked = false);
    diceData = [
        { id: 0, locked: false, value: rand1to6() },
        { id: 1, locked: false, value: rand1to6() },
        { id: 2, locked: false, value: rand1to6() },
        { id: 3, locked: false, value: rand1to6() },
        { id: 4, locked: false, value: rand1to6() }
    ];
    gameState.rollCount = 0;
    gameState.selectedCategory = null;
}

/**
 * تغییر نوبت به بازیکن بعدی
 */
function nextTurn() {
    resetDiceForNewTurn();
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updateTurnDisplay();
    renderDice();
    playBtn.disabled = true;
    rollBtn.disabled = false;
    rollBtn.textContent = "تاس بریز";
    if (!gameState.gameFinished) startTimer();
    updateScoreDisplays();
}

/**
 * بررسی جوایز ویژه (پنج تاس یکسان)
 */
function checkSpecialBonus() {
    const values = diceData.map(d => d.value);
    const counts = {};
    values.forEach(v => counts[v] = (counts[v] || 0) + 1);
    
    for (const v in counts) {
        if (counts[v] === 5) {
            const key = `player${gameState.currentPlayer}`;
            gameState.specialBonuses[key]++;
            break;
        }
    }
}

/**
 * بررسی پایان بازی
 */
function checkGameCompletion() {
    const p1filled = gameState.confirmedCategories.player1.every(x => x !== null);
    const p2filled = gameState.confirmedCategories.player2.every(x => x !== null);
    
    if (p1filled && p2filled) {
        endGame();
    } else {
        nextTurn();
    }
}

/**
 * پایان بازی و نمایش نتایج
 */
function endGame() {
    gameState.gameFinished = true;
    clearTimer();
    const results = calculateFinalResults();
    showResultsScreen(results);
    mainBox.style.display = 'none';
    scoreBoard.style.display = 'none';
    topWrapper.style.display = 'none';
}

/* ======================================= */
/* 🏆 محاسبه نتایج نهایی                    */
/* ======================================= */

/**
 * محاسبه نتایج پایانی بازی
 * @returns {Object} نتایج هر بازیکن
 */
function calculateFinalResults() {
    const player1BaseScore = gameState.confirmedCategories.player1.reduce((s, v) => s + (v || 0), 0);
    const player2BaseScore = gameState.confirmedCategories.player2.reduce((s, v) => s + (v || 0), 0);
    const player1SpecialBonus = calculateSpecialBonus(gameState.specialBonuses.player1);
    const player2SpecialBonus = calculateSpecialBonus(gameState.specialBonuses.player2);
    const player1Total = player1BaseScore + player1SpecialBonus;
    const player2Total = player2BaseScore + player2SpecialBonus;
    
    let winner = null;
    if (player1Total > player2Total) winner = 1;
    else if (player2Total > player1Total) winner = 2;
    
    return {
        player1: { 
            baseScore: player1BaseScore, 
            specialBonus: player1SpecialBonus, 
            totalScore: player1Total, 
            specialCount: gameState.specialBonuses.player1 
        },
        player2: { 
            baseScore: player2BaseScore, 
            specialBonus: player2SpecialBonus, 
            totalScore: player2Total, 
            specialCount: gameState.specialBonuses.player2 
        },
        winner
    };
}

/**
 * محاسبه جایزه ویژه بر اساس تعداد
 * @param {number} count - تعداد جوایز ویژه
 * @returns {number} امتیاز جایزه
 */
function calculateSpecialBonus(count) {
    if (count === 0) return 0;
    if (count === 1) return 50;
    if (count === 2) return 100;
    if (count >= 3) return 300;
    return 0;
}

/* ======================================= */
/* 🔄 به‌روزرسانی نمایش نوبت                */
/* ======================================= */

/**
 * به‌روزرسانی نمایش وضعیت نوبت بازیکنان
 */
function updateTurnDisplay() {
    const left = document.getElementById('playerBox1');
    const right = document.getElementById('playerBox2');
    const leftTitle = left.querySelector('.player-title');
    const rightTitle = right.querySelector('.player-title');
    
    // تنظیم عنوان بازیکنان
    if (gameData.player_number === 1) {
        leftTitle.textContent = "شما (بازیکن 1)";
        rightTitle.textContent = "حریف (بازیکن 2)";
    } else {
        leftTitle.textContent = "حریف (بازیکن 1)";
        rightTitle.textContent = "شما (بازیکن 2)";
    }
    
    // تنظیم کلاس‌های فعال/غیرفعال
    if (gameState.currentPlayer === 1) {
        left.classList.remove('inactive');
        left.classList.add('active-player');
        right.classList.remove('active-player');
        right.classList.add('inactive');
    } else {
        right.classList.remove('inactive');
        right.classList.add('active-player');
        left.classList.remove('active-player');
        left.classList.add('inactive');
    }
    
    updateTimerDisplay();
}

/* ======================================= */
/* 🔄 دکمه بازی مجدد                       */
/* ======================================= */

/**
 * مدیریت کلیک روی دکمه "بازی مجدد"
 */
restartBtn.addEventListener('click', function() {
    resetGameState();
    diceData = [
        { id: 0, locked: false, value: rand1to6() },
        { id: 1, locked: false, value: rand1to6() },
        { id: 2, locked: false, value: rand1to6() },
        { id: 3, locked: false, value: rand1to6() },
        { id: 4, locked: false, value: rand1to6() }
    ];
    
    resultsScreen.style.display = 'none';
    mainBox.style.display = 'flex';
    scoreBoard.style.display = 'block';
    topWrapper.style.display = 'flex';
    
    renderScoreBoard();
    renderDice();
    updateTurnDisplay();
    startTimer();
    
    rollBtn.disabled = false;
    rollBtn.textContent = "تاس بریز";
    playBtn.disabled = true;
});

/* ======================================= */
/* 🚀 مقداردهی اولیه بازی                  */
/* ======================================= */

/**
 * تابع اصلی شروع بازی
 */
async function initializeGame() {
    // بارگذاری وضعیت از سرور
    await loadGameFromServer();
    
    // نمایش المان‌های بازی
    renderScoreBoard();
    renderDice();
    updateTurnDisplay();
    startTimer();
    
    // غیرفعال کردن کنترل‌ها برای تماشاگر
    if (gameData.role === "spectator") {
        disablePlayerControls();
    }
}

/* ======================================= */
/* 📦 صادر کردن توابع برای ماژول‌های دیگر  */
/* ======================================= */

export {
    calculatePotentialScores,
    rand1to6,
    isRolling,
    gameState,
    diceData,
    updateTurnDisplay
};

/* ======================================= */
/* 🚀 اجرای بازی هنگام بارگذاری صفحه       */
/* ======================================= */

window.addEventListener('DOMContentLoaded', initializeGame);