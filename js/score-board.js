/* ======================================= */
/* 📊 فایل جدول امتیازات (Score Board)     */
/* ======================================= */
/* این فایل مدیریت جدول امتیازات را بر عهده دارد */
/* شامل رندر جدول، نمایش امتیازات، انتخاب دسته‌ها */
/* تاریخ ایجاد: [تاریخ امروز]                */
/* آخرین تغییر: بدون تغییر - انتقال مستقیم */
/* ======================================= */

/* ======================================= */
/* 🏗️ رندر جدول امتیازات                   */
/* ======================================= */

function renderScoreBoard() {
    const container = document.getElementById('score-board');
    if (!container) {
        console.error("عنصر score-board یافت نشد!");
        return;
    }
    
    // هدر قبلاً در HTML تعریف شده، فقط ردیف‌ها را اضافه می‌کنیم
    const existingHeader = container.querySelector('.score-header');
    container.innerHTML = '';
    container.appendChild(existingHeader);
    
    // از config.js باید baseURL را بگیریم
    const baseURL = window.baseURL || "https://raw.githubusercontent.com/nonacoin/main/main/Dice/";
    
    for (let i = 1; i <= 6; i++) {
        const row = document.createElement('div');
        row.className = `score-row`;
        row.dataset.category = i-1;
        row.dataset.value = i;

        // ستون پلیر 1
        const col1 = document.createElement('div');
        col1.className = 'score-column';
        
        const input1 = document.createElement('input');
        input1.type = 'text';
        input1.className = 'value-box';
        input1.readOnly = true;
        input1.dataset.player = '1';
        input1.value = '0';
        col1.appendChild(input1);

        // ستون تاس (وسط)
        const colDice = document.createElement('div');
        colDice.className = 'score-column dice';
        
        const img = document.createElement('img');
        img.src = baseURL + i + '.png';
        img.className = 'mini-dice';
        img.alt = `تاس ${i}`;
        img.title = `برای ثبت امتیاز ${i} کلیک کنید`;
        colDice.appendChild(img);

        // ستون پلیر 2
        const col2 = document.createElement('div');
        col2.className = 'score-column';
        
        const input2 = document.createElement('input');
        input2.type = 'text';
        input2.className = 'value-box';
        input2.readOnly = true;
        input2.dataset.player = '2';
        input2.value = '0';
        col2.appendChild(input2);

        row.appendChild(col1);
        row.appendChild(colDice);
        row.appendChild(col2);

        // رویداد کلیک برای انتخاب دسته
        row.addEventListener('click', handleCategoryClick);

        container.appendChild(row);
    }
    
    updateScoreDisplays();
}

/* ======================================= */
/* 🎯 هندلر کلیک روی دسته امتیاز           */
/* ======================================= */

function handleCategoryClick(event) {
    const row = event.currentTarget;
    
    // از game-state.js باید وضعیت بازی را بگیریم
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
    if (typeof window.gameState !== 'undefined') {
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
/* 🔄 بروزرسانی نمایش امتیازات             */
/* ======================================= */

function updateScoreDisplays() {
    // از game-state.js باید وضعیت بازی را بگیریم
    const gameState = window.gameState || { 
        gameFinished: false,
        currentPlayer: 1,
        confirmedCategories: { player1: Array(6).fill(null), player2: Array(6).fill(null) }
    };
    
    if (gameState.gameFinished) return;
    
    // محاسبه امتیازات بالقوه
    const potentialScores = window.calculatePotentialScores ? 
        window.calculatePotentialScores() : Array(6).fill(0);

    const rows = document.querySelectorAll('#score-board .score-row');
    rows.forEach((row, index) => {
        const input1 = row.querySelector('.value-box[data-player="1"]');
        const input2 = row.querySelector('.value-box[data-player="2"]');

        const conf1 = gameState.confirmedCategories.player1[index];
        const conf2 = gameState.confirmedCategories.player2[index];

        // پلیر 1
        if (conf1 !== null) {
            input1.value = conf1;
            input1.classList.add('confirmed','player1');
            input1.classList.remove('locked');
        } else {
            if (gameState.currentPlayer === 1) {
                input1.value = potentialScores[index] || 0;
                input1.classList.remove('confirmed','player1','locked');
            } else {
                input1.value = '—';
                input1.classList.add('locked');
                input1.classList.remove('confirmed','player1');
            }
        }

        // پلیر 2
        if (conf2 !== null) {
            input2.value = conf2;
            input2.classList.add('confirmed','player2');
            input2.classList.remove('locked');
        } else {
            if (gameState.currentPlayer === 2) {
                input2.value = potentialScores[index] || 0;
                input2.classList.remove('confirmed','player2','locked');
            } else {
                input2.value = '—';
                input2.classList.add('locked');
                input2.classList.remove('confirmed','player2');
            }
        }
    });
}

/* ======================================= */
/* ✅ ثبت امتیاز                           */
/* ======================================= */

function confirmSelectedCategory() {
    // از game-state.js باید وضعیت بازی را بگیریم
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
    
    return { player, rowIndex, score };
}

/* ======================================= */
/* 🔍 بررسی پر شدن همه دسته‌ها              */
/* ======================================= */

function checkAllCategoriesFilled() {
    // از game-state.js باید وضعیت بازی را بگیریم
    const gameState = window.gameState || { 
        confirmedCategories: { player1: Array(6).fill(null), player2: Array(6).fill(null) }
    };
    
    const p1filled = gameState.confirmedCategories.player1.every(x => x !== null);
    const p2filled = gameState.confirmedCategories.player2.every(x => x !== null);
    
    return { player1: p1filled, player2: p2filled, all: p1filled && p2filled };
}

/* ======================================= */
/* 🧮 محاسبه امتیازات نهایی                */
/* ======================================= */

function calculateFinalScores() {
    // از game-state.js باید وضعیت بازی را بگیریم
    const gameState = window.gameState || { 
        confirmedCategories: { player1: Array(6).fill(null), player2: Array(6).fill(null) },
        specialBonuses: { player1: 0, player2: 0 }
    };
    
    const player1BaseScore = gameState.confirmedCategories.player1.reduce((s, v) => s + (v || 0), 0);
    const player2BaseScore = gameState.confirmedCategories.player2.reduce((s, v) => s + (v || 0), 0);
    
    // محاسبه امتیاز ویژه
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

/* ======================================= */
/* 🎁 محاسبه امتیاز ویژه                   */
/* ======================================= */

function calculateSpecialBonus(count) {
    if (count === 0) return 0;
    if (count === 1) return 50;
    if (count === 2) return 100;
    if (count >= 3) return 300;
    return 0;
}

/* ======================================= */
/* 📝 به‌روزرسانی آمار بازی                */
/* ======================================= */

function updateGameStats(finalResults) {
    // از game-state.js باید آمار بازی را بگیریم
    const gameStats = window.gameStats || {
        player1: { totalScore: 0, gamesPlayed: 0, wins: 0, losses: 0, totalSpecialBonus: 0 },
        player2: { totalScore: 0, gamesPlayed: 0, wins: 0, losses: 0, totalSpecialBonus: 0 }
    };
    
    gameStats.player1.gamesPlayed++;
    gameStats.player2.gamesPlayed++;
    gameStats.player1.totalScore += finalResults.player1.totalScore;
    gameStats.player2.totalScore += finalResults.player2.totalScore;
    gameStats.player1.totalSpecialBonus += finalResults.player1.specialBonus;
    gameStats.player2.totalSpecialBonus += finalResults.player2.specialBonus;
    
    if (finalResults.winner === 1) { 
        gameStats.player1.wins++; 
        gameStats.player2.losses++; 
    } else if (finalResults.winner === 2) { 
        gameStats.player2.wins++; 
        gameStats.player1.losses++; 
    }
    
    // ذخیره آمار به‌روز شده
    window.gameStats = gameStats;
    
    return gameStats;
}

/* ======================================= */
/* 🎯 انتخاب خودکار دسته (وقتی زمان تمام شود) */
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
    
    return availableIndex;
}

/* ======================================= */
/* 🔄 تابع بازنشانی جدول امتیازات          */
/* ======================================= */

function resetScoreBoard() {
    // از game-state.js باید وضعیت بازی را بگیریم
    if (window.gameState) {
        window.gameState.confirmedCategories = {
            player1: Array(6).fill(null),
            player2: Array(6).fill(null)
        };
        window.gameState.selectedCategory = null;
    }
    
    // پاک کردن انتخاب‌ها
    document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
        r.classList.remove('selected');
    });
    
    // غیرفعال‌سازی دکمه ثبت
    const playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.disabled = true;
    
    // بروزرسانی نمایش
    updateScoreDisplays();
}

/* ======================================= */
/* 🎯 تابع مقداردهی اولیه جدول امتیازات    */
/* ======================================= */

function initScoreBoard() {
    console.log("📊 جدول امتیازات راه‌اندازی شد");
    
    // رندر اولیه جدول
    renderScoreBoard();
    
    // ثبت event listener برای دکمه ثبت
    const playBtn = document.getElementById("play-btn");
    if (playBtn) {
        playBtn.addEventListener("click", function() {
            const result = confirmSelectedCategory();
            if (result) {
                // بررسی امتیاز ویژه
                if (typeof window.checkAndAwardSpecialBonus === 'function') {
                    window.checkAndAwardSpecialBonus();
                }
                
                // بررسی پایان بازی
                const filled = checkAllCategoriesFilled();
                if (filled.all) {
                    // پایان بازی
                    if (typeof window.endGame === 'function') {
                        window.endGame();
                    }
                } else {
                    // نوبت بعدی
                    if (typeof window.nextTurn === 'function') {
                        window.nextTurn();
                    }
                }
            }
        });
    }
}

/* ======================================= */
/* 📤 صادر کردن توابع و متغیرها            */
/* ======================================= */

// در صورت نیاز به استفاده در ماژول‌های ES6
// export {
//   renderScoreBoard,
//   handleCategoryClick,
//   updateScoreDisplays,
//   confirmSelectedCategory,
//   checkAllCategoriesFilled,
//   calculateFinalScores,
//   calculateSpecialBonus,
//   updateGameStats,
//   autoSelectAndConfirm,
//   resetScoreBoard,
//   initScoreBoard
// };