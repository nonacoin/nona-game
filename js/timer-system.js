/* ======================================= */
/* ⏱️ فایل سیستم تایمر (Timer System)      */
/* ======================================= */
/* این فایل مدیریت تایمر بازی را بر عهده دارد */
/* شامل شروع، توقف، بروزرسانی و هشدارهای تایمر */
/* تاریخ ایجاد: [تاریخ امروز]                */
/* آخرین تغییر: بدون تغییر - انتقال مستقیم */
/* ======================================= */

/* ======================================= */
/* ⏱️ متغیرهای سیستم تایمر                 */
/* ======================================= */

let timerInterval = null;      // ارجاع به interval تایمر
let timeLeft = 30;             // زمان باقی‌مانده در ثانیه
let warningPlayed = false;     // آیا هشدار 10 ثانیه آخر پخش شده؟
let isTimeUpProcessing = false; // برای جلوگیری از اجرای همزمان timeUp

const TOTAL_TIME = 30;         // زمان کل هر نوبت به ثانیه

/* ======================================= */
/* ⏱️ شروع تایمر                           */
/* ======================================= */

function startTimer() {
    // از game-state.js باید وضعیت بازی را بگیریم
    const gameState = window.gameState || { gameFinished: false };
    
    if (gameState.gameFinished) return;
    
    // پاک کردن تایمر قبلی
    clearInterval(timerInterval);
    
    // تنظیم مجدد زمان
    timeLeft = TOTAL_TIME;
    warningPlayed = false;
    
    // بروزرسانی نمایش
    updateTimerDisplay();
    
    // شروع تایمر جدید
    timerInterval = setInterval(() => {
        if (gameState.gameFinished) { 
            clearInterval(timerInterval); 
            return; 
        }
        
        timeLeft--;
        updateTimerDisplay();
        
        // تپش قلب با هر ثانیه
        pulseTimer();
        
        // 10 ثانیه آخر
        if (timeLeft <= 10) {
            enableWarningMode();
            if (timeLeft <= 5 && !warningPlayed) {
                playWarningSound();
                warningPlayed = true;
            }
        }
        
        if (timeLeft <= 0 && !isTimeUpProcessing) {
            timeUp();
        }
    }, 1000);
}

/* ======================================= */
/* ⏱️ توقف تایمر                           */
/* ======================================= */

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

/* ======================================= */
/* 🔄 بروزرسانی نمایش تایمر                */
/* ======================================= */

function updateTimerDisplay() {
    const p1 = document.getElementById('player1Timer');
    const p2 = document.getElementById('player2Timer');
    
    // از game-state.js باید بازیکن فعلی را بگیریم
    const gameState = window.gameState || { currentPlayer: 1 };
    
    if (gameState.currentPlayer === 1) {
        // پلیر 1 فعال است
        if (p1) {
            p1.textContent = timeLeft;
            p1.classList.add('active');
            
            if (timeLeft <= 10) {
                p1.classList.add('warning');
            } else {
                p1.classList.remove('warning');
            }
        }
        
        // پلیر 2 غیرفعال است
        if (p2) {
            p2.textContent = TOTAL_TIME;
            p2.classList.remove('active', 'warning');
        }
    } else {
        // پلیر 2 فعال است
        if (p2) {
            p2.textContent = timeLeft;
            p2.classList.add('active');
            
            if (timeLeft <= 10) {
                p2.classList.add('warning');
            } else {
                p2.classList.remove('warning');
            }
        }
        
        // پلیر 1 غیرفعال است
        if (p1) {
            p1.textContent = TOTAL_TIME;
            p1.classList.remove('active', 'warning');
        }
    }
}

/* ======================================= */
/* 💓 افکت تپش تایمر                       */
/* ======================================= */

function pulseTimer() {
    const gameState = window.gameState || { currentPlayer: 1 };
    const timer = gameState.currentPlayer === 1 
        ? document.getElementById('player1Timer')
        : document.getElementById('player2Timer');
    
    if (timer) {
        timer.style.transform = 'scale(1.08)';
        setTimeout(() => {
            timer.style.transform = 'scale(1)';
        }, 300);
    }
}

/* ======================================= */
/* ⚠️ فعال‌سازی حالت هشدار                  */
/* ======================================= */

function enableWarningMode() {
    const gameState = window.gameState || { currentPlayer: 1 };
    const timer = gameState.currentPlayer === 1 
        ? document.getElementById('player1Timer')
        : document.getElementById('player2Timer');
    
    if (timer) {
        timer.classList.add('warning');
        
        // پخش صدای تیک تاک در 10 ثانیه آخر
        if (timeLeft <= 10) {
            const tickSound = document.getElementById('tickSound');
            if (tickSound) {
                tickSound.currentTime = 0;
                tickSound.play().catch(e => console.log("خطا در پخش صدا"));
            }
        }
    }
}

/* ======================================= */
/* 🔊 پخش صدای هشدار                       */
/* ======================================= */

function playWarningSound() {
    const warningSound = document.getElementById('warningSound');
    if (warningSound) {
        warningSound.currentTime = 0;
        warningSound.play().catch(e => console.log("خطا در پخش صدای هشدار"));
    }
}

/* ======================================= */
/* ⏰ پایان زمان (Time Up)                 */
/* ======================================= */

function timeUp() {
    if (isTimeUpProcessing) return; // اگر در حال پردازش هستیم، دوباره اجرا نکن
    isTimeUpProcessing = true;
    
    // توقف تایمر
    clearInterval(timerInterval);
    
    // پخش صدای اتمام زمان
    const timeoutSound = document.getElementById('timeoutSound');
    if (timeoutSound) {
        timeoutSound.currentTime = 0;
        timeoutSound.play();
    }
    
    // نمایش پیام نوبت از دست رفته
    showTurnLostMessage();
    
    setTimeout(() => {
        // از game-state.js باید وضعیت بازی را بگیریم
        const gameState = window.gameState || { selectedCategory: null };
        
        if (gameState.selectedCategory) {
            // اگر دسته‌ای انتخاب شده، به صورت خودکار ثبت کن
            autoConfirmSelection();
        } else {
            // اگر چیزی انتخاب نشده، خودکار انتخاب و ثبت کن
            autoSelectAndConfirm();
        }
        isTimeUpProcessing = false;
    }, 1000); // یک ثانیه تأخیر برای نمایش پیام
}

/* ======================================= */
/* 📢 نمایش پیام نوبت از دست رفته          */
/* ======================================= */

function showTurnLostMessage() {
    // از game-state.js باید بازیکن فعلی را بگیریم
    const gameState = window.gameState || { currentPlayer: 1 };
    
    const message = document.createElement('div');
    message.className = 'turn-lost-message';
    message.textContent = `⏰ زمان بازیکن ${gameState.currentPlayer} تمام شد! نوبت از دست رفت.`;
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 2000);
}

/* ======================================= */
/* 🤖 ثبت خودکار دسته انتخاب شده          */
/* ======================================= */

function autoConfirmSelection() {
    // از game-state.js باید وضعیت بازی را بگیریم
    const gameState = window.gameState || { 
        selectedCategory: null,
        confirmedCategories: { player1: Array(6).fill(null), player2: Array(6).fill(null) }
    };
    
    const { player, rowIndex } = gameState.selectedCategory;
    const playerKey = `player${player}`;
    
    // محاسبه امتیازات بالقوه
    const potentialScores = window.calculatePotentialScores ? 
        window.calculatePotentialScores() : Array(6).fill(0);
    
    const score = potentialScores[rowIndex];
    
    // ثبت امتیاز
    gameState.confirmedCategories[playerKey][rowIndex] = score;
    
    // پخش صدای ثبت
    const confirmSound = document.getElementById('confirmSound');
    if (confirmSound) {
        confirmSound.currentTime = 0;
        confirmSound.play();
    }
    
    // نمایش پیام ثبت خودکار
    showAutoConfirmMessage(player, rowIndex, score);
    
    setTimeout(() => {
        gameState.selectedCategory = null;
        
        // بررسی امتیاز ویژه
        if (typeof window.checkAndAwardSpecialBonus === 'function') {
            window.checkAndAwardSpecialBonus();
        }
        
        // بررسی پایان بازی
        if (typeof window.checkGameCompletion === 'function') {
            window.checkGameCompletion();
        }
    }, 500);
}

/* ======================================= */
/* 📢 نمایش پیام ثبت خودکار                */
/* ======================================= */

function showAutoConfirmMessage(player, rowIndex, score) {
    const message = document.createElement('div');
    message.className = 'turn-lost-message';
    message.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
    message.textContent = `✅ امتیاز ${score} برای بازیکن ${player} ثبت شد`;
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 1500);
}

/* ======================================= */
/* 🤖 انتخاب و ثبت خودکار                  */
/* ======================================= */

function autoSelectAndConfirm() {
    // از game-state.js باید وضعیت بازی را بگیریم
    const gameState = window.gameState || { 
        currentPlayer: 1,
        confirmedCategories: { player1: Array(6).fill(null), player2: Array(6).fill(null) }
    };
    
    const playerKey = `player${gameState.currentPlayer}`;
    
    // پیدا کردن اولین دسته خالی
    let availableIndex = -1;
    for (let i = 0; i < 6; i++) {
        if (gameState.confirmedCategories[playerKey][i] === null) { 
            availableIndex = i; 
            break; 
        }
    }
    
    // اگر دسته خالی پیدا شد، امتیاز 0 ثبت کن
    if (availableIndex !== -1) {
        gameState.confirmedCategories[playerKey][availableIndex] = 0;
        
        // نمایش پیام
        const message = document.createElement('div');
        message.className = 'turn-lost-message';
        message.style.background = 'linear-gradient(135deg, #FF3333, #CC0000)';
        message.textContent = `❌ بازیکن ${gameState.currentPlayer} امتیازی ثبت نکرد! (امتیاز 0 ثبت شد)`;
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 2000);
    }
    
    setTimeout(() => {
        // بررسی امتیاز ویژه
        if (typeof window.checkAndAwardSpecialBonus === 'function') {
            window.checkAndAwardSpecialBonus();
        }
        
        // بررسی پایان بازی
        if (typeof window.checkGameCompletion === 'function') {
            window.checkGameCompletion();
        }
    }, 1000);
}

/* ======================================= */
/* 🔧 توابع getter برای وضعیت تایمر        */
/* ======================================= */

// دریافت زمان باقی‌مانده
function getTimeLeft() {
    return timeLeft;
}

// دریافت وضعیت هشدار
function getWarningStatus() {
    return warningPlayed;
}

// دریافت وضعیت پردازش timeUp
function getTimeUpProcessingStatus() {
    return isTimeUpProcessing;
}

// دریافت ارجاع interval
function getTimerInterval() {
    return timerInterval;
}

/* ======================================= */
/* 🔧 توابع setter برای وضعیت تایمر        */
/* ======================================= */

// تنظیم زمان باقی‌مانده
function setTimeLeft(newTime) {
    if (newTime >= 0 && newTime <= TOTAL_TIME) {
        timeLeft = newTime;
        updateTimerDisplay();
        return true;
    }
    return false;
}

// تنظیم وضعیت هشدار
function setWarningStatus(status) {
    warningPlayed = status;
    return warningPlayed;
}

// تنظیم وضعیت پردازش timeUp
function setTimeUpProcessingStatus(status) {
    isTimeUpProcessing = status;
    return isTimeUpProcessing;
}

/* ======================================= */
#### 🎯 تابع مقداردهی اولیه سیستم تایمر    ####
/* ======================================= */

function initTimerSystem() {
    console.log("⏱️ سیستم تایمر راه‌اندازی شد");
    
    // بروزرسانی اولیه نمایش
    updateTimerDisplay();
}

/* ======================================= */
#### 📤 صادر کردن توابع و متغیرها          ####
/* ======================================= */

// در صورت نیاز به استفاده در ماژول‌های ES6
// export {
//   timerInterval,
//   timeLeft,
//   warningPlayed,
//   isTimeUpProcessing,
//   TOTAL_TIME,
//   startTimer,
//   stopTimer,
//   updateTimerDisplay,
//   pulseTimer,
//   enableWarningMode,
//   playWarningSound,
//   timeUp,
//   showTurnLostMessage,
//   autoConfirmSelection,
//   showAutoConfirmMessage,
//   autoSelectAndConfirm,
//   getTimeLeft,
//   getWarningStatus,
//   getTimeUpProcessingStatus,
//   getTimerInterval,
//   setTimeLeft,
//   setWarningStatus,
//   setTimeUpProcessingStatus,
//   initTimerSystem
// };