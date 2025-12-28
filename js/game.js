/* ======================================= */
/* 🎯 متغیرهای اصلی بازی                   */
/* ======================================= */

const diceSound = document.getElementById('diceSound');
const lockSound = document.getElementById('lockSound');
const selectSound = document.getElementById('selectSound');
const confirmSound = document.getElementById('confirmSound');
const timeoutSound = document.getElementById('timeoutSound');
const warningSound = document.getElementById('warningSound');
const tickSound = document.getElementById('tickSound');

[diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound].forEach(sound => {
    sound.volume = 0.7;
    sound.preload = 'auto';
});

const baseURL = "https://raw.githubusercontent.com/nonacoin/main/main/Dice/";

/* ======================================= */
/* 🎲 توابع کمکی تاس                       */
/* ======================================= */

function rand1to6(){ 
    return Math.floor(Math.random() * 6) + 1; 
}

const facePips = {
  1: [5], 2: [1,9], 3: [1,5,9], 4: [1,3,7,9], 5: [1,3,5,7,9], 6: [1,3,4,6,7,9]
};

const rotations = {
  1: {x: -90, y: 0}, 2: {x: 0, y: -90}, 3: {x: 0, y: 0},
  4: {x: 0, y: 180}, 5: {x: 0, y: 90}, 6: {x: 90, y: 0}
};

/* ======================================= */
/* 🎮 وضعیت فعلی بازی                      */
/* ======================================= */

let gameState = {
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

let gameStats = {
    player1: { totalScore: 0, gamesPlayed: 0, wins: 0, losses: 0, totalSpecialBonus: 0 },
    player2: { totalScore: 0, gamesPlayed: 0, wins: 0, losses: 0, totalSpecialBonus: 0 }
};

/* ======================================= */
/* ⏱️ سیستم تایمر - اصلاح شده               */
/* ======================================= */

let timerInterval = null;
let timeLeft = 30;
const TOTAL_TIME = 30;
let warningPlayed = false;
let isTimeUpProcessing = false;

function startTimer() {
    if (gameState.gameFinished) return;
    
    clearInterval(timerInterval);
    timeLeft = TOTAL_TIME;
    warningPlayed = false;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        if (gameState.gameFinished) { 
            clearInterval(timerInterval); 
            return; 
        }
        
        timeLeft--;
        updateTimerDisplay();
        
        pulseTimer();
        
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

function pulseTimer() {
    const timer = gameState.currentPlayer === 1 
        ? document.getElementById('player1Timer')
        : document.getElementById('player2Timer');
    
    timer.style.transform = 'scale(1.08)';
    setTimeout(() => {
        timer.style.transform = 'scale(1)';
    }, 300);
}

function enableWarningMode() {
    const timer = gameState.currentPlayer === 1 
        ? document.getElementById('player1Timer')
        : document.getElementById('player2Timer');
    
    timer.classList.add('warning');
    
    if (timeLeft <= 10) {
        tickSound.currentTime = 0;
        tickSound.play().catch(e => console.log("خطا در پخش صدا"));
    }
}

function playWarningSound() {
    warningSound.currentTime = 0;
    warningSound.play().catch(e => console.log("خطا در پخش صدا"));
}

function updateTimerDisplay() {
    const p1 = document.getElementById('player1Timer');
    const p2 = document.getElementById('player2Timer');
    
    if (gameState.currentPlayer === 1) {
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

function timeUp() {
    if (isTimeUpProcessing) return;
    isTimeUpProcessing = true;
    
    clearInterval(timerInterval);
    timeoutSound.currentTime = 0;
    timeoutSound.play();
    
    showTurnLostMessage();
    
    setTimeout(() => {
        if (gameState.selectedCategory) {
            autoConfirmSelection();
        } else {
            autoSelectAndConfirm();
        }
        isTimeUpProcessing = false;
    }, 1000);
}

function showTurnLostMessage() {
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

function autoConfirmSelection() {
    const { player, rowIndex } = gameState.selectedCategory;
    const playerKey = `player${player}`;
    const potentialScores = calculatePotentialScores();
    const score = potentialScores[rowIndex];
    gameState.confirmedCategories[playerKey][rowIndex] = score;
    
    confirmSound.currentTime = 0;
    confirmSound.play();
    
    showAutoConfirmMessage(player, rowIndex, score);
    
    setTimeout(() => {
        gameState.selectedCategory = null;
        checkSpecialBonus();
        checkGameCompletion();
    }, 500);
}

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

function autoSelectAndConfirm() {
    const playerKey = `player${gameState.currentPlayer}`;
    const potentialScores = calculatePotentialScores();
    let availableIndex = -1;
    
    for (let i = 0; i < 6; i++) {
        if (gameState.confirmedCategories[playerKey][i] === null) { 
            availableIndex = i; 
            break; 
        }
    }
    
    if (availableIndex !== -1) {
        gameState.confirmedCategories[playerKey][availableIndex] = 0;
        
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
        checkSpecialBonus();
        checkGameCompletion();
    }, 1000);
}

/* ======================================= */
/* 🎲 مدیریت تاس‌ها و امتیازات              */
/* ======================================= */

let diceData = [
  { id: 0, locked: false, value: rand1to6() },
  { id: 1, locked: false, value: rand1to6() },
  { id: 2, locked: false, value: rand1to6() },
  { id: 3, locked: false, value: rand1to6() },
  { id: 4, locked: false, value: rand1to6() }
];

let isRolling = false;

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
/* 🏗️ رندر جدول امتیازات - نسخه جدید       */
/* ======================================= */

function renderScoreBoard() {
    const container = document.getElementById('score-board');
    const existingHeader = container.querySelector('.score-header');
    container.innerHTML = '';
    container.appendChild(existingHeader);
    
    for (let i = 1; i <= 6; i++) {
        const row = document.createElement('div');
        row.className = `score-row`;
        row.dataset.category = i-1;
        row.dataset.value = i;

        const col1 = document.createElement('div');
        col1.className = 'score-column';
        
        const input1 = document.createElement('input');
        input1.type = 'text';
        input1.className = 'value-box';
        input1.readOnly = true;
        input1.dataset.player = '1';
        input1.value = '0';
        col1.appendChild(input1);

        const colDice = document.createElement('div');
        colDice.className = 'score-column dice';
        
        const img = document.createElement('img');
        img.src = baseURL + i + '.png';
        img.className = 'mini-dice';
        img.alt = `تاس ${i}`;
        img.title = `برای ثبت امتیاز ${i} کلیک کنید`;
        colDice.appendChild(img);

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

        row.addEventListener('click', () => {
            if (gameState.gameFinished) return;
            if (gameState.rollCount === 0) return;
            
            const idx = parseInt(row.dataset.category, 10);
            const playerKey = `player${gameState.currentPlayer}`;
            
            if (gameState.confirmedCategories[playerKey][idx] !== null) {
                row.style.animation = 'shake 0.5s';
                setTimeout(() => row.style.animation = '', 500);
                return;
            }

            document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
                r.classList.remove('selected');
            });
            
            row.classList.add('selected');
            gameState.selectedCategory = { 
                player: gameState.currentPlayer, 
                rowIndex: idx 
            };
            
            selectSound.currentTime = 0;
            selectSound.play();
            
            document.getElementById('play-btn').disabled = false;
        });

        container.appendChild(row);
    }
    updateScoreDisplays();
}

function updateScoreDisplays() {
    if (gameState.gameFinished) return;
    const potential = calculatePotentialScores();

    const rows = document.querySelectorAll('#score-board .score-row');
    rows.forEach((row, index) => {
        const input1 = row.querySelector('.value-box[data-player="1"]');
        const input2 = row.querySelector('.value-box[data-player="2"]');

        const conf1 = gameState.confirmedCategories.player1[index];
        const conf2 = gameState.confirmedCategories.player2[index];

        if (conf1 !== null) {
            input1.value = conf1;
            input1.classList.add('confirmed','player1');
            input1.classList.remove('locked');
        } else {
            if (gameState.currentPlayer === 1) {
                input1.value = potential[index] || 0;
                input1.classList.remove('confirmed','player1','locked');
            } else {
                input1.value = '—';
                input1.classList.add('locked');
                input1.classList.remove('confirmed','player1');
            }
        }

        if (conf2 !== null) {
            input2.value = conf2;
            input2.classList.add('confirmed','player2');
            input2.classList.remove('locked');
        } else {
            if (gameState.currentPlayer === 2) {
                input2.value = potential[index] || 0;
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
/* 🎲 رندر تاس‌های سه‌بعدی                  */
/* ======================================= */

function renderDice() {
  const container = document.getElementById('dice-container');
  container.innerHTML = '';

  diceData.forEach((diceItem) => {
    const scene = document.createElement('div');
    scene.className = 'scene';
    if (diceItem.locked) scene.classList.add('locked');
    scene.dataset.id = diceItem.id;

    const cube = document.createElement('div');
    cube.className = 'cube';
    cube.id = `cube${diceItem.id}`;

    for (let f = 1; f <= 6; f++) {
      const face = document.createElement('div');
      face.className = `face f${f}`;
      const grid = document.createElement('div');
      grid.className = 'grid3';
      grid.dataset.face = f;

      for(let j = 1; j <= 9; j++){
        const slot = document.createElement('div');
        slot.style.display = 'flex';
        slot.style.alignItems = 'center';
        slot.style.justifyContent = 'center';
        if(facePips[f].includes(j)){
          const pip = document.createElement('div');
          pip.className = 'pip';
          slot.appendChild(pip);
        }
        grid.appendChild(slot);
      }
      face.appendChild(grid);
      cube.appendChild(face);
    }

    scene.appendChild(cube);
    container.appendChild(scene);

    const rot = rotations[diceItem.value];
    cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;

    scene.addEventListener('click', () => {
      if (isRolling) return;
      if (gameState.rollCount === 0) return;
      if (gameState.gameFinished) return;

      const idx = diceData.findIndex(d => d.id === diceItem.id);
      if (idx === -1) return;
      
      diceData[idx].locked = !diceData[idx].locked;

      lockSound.currentTime = 0;
      lockSound.play();

      if (diceData[idx].locked) {
        scene.classList.add('locked');
      } else {
        scene.classList.remove('locked');
      }
      
      updateScoreDisplays();
    });
  });
}

/* ======================================= */
/* 🎲 چرخش یک تاس                           */
/* ======================================= */

function rollSingleDice(diceIndex) {
  return new Promise((resolve) => {
    const diceItem = diceData[diceIndex];
    if (diceItem.locked) { resolve(); return; }
    
    const newValue = rand1to6();
    diceItem.value = newValue;
    
    setTimeout(() => {
      diceSound.currentTime = 0;
      diceSound.play().catch(e => console.log("خطا در پخش صدا"));
    }, diceIndex * 100);
    
    const cube = document.getElementById(`cube${diceIndex}`);
    if (!cube) { resolve(); return; }

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
/* 🎮 دکمه رول (تاس ریختن)                  */
/* ======================================= */

document.getElementById("roll-btn").addEventListener("click", async () => {
  if (isRolling) return;
  if (gameState.rollCount >= gameState.maxRolls) return;
  if (gameState.gameFinished) return;

  isRolling = true;
  const btn = document.getElementById("roll-btn");
  btn.disabled = true;
  
  gameState.selectedCategory = null;
  document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
    r.classList.remove('selected');
  });
  document.getElementById('play-btn').disabled = true;

  const unlockedIndices = diceData
    .map((d, idx) => !d.locked ? idx : -1)
    .filter(idx => idx !== -1);

  if (unlockedIndices.length > 0) {
    const promises = unlockedIndices.map(idx => rollSingleDice(idx));
    await Promise.all(promises);
  }

  gameState.rollCount++;
  renderDice();
  updateScoreDisplays();

  if (gameState.rollCount >= gameState.maxRolls) {
    btn.disabled = true;
    btn.textContent = "۳ بار رول کردید";
  } else {
    btn.disabled = false;
    btn.textContent = `تاس بریز (${3 - gameState.rollCount})`;
  }

  isRolling = false;
});

/* ======================================= */
/* 🎮 دکمه پلی (ثبت امتیاز)                 */
/* ======================================= */

document.getElementById("play-btn").addEventListener("click", function() {
    if (!gameState.selectedCategory) return;
    if (gameState.gameFinished) return;

    const { player, rowIndex } = gameState.selectedCategory;
    const playerKey = `player${player}`;
    const potentialScores = calculatePotentialScores();
    const score = potentialScores[rowIndex];

    gameState.confirmedCategories[playerKey][rowIndex] = score;
    
    const selectedRow = document.querySelector('#score-board .score-row.selected');
    if (selectedRow) {
        const valueBox = selectedRow.querySelector(`.value-box[data-player="${player}"]`);
        if (valueBox) {
            valueBox.style.animation = 'scorePop 0.5s';
            setTimeout(() => valueBox.style.animation = '', 500);
        }
    }
    
    confirmSound.currentTime = 0;
    confirmSound.play();
    
    gameState.selectedCategory = null;
    document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
        r.classList.remove('selected');
    });
    
    this.disabled = true;
    checkSpecialBonus();
    checkGameCompletion();
});

/* ======================================= */
/* 🔄 مدیریت نوبت‌ها                        */
/* ======================================= */

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

function nextTurn() {
    resetDiceForNewTurn();
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updateTurnDisplay();
    renderDice();
    document.getElementById("play-btn").disabled = true;
    document.getElementById("roll-btn").disabled = false;
    document.getElementById("roll-btn").textContent = "تاس بریز";
    if (!gameState.gameFinished) startTimer();
    updateScoreDisplays();
}

function checkSpecialBonus() {
    const values = diceData.map(d=>d.value);
    const counts = {};
    values.forEach(v => counts[v] = (counts[v] || 0) + 1);
    for (const v in counts) if (counts[v] === 5) {
        const key = `player${gameState.currentPlayer}`;
        gameState.specialBonuses[key]++;
        break;
    }
}

function checkGameCompletion() {
    const p1filled = gameState.confirmedCategories.player1.every(x=>x!==null);
    const p2filled = gameState.confirmedCategories.player2.every(x=>x!==null);
    if (p1filled && p2filled) endGame();
    else nextTurn();
}

function endGame() {
    gameState.gameFinished = true;
    clearInterval(timerInterval);
    const results = calculateFinalResults();
    updateGameStats(results);
    showResultsScreen(results);
    document.getElementById('main-box').style.display = 'none';
    document.getElementById('score-board').style.display = 'none';
    document.getElementById('top-wrapper').style.display = 'none';
}

/* ======================================= */
/* 🏆 محاسبه نتایج نهایی                    */
/* ======================================= */

function calculateFinalResults() {
    const player1BaseScore = gameState.confirmedCategories.player1.reduce((s, v) => s + (v||0), 0);
    const player2BaseScore = gameState.confirmedCategories.player2.reduce((s, v) => s + (v||0), 0);
    const player1SpecialBonus = calculateSpecialBonus(gameState.specialBonuses.player1);
    const player2SpecialBonus = calculateSpecialBonus(gameState.specialBonuses.player2);
    const player1Total = player1BaseScore + player1SpecialBonus;
    const player2Total = player2BaseScore + player2SpecialBonus;
    let winner = null;
    if (player1Total > player2Total) winner = 1;
    else if (player2Total > player1Total) winner = 2;
    return {
        player1: { baseScore: player1BaseScore, specialBonus: player1SpecialBonus, totalScore: player1Total, specialCount: gameState.specialBonuses.player1 },
        player2: { baseScore: player2BaseScore, specialBonus: player2SpecialBonus, totalScore: player2Total, specialCount: gameState.specialBonuses.player2 },
        winner
    };
}

function calculateSpecialBonus(count) {
    if (count === 0) return 0;
    if (count === 1) return 50;
    if (count === 2) return 100;
    if (count >= 3) return 300;
    return 0;
}

function updateGameStats(results) {
    gameStats.player1.gamesPlayed++;
    gameStats.player2.gamesPlayed++;
    gameStats.player1.totalScore += results.player1.totalScore;
    gameStats.player2.totalScore += results.player2.totalScore;
    gameStats.player1.totalSpecialBonus += results.player1.specialBonus;
    gameStats.player2.totalSpecialBonus += results.player2.specialBonus;
    if (results.winner === 1) { gameStats.player1.wins++; gameStats.player2.losses++; }
    else if (results.winner === 2) { gameStats.player2.wins++; gameStats.player1.losses++; }
}

/* ======================================= */
/* 📊 نمایش صفحه نتایج                     */
/* ======================================= */

function showResultsScreen(results) {
    const resultsScreen = document.getElementById('results-screen');
    const resultsColumns = document.getElementById('resultsColumns');
    resultsColumns.innerHTML = '';
    
    for (let playerNum = 1; playerNum <= 2; playerNum++) {
        const playerKey = `player${playerNum}`;
        const playerData = results[playerKey];
        const playerStats = gameStats[playerKey];
        
        const playerDiv = document.createElement('div');
        
        playerDiv.style.background = playerNum === 1 
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1))'
            : 'linear-gradient(135deg, rgba(0, 255, 127, 0.15), rgba(0, 204, 102, 0.1))';
        playerDiv.style.padding = '12px';
        playerDiv.style.borderRadius = '8px';
        playerDiv.style.marginBottom = '12px';
        playerDiv.style.border = '2px solid ' + (playerNum === 1 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(0, 255, 127, 0.4)');
        
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
    resultsScreen.style.display = 'block';
}

/* ======================================= */
/* 🔄 دکمه بازی مجدد                       */
/* ======================================= */

document.getElementById('restart-btn').addEventListener('click', function() {
    gameState = {
        currentPlayer: 1, rollCount: 0, maxRolls: 3, selectedCategory: null,
        confirmedCategories: { player1: Array(6).fill(null), player2: Array(6).fill(null) },
        gameFinished: false, specialBonuses: { player1: 0, player2: 0 }
    };
    
    diceData = [
        { id: 0, locked: false, value: rand1to6() },
        { id: 1, locked: false, value: rand1to6() },
        { id: 2, locked: false, value: rand1to6() },
        { id: 3, locked: false, value: rand1to6() },
        { id: 4, locked: false, value: rand1to6() }
    ];
    
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('main-box').style.display = 'flex';
    document.getElementById('score-board').style.display = 'block';
    document.getElementById('top-wrapper').style.display = 'flex';
    
    renderScoreBoard();
    renderDice();
    updateTurnDisplay();
    startTimer();
    
    document.getElementById("roll-btn").disabled = false;
    document.getElementById("roll-btn").textContent = "تاس بریز";
    document.getElementById("play-btn").disabled = true;
});

/* ======================================= */
/* 🔄 نمایش وضعیت نوبت                     */
/* ======================================= */

function updateTurnDisplay() {
    const left = document.getElementById('playerBox1');
    const right = document.getElementById('playerBox2');
    
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
/* 🚀 مقداردهی اولیه بازی                  */
/* ======================================= */

window.addEventListener('DOMContentLoaded', () => {
    renderScoreBoard();
    renderDice();
    updateTurnDisplay();
    startTimer();
});