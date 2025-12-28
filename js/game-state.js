/* ======================================= */
/* 🎮 فایل وضعیت بازی (Game State)         */
/* ======================================= */
/* این فایل مدیریت وضعیت فعلی بازی را بر عهده دارد */
/* شامل وضعیت بازیکنان، تاس‌ها، امتیازات و ...     */
/* تاریخ ایجاد: [تاریخ امروز]                 */
/* آخرین تغییر: بدون تغییر - انتقال مستقیم    */
/* ======================================= */

/* ======================================= */
/* 🎲 وضعیت فعلی بازی - متغیرهای اصلی       */
/* ======================================= */

// وضعیت اصلی بازی
let gameState = {
    currentPlayer: 1,           // بازیکن فعلی (1 یا 2)
    rollCount: 0,               // تعداد تاس‌ریختن‌ها در این نوبت
    maxRolls: 3,                // حداکثر تعداد تاس‌ریختن (از config.js می‌آید)
    selectedCategory: null,     // دسته انتخابی برای ثبت امتیاز
    gameFinished: false,        // آیا بازی پایان یافته؟
    
    // امتیازات ثبت شده توسط هر بازیکن
    confirmedCategories: {
        player1: Array(6).fill(null),  // 6 خانه برای پلیر 1
        player2: Array(6).fill(null)   // 6 خانه برای پلیر 2
    },
    
    // امتیازات ویژه (برای 5 تاس مشابه)
    specialBonuses: { 
        player1: 0, 
        player2: 0 
    }
};

/* ======================================= */
/* 📊 آمار کلی بازی - برای چندین دور بازی   */
/* ======================================= */

let gameStats = {
    player1: { 
        totalScore: 0, 
        gamesPlayed: 0, 
        wins: 0, 
        losses: 0, 
        totalSpecialBonus: 0 
    },
    player2: { 
        totalScore: 0, 
        gamesPlayed: 0, 
        wins: 0, 
        losses: 0, 
        totalSpecialBonus: 0 
    }
};

/* ======================================= */
/* 🎲 وضعیت تاس‌ها                         */
/* ======================================= */

let diceData = [
  { id: 0, locked: false, value: 1 },  // تاس اول
  { id: 1, locked: false, value: 1 },  // تاس دوم
  { id: 2, locked: false, value: 1 },  // تاس سوم
  { id: 3, locked: false, value: 1 },  // تاس چهارم
  { id: 4, locked: false, value: 1 }   // تاس پنجم
];

/* ======================================= */
/* ⏱️ وضعیت تایمر                          */
/* ======================================= */

let timerInterval = null;      // ارجاع به interval تایمر
let timeLeft = 30;             // زمان باقی‌مانده در ثانیه
let warningPlayed = false;     // آیا هشدار 10 ثانیه آخر پخش شده؟
let isTimeUpProcessing = false; // برای جلوگیری از اجرای همزمان timeUp

/* ======================================= */
/* 🎮 وضعیت رول کردن تاس                    */
/* ======================================= */

let isRolling = false;  // آیا تاس‌ها در حال رول شدن هستند؟

/* ======================================= */
/* 🎲 تابع تولید عدد تصادفی 1 تا 6          */
/* ======================================= */

function rand1to6(){ 
    return Math.floor(Math.random() * 6) + 1; 
}

/* ======================================= */
/* 🔄 تابع مقداردهی اولیه تاس‌ها            */
/* ======================================= */

function initializeDice() {
    // تولید مقادیر تصادفی برای تاس‌ها
    diceData = [
        { id: 0, locked: false, value: rand1to6() },
        { id: 1, locked: false, value: rand1to6() },
        { id: 2, locked: false, value: rand1to6() },
        { id: 3, locked: false, value: rand1to6() },
        { id: 4, locked: false, value: rand1to6() }
    ];
}

/* ======================================= */
/* 🔧 توابع getter برای دسترسی به وضعیت بازی */
/* ======================================= */

// دریافت وضعیت فعلی بازی
function getGameState() {
    return gameState;
}

// دریافت وضعیت تاس‌ها
function getDiceData() {
    return diceData;
}

// دریافت آمار بازی
function getGameStats() {
    return gameStats;
}

// دریافت وضعیت تایمر
function getTimerState() {
    return {
        timerInterval,
        timeLeft,
        warningPlayed,
        isTimeUpProcessing
    };
}

// دریافت وضعیت رول کردن
function getRollingState() {
    return isRolling;
}

/* ======================================= */
/* 🔧 توابع setter برای تغییر وضعیت بازی    */
/* ======================================= */

// تغییر وضعیت بازی
function setGameState(newState) {
    gameState = { ...gameState, ...newState };
}

// تغییر وضعیت تاس‌ها
function setDiceData(newDiceData) {
    diceData = newDiceData;
}

// تغییر وضعیت تایمر
function setTimerState(newTimerState) {
    if (newTimerState.timerInterval !== undefined) timerInterval = newTimerState.timerInterval;
    if (newTimerState.timeLeft !== undefined) timeLeft = newTimerState.timeLeft;
    if (newTimerState.warningPlayed !== undefined) warningPlayed = newTimerState.warningPlayed;
    if (newTimerState.isTimeUpProcessing !== undefined) isTimeUpProcessing = newTimerState.isTimeUpProcessing;
}

// تغییر وضعیت رول کردن
function setRollingState(state) {
    isRolling = state;
}

/* ======================================= */
/* 🔄 توابع مدیریت نوبت                     */
/* ======================================= */

// تعیین بازیکن بعدی
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    return gameState.currentPlayer;
}

// بازنشانی تاس‌ها برای نوبت جدید
function resetDiceForNewTurn() {
    // باز کردن قفل تمام تاس‌ها
    diceData.forEach(d => d.locked = false);
    
    // تولید مقادیر جدید برای تاس‌ها
    initializeDice();
    
    // بازنشانی شمارنده رول
    gameState.rollCount = 0;
    
    // حذف انتخاب دسته
    gameState.selectedCategory = null;
}

// افزایش شمارنده رول
function incrementRollCount() {
    gameState.rollCount++;
    return gameState.rollCount;
}

// دریافت تعداد رول‌های باقی‌مانده
function getRemainingRolls() {
    return gameState.maxRolls - gameState.rollCount;
}

/* ======================================= */
/* 📊 توابع مدیریت امتیازات                */
/* ======================================= */

// ثبت امتیاز برای یک دسته
function confirmScore(player, categoryIndex, score) {
    const playerKey = `player${player}`;
    gameState.confirmedCategories[playerKey][categoryIndex] = score;
}

// بررسی آیا همه دسته‌ها پر شده‌اند؟
function areAllCategoriesFilled() {
    const p1filled = gameState.confirmedCategories.player1.every(x => x !== null);
    const p2filled = gameState.confirmedCategories.player2.every(x => x !== null);
    return p1filled && p2filled;
}

// دریافت امتیازات یک بازیکن
function getPlayerScores(player) {
    const playerKey = `player${player}`;
    return gameState.confirmedCategories[playerKey];
}

/* ======================================= */
/* 🎯 توابع امتیاز ویژه                    */
/* ======================================= */

// بررسی و ثبت امتیاز ویژه
function checkAndAwardSpecialBonus() {
    const values = diceData.map(d => d.value);
    const counts = {};
    
    // شمارش تعداد هر مقدار
    values.forEach(v => counts[v] = (counts[v] || 0) + 1);
    
    // بررسی آیا 5 تاس مشابه داریم؟
    for (const v in counts) {
        if (counts[v] === 5) {
            const key = `player${gameState.currentPlayer}`;
            gameState.specialBonuses[key]++;
            return true;
        }
    }
    return false;
}

// دریافت امتیاز ویژه یک بازیکن
function getSpecialBonus(player) {
    const key = `player${player}`;
    return gameState.specialBonuses[key];
}

/* ======================================= */
/* 🏁 توابع پایان بازی                     */
/* ======================================= */

// علامت‌گذاری پایان بازی
function markGameFinished() {
    gameState.gameFinished = true;
}

// بررسی آیا بازی تمام شده؟
function isGameFinished() {
    return gameState.gameFinished;
}

/* ======================================= */
/* 🗑️ تابع بازنشانی کامل بازی              */
/* ======================================= */

function resetGame() {
    gameState = {
        currentPlayer: 1,
        rollCount: 0,
        maxRolls: 3,
        selectedCategory: null,
        confirmedCategories: {
            player1: Array(6).fill(null),
            player2: Array(6).fill(null)
        },
        gameFinished: false,
        specialBonuses: { player1: 0, player2: 0 }
    };
    
    initializeDice();
    
    timerInterval = null;
    timeLeft = 30;
    warningPlayed = false;
    isTimeUpProcessing = false;
    isRolling = false;
}

/* ======================================= */
/* 📤 صادر کردن توابع و متغیرها            */
/* ======================================= */

// در صورت نیاز به استفاده در ماژول‌های ES6
// export { 
//     gameState, getGameState, setGameState,
//     diceData, getDiceData, setDiceData,
//     gameStats, getGameStats,
//     timerInterval, timeLeft, warningPlayed, isTimeUpProcessing,
//     getTimerState, setTimerState,
//     isRolling, getRollingState, setRollingState,
//     rand1to6, initializeDice,
//     switchPlayer, resetDiceForNewTurn, incrementRollCount, getRemainingRolls,
//     confirmScore, areAllCategoriesFilled, getPlayerScores,
//     checkAndAwardSpecialBonus, getSpecialBonus,
//     markGameFinished, isGameFinished, resetGame
// };