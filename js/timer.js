/* ======================================= */
/* ⏱️ فایل سیستم تایمر بازی                */
/* ======================================= */

// 🕒 متغیرهای تایمر
let timerInterval = null;        // اینتروال تایمر
let timeLeft = 30;               // زمان باقی‌مانده (ثانیه)
const TOTAL_TIME = 30;           // زمان کل هر نوبت
let warningPlayed = false;       // آیا هشدار 10 ثانیه پخش شده؟
let isTimeUpProcessing = false;  // آیا در حال پردازش اتمام زمان هستیم؟

// 🔊 المان‌های صدا
const timeoutSound = document.getElementById('timeoutSound');
const warningSound = document.getElementById('warningSound');
const tickSound = document.getElementById('tickSound');

/* ======================================= */
/* 🚀 توابع اصلی تایمر                     */
/* ======================================= */

/**
 * شروع تایمر برای بازیکن فعلی
 */
function startTimer() {
    if (window.gameState.gameFinished) return;
    if (timerInterval) clearInterval(timerInterval);
    
    timeLeft = TOTAL_TIME;
    warningPlayed = false;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        if (window.gameState.gameFinished) { 
            clearInterval(timerInterval); 
            return; 
        }
        
        timeLeft--;
        updateTimerDisplay();
        
        pulseTimer();
        
        // هشدار 10 ثانیه آخر
        if (timeLeft <= 10) {
            enableWarningMode();
            if (timeLeft <= 5 && !warningPlayed) {
                playWarningSound();
                warningPlayed = true;
            }
        }
        
        // اتمام زمان
        if (timeLeft <= 0 && !isTimeUpProcessing) {
            timeUp();
        }
    }, 1000);
}

/**
 * پالس کردن تایمر (انیمیشن کوچک)
 */
function pulseTimer() {
    const timer = window.gameState.currentPlayer === 1 
        ? document.getElementById('player1Timer')
        : document.getElementById('player2Timer');
    
    timer.style.transform = 'scale(1.08)';
    setTimeout(() => {
        timer.style.transform = 'scale(1)';
    }, 300);
}

/**
 * فعال کردن حالت هشدار (10 ثانیه آخر)
 */
function enableWarningMode() {
    const timer = window.gameState.currentPlayer === 1 
        ? document.getElementById('player1Timer')
        : document.getElementById('player2Timer');
    
    timer.classList.add('warning');
    
    // صدای تیک تاک در 10 ثانیه آخر
    if (timeLeft <= 10) {
        tickSound.currentTime = 0;
        tickSound.play().catch(e => console.log("خطا در پخش صدا"));
    }
}

/**
 * پخش صدای هشدار
 */
function playWarningSound() {
    warningSound.currentTime = 0;
    warningSound.play().catch(e => console.log("خطا در پخش صدا"));
}

/**
 * به‌روزرسانی نمایش تایمر
 */
function updateTimerDisplay() {
    const p1 = document.getElementById('player1Timer');
    const p2 = document.getElementById('player2Timer');
    
    if (window.gameState.currentPlayer === 1) {
        p1.textContent = timeLeft;
        p1.classList.add('active');
        p2.textContent = TOTAL_TIME;
        p2.classList.remove('active', 'warning');
        
        if (timeLeft <= 10) {
            p1.classList.add('warning');
        } else {
            p1.classList.remove('warning');
        }
    } else {
        p2.textContent = timeLeft;
        p2.classList.add('active');
        p1.textContent = TOTAL_TIME;
        p1.classList.remove('active', 'warning');
        
        if (timeLeft <= 10) {
            p2.classList.add('warning');
        } else {
            p2.classList.remove('warning');
        }
    }
}

/**
 * مدیریت اتمام زمان
 */
function timeUp() {
    if (isTimeUpProcessing) return;
    isTimeUpProcessing = true;
    
    clearInterval(timerInterval);
    timeoutSound.currentTime = 0;
    timeoutSound.play();
    
    showTurnLostMessage();
    
    setTimeout(() => {
        if (window.gameState.selectedCategory) {
            autoConfirmSelection();
        } else {
            autoSelectAndConfirm();
        }
        isTimeUpProcessing = false;
    }, 1000);
}

/**
 * نمایش پیام از دست دادن نوبت
 */
function showTurnLostMessage() {
    const message = document.createElement('div');
    message.className = 'turn-lost-message';
    message.textContent = `⏰ زمان بازیکن ${window.gameState.currentPlayer} تمام شد! نوبت از دست رفت.`;
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 2000);
}

/**
 * تأیید خودکار انتخاب فعلی
 */
function autoConfirmSelection() {
    const { player, rowIndex } = window.gameState.selectedCategory;
    const playerKey = `player${player}`;
    const potentialScores = window.calculatePotentialScores();
    const score = potentialScores[rowIndex];
    
    window.gameState.confirmedCategories[playerKey][rowIndex] = score;
    
    confirmSound.currentTime = 0;
    confirmSound.play();
    
    showAutoConfirmMessage(player, rowIndex, score);
    
    setTimeout(() => {
        window.gameState.selectedCategory = null;
        window.checkSpecialBonus();
        window.checkGameCompletion();
    }, 500);
}

/**
 * نمایش پیام تأیید خودکار
 */
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

/**
 * انتخاب و تأیید خودکار یک دسته
 */
function autoSelectAndConfirm() {
    const playerKey = `player${window.gameState.currentPlayer}`;
    const potentialScores = window.calculatePotentialScores();
    let availableIndex = -1;
    
    // پیدا کردن اولین دسته خالی
    for (let i = 0; i < 6; i++) {
        if (window.gameState.confirmedCategories[playerKey][i] === null) { 
            availableIndex = i; 
            break; 
        }
    }
    
    // ثبت امتیاز 0 اگر دسته‌ای پیدا شد
    if (availableIndex !== -1) {
        window.gameState.confirmedCategories[playerKey][availableIndex] = 0;
        
        const message = document.createElement('div');
        message.className = 'turn-lost-message';
        message.style.background = 'linear-gradient(135deg, #FF3333, #CC0000)';
        message.textContent = `❌ بازیکن ${window.gameState.currentPlayer} امتیازی ثبت نکرد! (امتیاز 0 ثبت شد)`;
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 2000);
    }
    
    setTimeout(() => {
        window.checkSpecialBonus();
        window.checkGameCompletion();
    }, 1000);
}

/**
 * پاک کردن تایمر
 */
function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * تنظیم زمان تایمر
 * @param {number} seconds - زمان به ثانیه
 */
function setTimer(seconds) {
    timeLeft = seconds;
    updateTimerDisplay();
}

/* ======================================= */
/* 📤 صادر کردن توابع                     */
/* ======================================= */

export {
    startTimer,
    clearTimer,
    updateTimerDisplay,
    setTimer,
    timeLeft,
    TOTAL_TIME
};