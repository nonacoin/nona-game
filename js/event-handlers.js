/* ======================================= */
/* 🎮 فایل مدیریت رویدادها (Event Handlers) */
/* ======================================= */
/* این فایل مدیریت کلیه رویدادهای بازی را بر عهده دارد */
/* شامل رویدادهای کلیک، لود صفحه و تعاملات کاربر */
/* تاریخ ایجاد: [تاریخ امروز]                */
/* آخرین تغییر: بدون تغییر - انتقال مستقیم */
/* ======================================= */

/* ======================================= */
/* 🎲 رویداد کلیک روی تاس‌ها               */
/* ======================================= */

function handleDiceClick(event) {
    const scene = event.currentTarget;
    const diceId = parseInt(scene.dataset.id, 10);
    
    // بررسی وضعیت بازی
    const isRolling = window.isRolling || false;
    const gameState = window.gameState || { rollCount: 0, gameFinished: false };
    
    if (isRolling) return;
    if (gameState.rollCount === 0) return;
    if (gameState.gameFinished) return;

    // پیدا کردن تاس در diceData
    const diceData = window.diceData || [];
    const diceIndex = diceData.findIndex(d => d.id === diceId);
    if (diceIndex === -1) return;
    
    // تغییر وضعیت قفل
    diceData[diceIndex].locked = !diceData[diceIndex].locked;

    // پخش صدای قفل
    const lockSound = document.getElementById('lockSound');
    if (lockSound) {
        lockSound.currentTime = 0;
        lockSound.play();
    }

    // تغییر ظاهر تاس
    if (diceData[diceIndex].locked) {
        scene.classList.add('locked');
    } else {
        scene.classList.remove('locked');
    }
    
    // بروزرسانی نمایش امتیازات
    if (typeof updateScoreDisplays === 'function') {
        updateScoreDisplays();
    }
}

/* ======================================= */
/* 📊 رویداد کلیک روی دسته‌های امتیاز      */
/* ======================================= */

function handleCategoryClick(event) {
    const row = event.currentTarget;
    
    // بررسی وضعیت بازی
    const gameState = window.gameState || { 
        gameFinished: false, 
        rollCount: 0,
        currentPlayer: 1,
        confirmedCategories: { player1: Array(6).fill(null), player2: Array(6).fill(null) }
    };
    
    if (gameState.gameFinished) return;
    if (gameState.rollCount === 0) return;
    
    const idx = parseInt(row.dataset.category, 10);
    const playerKey = `player${gameState.currentPlayer}`;
    
    // بررسی آیا این دسته قبلاً پر شده؟
    if (gameState.confirmedCategories[playerKey][idx] !== null) {
        row.style.animation = 'shake 0.5s';
        setTimeout(() => row.style.animation = '', 500);
        return;
    }

    // حذف انتخاب قبلی
    document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
        r.classList.remove('selected');
    });
    
    // انتخاب جدید
    row.classList.add('selected');
    
    // ذخیره انتخاب در gameState
    if (window.gameState) {
        window.gameState.selectedCategory = { 
            player: gameState.currentPlayer, 
            rowIndex: idx 
        };
    }
    
    // پخش صدای انتخاب
    const selectSound = document.getElementById('selectSound');
    if (selectSound) {
        selectSound.currentTime = 0;
        selectSound.play();
    }
    
    // فعال‌سازی دکمه ثبت
    const playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.disabled = false;
}

/* ======================================= */
/* 🎮 رویداد کلیک روی دکمه رول (تاس ریختن) */
/* ======================================= */

async function handleRollButtonClick() {
    // بررسی وضعیت بازی
    const isRolling = window.isRolling || false;
    const gameState = window.gameState || { rollCount: 0, maxRolls: 3, gameFinished: false };
    
    if (isRolling) return;
    if (gameState.rollCount >= gameState.maxRolls) return;
    if (gameState.gameFinished) return;

    // تنظیم وضعیت رول کردن
    window.isRolling = true;
    const btn = document.getElementById("roll-btn");
    if (btn) btn.disabled = true;
    
    // پاک کردن انتخاب دسته
    if (window.gameState) {
        window.gameState.selectedCategory = null;
    }
    
    document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
        r.classList.remove('selected');
    });
    
    const playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.disabled = true;

    // پیدا کردن تاس‌های غیرقفل شده
    const diceData = window.diceData || [];
    const unlockedIndices = diceData
        .map((d, idx) => !d.locked ? idx : -1)
        .filter(idx => idx !== -1);

    // رول کردن تاس‌ها
    if (unlockedIndices.length > 0) {
        const promises = unlockedIndices.map(idx => rollSingleDice(idx));
        await Promise.all(promises);
    }

    // ========== بخش ذخیره آنلاین (از کد اصلی) ==========
    if (window.supabase) {
        try {
            const diceValues = diceData.map(d => d.value);
            const lockedStatus = diceData.map(d => d.locked);
            const playerId = localStorage.getItem('dice_party_player_id') || 'player-local';
            const roomId = localStorage.getItem('dice_party_room_id') || 'local-game';
            
            const { data, error } = await window.supabase.rpc('save_dice_roll', {
                p_room_id: roomId,
                p_player_id: playerId,
                p_dice_values: diceValues,
                p_locked_status: lockedStatus,
                p_roll_count: gameState.rollCount + 1
            });
            
            if (error) {
                console.warn('⚠️ خطا در ذخیره آنلاین:', error.message);
            } else if (data) {
                console.log('✅ نتیجه تاس در سرور ذخیره شد:', data);
            }
        } catch (err) {
            console.warn('⚠️ خطای شبکه:', err.message);
        }
    }
    // ========== پایان بخش ذخیره آنلاین ==========

    // افزایش شمارنده رول
    if (window.gameState) {
        window.gameState.rollCount++;
    } else {
        window.gameState = { rollCount: 1, maxRolls: 3 };
    }
    
    // رندر مجدد تاس‌ها
    if (typeof renderDice === 'function') {
        renderDice();
    }
    
    // بروزرسانی نمایش امتیازات
    if (typeof updateScoreDisplays === 'function') {
        updateScoreDisplays();
    }
    
    // بازنشانی وضعیت رول
    window.isRolling = false;
    
    // بروزرسانی دکمه رول
    if (btn) {
        if (gameState.rollCount >= gameState.maxRolls - 1) {
            btn.disabled = true;
            btn.textContent = "۳ بار رول کردید";
        } else {
            btn.disabled = false;
            btn.textContent = `تاس بریز (${gameState.maxRolls - gameState.rollCount - 1})`;
        }
    }
}

/* ======================================= */
/* 🎮 رویداد کلیک روی دکمه ثبت (پلی)       */
/* ======================================= */

function handlePlayButtonClick() {
    // بررسی وضعیت بازی
    const gameState = window.gameState || { 
        selectedCategory: null,
        gameFinished: false,
        confirmedCategories: { player1: Array(6).fill(null), player2: Array(6).fill(null) }
    };
    
    if (!gameState.selectedCategory) return;
    if (gameState.gameFinished) return;

    const { player, rowIndex } = gameState.selectedCategory;
    const playerKey = `player${player}`;
    
    // محاسبه امتیازات بالقوه
    const potentialScores = window.calculatePotentialScores ? 
        window.calculatePotentialScores() : Array(6).fill(0);
    
    const score = potentialScores[rowIndex];

    // ثبت امتیاز
    gameState.confirmedCategories[playerKey][rowIndex] = score;
    
    // افکت انیمیشن برای امتیاز ثبت شده
    const selectedRow = document.querySelector('#score-board .score-row.selected');
    if (selectedRow) {
        const valueBox = selectedRow.querySelector(`.value-box[data-player="${player}"]`);
        if (valueBox) {
            valueBox.style.animation = 'scorePop 0.5s';
            setTimeout(() => valueBox.style.animation = '', 500);
        }
    }
    
    // پخش صدای ثبت
    const confirmSound = document.getElementById('confirmSound');
    if (confirmSound) {
        confirmSound.currentTime = 0;
        confirmSound.play();
    }
    
    // پاک کردن انتخاب
    gameState.selectedCategory = null;
    document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
        r.classList.remove('selected');
    });
    
    // غیرفعال‌سازی دکمه ثبت
    const playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.disabled = true;
    
    // بررسی امتیاز ویژه
    if (typeof checkAndAwardSpecialBonus === 'function') {
        checkAndAwardSpecialBonus();
    }
    
    // بررسی پایان بازی
    if (typeof checkGameCompletion === 'function') {
        checkGameCompletion();
    }
}

/* ======================================= */
#### 🔄 رویداد کلیک روی دکمه بازی مجدد     ####
/* ======================================= */

function handleRestartButtonClick() {
    // بازنشانی وضعیت بازی
    if (window.gameState) {
        window.gameState = {
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
    }
    
    // بازنشانی تاس‌ها
    if (window.diceData) {
        window.diceData = [
            { id: 0, locked: false, value: Math.floor(Math.random() * 6) + 1 },
            { id: 1, locked: false, value: Math.floor(Math.random() * 6) + 1 },
            { id: 2, locked: false, value: Math.floor(Math.random() * 6) + 1 },
            { id: 3, locked: false, value: Math.floor(Math.random() * 6) + 1 },
            { id: 4, locked: false, value: Math.floor(Math.random() * 6) + 1 }
        ];
    }
    
    // پنهان‌سازی صفحه نتایج
    const resultsScreen = document.getElementById('results-screen');
    if (resultsScreen) {
        resultsScreen.style.display = 'none';
    }
    
    // نمایش بخش‌های اصلی بازی
    const mainBox = document.getElementById('main-box');
    const scoreBoard = document.getElementById('score-board');
    const topWrapper = document.getElementById('top-wrapper');
    
    if (mainBox) mainBox.style.display = 'flex';
    if (scoreBoard) scoreBoard.style.display = 'block';
    if (topWrapper) topWrapper.style.display = 'flex';
    
    // رندر مجدد اجزای بازی
    if (typeof renderScoreBoard === 'function') {
        renderScoreBoard();
    }
    
    if (typeof renderDice === 'function') {
        renderDice();
    }
    
    // بروزرسانی نمایش نوبت
    if (typeof updateTurnDisplay === 'function') {
        updateTurnDisplay();
    }
    
    // مدیریت دکمه‌ها
    const rollBtn = document.getElementById("roll-btn");
    const playBtn = document.getElementById("play-btn");
    
    if (rollBtn) {
        rollBtn.disabled = false;
        rollBtn.textContent = "تاس بریز";
    }
    
    if (playBtn) {
        playBtn.disabled = true;
    }
    
    // شروع تایمر جدید
    if (typeof startTimer === 'function') {
        startTimer();
    }
}

/* ======================================= */
#### 🎲 تابع کمکی برای رول یک تاس           ####
/* ======================================= */

function rollSingleDice(diceIndex) {
    return new Promise((resolve) => {
        const diceData = window.diceData || [];
        const diceItem = diceData[diceIndex];
        
        if (!diceItem || diceItem.locked) { 
            resolve(); 
            return; 
        }
        
        // تولید مقدار جدید
        const newValue = Math.floor(Math.random() * 6) + 1;
        diceItem.value = newValue;
        
        // پخش صدای تاس با تأخیر برای افکت آبشاری
        setTimeout(() => {
            const diceSound = document.getElementById('diceSound');
            if (diceSound) {
                diceSound.currentTime = 0;
                diceSound.play().catch(e => console.log("خطا در پخش صدای تاس"));
            }
        }, diceIndex * 100);
        
        const cube = document.getElementById(`cube${diceIndex}`);
        if (!cube) { 
            resolve(); 
            return; 
        }

        // چرخش‌های از config.js (کپی شده)
        const rotations = {
            1: {x: -90, y: 0}, 
            2: {x: 0, y: -90}, 
            3: {x: 0, y: 0},
            4: {x: 0, y: 180}, 
            5: {x: 0, y: 90}, 
            6: {x: 90, y: 0}
        };
        
        const rot = rotations[newValue];
        const extraX = 360 * (2 + Math.floor(Math.random() * 2));
        const extraY = 360 * (2 + Math.floor(Math.random() * 2));

        cube.style.transition = 'transform 1s cubic-bezier(.2,.9,.3,1)';
        cube.style.transform = `rotateX(${rot.x + extraX}deg) rotateY(${rot.y + extraY}deg)`;

        cube.addEventListener('transitionend', function handler(e) {
            if (e.propertyName !== 'transform') return;
            cube.removeEventListener('transitionend', handler);

            cube.style.transition = 'none';
            cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;

            setTimeout(() => {
                cube.style.transition = 'transform 1s cubic-bezier(.2,.9,.3,1)';
                resolve();
            }, 30);
        });
    });
}

/* ======================================= */
#### 🔄 تابع بررسی تکمیل بازی               ####
/* ======================================= */

function checkGameCompletion() {
    // بررسی آیا همه دسته‌ها پر شده‌اند؟
    const gameState = window.gameState || { 
        confirmedCategories: { player1: Array(6).fill(null), player2: Array(6).fill(null) }
    };
    
    const p1filled = gameState.confirmedCategories.player1.every(x => x !== null);
    const p2filled = gameState.confirmedCategories.player2.every(x => x !== null);
    
    if (p1filled && p2filled) {
        // پایان بازی
        if (typeof endGame === 'function') {
            endGame();
        }
    } else {
        // نوبت بعدی
        if (typeof nextTurn === 'function') {
            nextTurn();
        }
    }
}

/* ======================================= */
#### 🏁 تابع پایان بازی                    ####
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
    if (typeof calculateFinalResults === 'function') {
        finalResults = calculateFinalResults();
    } else {
        // محاسبه ساده اگر تابع موجود نیست
        finalResults = {
            player1: { totalScore: 0, baseScore: 0, specialBonus: 0, specialCount: 0 },
            player2: { totalScore: 0, baseScore: 0, specialBonus: 0, specialCount: 0 },
            winner: null
        };
    }
    
    // نمایش صفحه نتایج
    const resultsScreen = document.getElementById('results-screen');
    if (resultsScreen) {
        resultsScreen.style.display = 'block';
    }
    
    // پنهان‌سازی بخش‌های دیگر بازی
    const mainBox = document.getElementById('main-box');
    const scoreBoard = document.getElementById('score-board');
    const topWrapper = document.getElementById('top-wrapper');
    
    if (mainBox) mainBox.style.display = 'none';
    if (scoreBoard) scoreBoard.style.display = 'none';
    if (topWrapper) topWrapper.style.display = 'none';
    
    // نمایش نتایج
    if (typeof displayResults === 'function') {
        displayResults(finalResults);
    }
}

/* ======================================= */
#### 🔄 تابع نوبت بعدی                      ####
/* ======================================= */

function nextTurn() {
    // بازنشانی تاس‌ها برای نوبت جدید
    const diceData = window.diceData || [];
    diceData.forEach(d => d.locked = false);
    
    // تولید مقادیر جدید برای تاس‌ها
    diceData.forEach(d => {
        d.value = Math.floor(Math.random() * 6) + 1;
    });
    
    // تغییر بازیکن فعلی
    const gameState = window.gameState || { currentPlayer: 1 };
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    gameState.rollCount = 0;
    gameState.selectedCategory = null;
    
    // بروزرسانی نمایش
    if (typeof updateTurnDisplay === 'function') {
        updateTurnDisplay();
    }
    
    // رندر تاس‌ها
    if (typeof renderDice === 'function') {
        renderDice();
    }
    
    // مدیریت دکمه‌ها
    const playBtn = document.getElementById('play-btn');
    const rollBtn = document.getElementById('roll-btn');
    
    if (playBtn) playBtn.disabled = true;
    if (rollBtn) {
        rollBtn.disabled = false;
        rollBtn.textContent = "تاس بریز";
    }
    
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
#### 🎯 تابع مقداردهی اولیه رویدادها       ####
/* ======================================= */

function initEventHandlers() {
    console.log("🎮 مدیریت رویدادها راه‌اندازی شد");
    
    // ثبت event listener برای دکمه رول
    const rollBtn = document.getElementById("roll-btn");
    if (rollBtn) {
        rollBtn.addEventListener("click", handleRollButtonClick);
    }
    
    // ثبت event listener برای دکمه ثبت
    const playBtn = document.getElementById("play-btn");
    if (playBtn) {
        playBtn.addEventListener("click", handlePlayButtonClick);
    }
    
    // ثبت event listener برای دکمه بازی مجدد
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', handleRestartButtonClick);
    }
    
    // ثبت event listener برای تاس‌ها (در رندر تاس‌ها انجام می‌شود)
    // ثبت event listener برای دسته‌های امتیاز (در رندر جدول امتیازات انجام می‌شود)
}

/* ======================================= */
#### 📤 صادر کردن توابع و متغیرها          ####
/* ======================================= */

// در صورت نیاز به استفاده در ماژول‌های ES6
// export {
//   handleDiceClick,
//   handleCategoryClick,
//   handleRollButtonClick,
//   handlePlayButtonClick,
//   handleRestartButtonClick,
//   rollSingleDice,
//   checkGameCompletion,
//   endGame,
//   nextTurn,
//   initEventHandlers
// };