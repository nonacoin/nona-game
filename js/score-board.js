/* ======================================= */
/* 📊 فایل جدول امتیازات و نتایج          */
/* ======================================= */

// 🔗 آدرس پایه برای تصاویر تاس
const baseURL = "https://raw.githubusercontent.com/nonacoin/main/main/Dice/";

// 🔊 المان صدا
const selectSound = document.getElementById('selectSound');

/* ======================================= */
/* 🏗️ توابع رندر جدول امتیازات            */
/* ======================================= */

/**
 * رندر جدول امتیازات در صفحه
 */
function renderScoreBoard() {
    const container = document.getElementById('score-board');
    const existingHeader = container.querySelector('.score-header');
    container.innerHTML = '';
    container.appendChild(existingHeader);
    
    // ایجاد 6 ردیف برای امتیازات
    for (let i = 1; i <= 6; i++) {
        const row = createScoreRow(i);
        container.appendChild(row);
    }
    
    updateScoreDisplays();
}

/**
 * ایجاد یک ردیف امتیاز
 * @param {number} diceValue - مقدار تاس (1 تا 6)
 * @returns {HTMLElement} المان ردیف
 */
function createScoreRow(diceValue) {
    const row = document.createElement('div');
    row.className = `score-row`;
    row.dataset.category = diceValue - 1;
    row.dataset.value = diceValue;

    // ستون بازیکن 1
    const col1 = createPlayerColumn(1);
    
    // ستون تصویر تاس
    const colDice = createDiceColumn(diceValue);
    
    // ستون بازیکن 2
    const col2 = createPlayerColumn(2);

    row.appendChild(col1);
    row.appendChild(colDice);
    row.appendChild(col2);

    // اضافه کردن رویداد کلیک
    addRowClickHandler(row, diceValue);

    return row;
}

/**
 * ایجاد ستون یک بازیکن
 * @param {number} playerNumber - شماره بازیکن
 * @returns {HTMLElement} المان ستون
 */
function createPlayerColumn(playerNumber) {
    const col = document.createElement('div');
    col.className = 'score-column';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'value-box';
    input.readOnly = true;
    input.dataset.player = playerNumber.toString();
    input.value = '0';
    
    col.appendChild(input);
    return col;
}

/**
 * ایجاد ستون تصویر تاس
 * @param {number} diceValue - مقدار تاس
 * @returns {HTMLElement} المان ستون
 */
function createDiceColumn(diceValue) {
    const colDice = document.createElement('div');
    colDice.className = 'score-column dice';
    
    const img = document.createElement('img');
    img.src = baseURL + diceValue + '.png';
    img.className = 'mini-dice';
    img.alt = `تاس ${diceValue}`;
    img.title = `برای ثبت امتیاز ${diceValue} کلیک کنید`;
    
    colDice.appendChild(img);
    return colDice;
}

/**
 * اضافه کردن رویداد کلیک به ردیف
 * @param {HTMLElement} row - المان ردیف
 * @param {number} diceValue - مقدار تاس
 */
function addRowClickHandler(row, diceValue) {
    row.addEventListener('click', () => {
        if (window.gameState.gameFinished) return;
        if (window.gameState.rollCount === 0) return;
        
        const idx = parseInt(row.dataset.category, 10);
        const playerKey = `player${window.gameState.currentPlayer}`;
        
        // اگر قبلاً ثبت شده، برگرد
        if (window.gameState.confirmedCategories[playerKey][idx] !== null) {
            row.style.animation = 'shake 0.5s';
            setTimeout(() => row.style.animation = '', 500);
            return;
        }

        // پاک کردن انتخاب‌های قبلی
        document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
            r.classList.remove('selected');
        });
        
        // انتخاب ردیف جدید
        row.classList.add('selected');
        window.gameState.selectedCategory = { 
            player: window.gameState.currentPlayer, 
            rowIndex: idx 
        };
        
        // پخش صدا
        selectSound.currentTime = 0;
        selectSound.play();
        
        // فعال کردن دکمه ثبت
        document.getElementById('play-btn').disabled = false;
    });
}

/* ======================================= */
/* 🔄 به‌روزرسانی نمایش امتیازات           */
/* ======================================= */

/**
 * به‌روزرسانی نمایش امتیازات در جدول
 */
function updateScoreDisplays() {
    if (window.gameState.gameFinished) return;
    const potential = window.calculatePotentialScores();

    const rows = document.querySelectorAll('#score-board .score-row');
    rows.forEach((row, index) => {
        const input1 = row.querySelector('.value-box[data-player="1"]');
        const input2 = row.querySelector('.value-box[data-player="2"]');

        const conf1 = window.gameState.confirmedCategories.player1[index];
        const conf2 = window.gameState.confirmedCategories.player2[index];

        // به‌روزرسانی ستون بازیکن 1
        updatePlayerColumn(input1, conf1, potential[index], 1);

        // به‌روزرسانی ستون بازیکن 2
        updatePlayerColumn(input2, conf2, potential[index], 2);
    });
}

/**
 * به‌روزرسانی ستون یک بازیکن
 * @param {HTMLElement} input - المان ورودی
 * @param {number|null} confirmedValue - مقدار ثبت شده
 * @param {number} potentialValue - مقدار بالقوه
 * @param {number} playerNumber - شماره بازیکن
 */
function updatePlayerColumn(input, confirmedValue, potentialValue, playerNumber) {
    if (confirmedValue !== null) {
        // مقدار ثبت شده
        input.value = confirmedValue;
        input.classList.add('confirmed', `player${playerNumber}`);
        input.classList.remove('locked');
    } else {
        if (window.gameState.currentPlayer === playerNumber) {
            // نمایش مقدار بالقوه برای بازیکن فعال
            input.value = potentialValue || 0;
            input.classList.remove('confirmed', `player${playerNumber}`, 'locked');
        } else {
            // قفل شده برای بازیکن غیرفعال
            input.value = '—';
            input.classList.add('locked');
            input.classList.remove('confirmed', `player${playerNumber}`);
        }
    }
}

/* ======================================= */
/* 🏆 نمایش صفحه نتایج                     */
/* ======================================= */

/**
 * نمایش صفحه نتایج پایانی
 * @param {Object} results - نتایج بازی
 */
function showResultsScreen(results) {
    const resultsScreen = document.getElementById('results-screen');
    const resultsColumns = document.getElementById('resultsColumns');
    resultsColumns.innerHTML = '';
    
    // ایجاد کارت نتایج برای هر بازیکن
    for (let playerNum = 1; playerNum <= 2; playerNum++) {
        const playerCard = createPlayerResultsCard(playerNum, results);
        resultsColumns.appendChild(playerCard);
    }
    
    resultsScreen.style.display = 'block';
}

/**
 * ایجاد کارت نتایج برای یک بازیکن
 * @param {number} playerNum - شماره بازیکن
 * @param {Object} results - نتایج بازی
 * @returns {HTMLElement} المان کارت نتایج
 */
function createPlayerResultsCard(playerNum, results) {
    const playerKey = `player${playerNum}`;
    const playerData = results[playerKey];
    const playerStats = window.gameStats[playerKey];
    
    const playerDiv = document.createElement('div');
    
    // استایل‌دهی کارت
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
    
    // محتوای کارت
    playerDiv.innerHTML = `
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${playerNum === 1 ? '#FFD700' : '#00FF7F'}">
            ${playerNum === 1 ? '👑' : '⚔️'} بازیکن ${playerNum} ${results.winner === playerNum ? '🏆 برنده!' : ''}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between;">
            ${createScoreSection(playerData)}
            ${createStatsSection(playerStats)}
        </div>
    `;
    
    return playerDiv;
}

/**
 * ایجاد بخش امتیازات
 * @param {Object} playerData - داده‌های بازیکن
 * @returns {string} HTML بخش امتیازات
 */
function createScoreSection(playerData) {
    return `
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
    `;
}

/**
 * ایجاد بخش آمار
 * @param {Object} playerStats - آمار بازیکن
 * @returns {string} HTML بخش آمار
 */
function createStatsSection(playerStats) {
    return `
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
    `;
}

/* ======================================= */
/* 📤 صادر کردن توابع                     */
/* ======================================= */

export {
    renderScoreBoard,
    updateScoreDisplays,
    showResultsScreen
};