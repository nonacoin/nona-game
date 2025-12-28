/* ======================================= */
/* 🎲 فایل موتور تاس (Dice Engine)         */
/* ======================================= */
/* این فایل منطق و مکانیک تاس‌ها را مدیریت می‌کند */
/* شامل رول کردن، قفل کردن، نمایش تاس‌های سه‌بعدی */
/* تاریخ ایجاد: [تاریخ امروز]               */
/* آخرین تغییر: بدون تغییر - انتقال مستقیم */
/* ======================================= */

/* ======================================= */
/* 🎲 توابع کمکی تاس                       */
/* ======================================= */

// تابع تولید عدد تصادفی 1 تا 6
function rand1to6(){ 
    return Math.floor(Math.random() * 6) + 1; 
}

// آرایش نقاط روی هر وجه تاس (از config.js کپی شده)
const facePips = {
  1: [5], 
  2: [1,9], 
  3: [1,5,9], 
  4: [1,3,7,9], 
  5: [1,3,5,7,9], 
  6: [1,3,4,6,7,9]
};

// چرخش‌های مورد نیاز برای نمایش هر عدد روی تاس (از config.js کپی شده)
const rotations = {
  1: {x: -90, y: 0}, 
  2: {x: 0, y: -90}, 
  3: {x: 0, y: 0},
  4: {x: 0, y: 180}, 
  5: {x: 0, y: 90}, 
  6: {x: 90, y: 0}
};

/* ======================================= */
/* 🎲 رندر تاس‌های سه‌بعدی                  */
/* ======================================= */

// تابع اصلی برای رندر تاس‌ها در صفحه
function renderDice() {
  const container = document.getElementById('dice-container');
  if (!container) {
    console.error("عنصر dice-container یافت نشد!");
    return;
  }
  
  container.innerHTML = '';

  // از game-state.js باید diceData را بگیریم
  // برای این مثال فرض می‌کنیم diceData در دسترس است
  // در پیاده‌سازی واقعی باید از game-state.js import شود
  const diceData = window.diceData || [
    { id: 0, locked: false, value: 1 },
    { id: 1, locked: false, value: 2 },
    { id: 2, locked: false, value: 3 },
    { id: 3, locked: false, value: 4 },
    { id: 4, locked: false, value: 5 }
  ];

  diceData.forEach((diceItem) => {
    const scene = document.createElement('div');
    scene.className = 'scene';
    if (diceItem.locked) scene.classList.add('locked');
    scene.dataset.id = diceItem.id;

    const cube = document.createElement('div');
    cube.className = 'cube';
    cube.id = `cube${diceItem.id}`;

    // ساخت 6 وجه تاس
    for (let f = 1; f <= 6; f++) {
      const face = document.createElement('div');
      face.className = `face f${f}`;
      const grid = document.createElement('div');
      grid.className = 'grid3';
      grid.dataset.face = f;

      // ساخت 9 خانه برای نقاط
      for(let j = 1; j <= 9; j++){
        const slot = document.createElement('div');
        slot.style.display = 'flex';
        slot.style.alignItems = 'center';
        slot.style.justifyContent = 'center';
        
        // اگر این خانه باید نقطه داشته باشد
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

    // تنظیم چرخش اولیه تاس
    const rot = rotations[diceItem.value];
    cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;

    // اضافه کردن event listener برای قفل کردن تاس
    scene.addEventListener('click', handleDiceClick);
  });
}

/* ======================================= */
/* 🎲 هندلر کلیک روی تاس                   */
/* ======================================= */

function handleDiceClick(event) {
  const scene = event.currentTarget;
  const diceId = parseInt(scene.dataset.id, 10);
  
  // از game-state.js باید وضعیت‌ها را بررسی کنیم
  // برای این مثال فرضی:
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

  // پخش صدا
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
/* 🎲 چرخش یک تاس                           */
/* ======================================= */

function rollSingleDice(diceIndex) {
  return new Promise((resolve) => {
    // از game-state.js باید diceData را بگیریم
    const diceData = window.diceData || [];
    const diceItem = diceData[diceIndex];
    
    if (!diceItem || diceItem.locked) { 
      resolve(); 
      return; 
    }
    
    // تولید مقدار جدید
    const newValue = rand1to6();
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
/* 🎲 چرخش همه تاس‌ها                       */
/* ======================================= */

async function rollAllDice() {
  // از game-state.js باید وضعیت‌ها را بگیریم
  const diceData = window.diceData || [];
  const isRolling = window.isRolling || false;
  
  if (isRolling) return;
  
  // علامت‌گذاری شروع رول
  if (typeof setRollingState === 'function') {
    setRollingState(true);
  } else {
    window.isRolling = true;
  }
  
  const btn = document.getElementById("roll-btn");
  if (btn) btn.disabled = true;
  
  // پیدا کردن تاس‌های غیرقفل شده
  const unlockedIndices = diceData
    .map((d, idx) => !d.locked ? idx : -1)
    .filter(idx => idx !== -1);

  if (unlockedIndices.length > 0) {
    const promises = unlockedIndices.map(idx => rollSingleDice(idx));
    await Promise.all(promises);
  }

  // بازنشانی وضعیت رول
  if (typeof setRollingState === 'function') {
    setRollingState(false);
  } else {
    window.isRolling = false;
  }
  
  // رندر مجدد تاس‌ها
  renderDice();
  
  // بروزرسانی نمایش امتیازات
  if (typeof updateScoreDisplays === 'function') {
    updateScoreDisplays();
  }
  
  // فعال‌سازی دکمه رول (اگر مجاز باشد)
  if (btn) {
    const gameState = window.gameState || { rollCount: 0, maxRolls: 3 };
    if (gameState.rollCount < gameState.maxRolls) {
      btn.disabled = false;
      btn.textContent = `تاس بریز (${gameState.maxRolls - gameState.rollCount})`;
    } else {
      btn.disabled = true;
      btn.textContent = "۳ بار رول کردید";
    }
  }
}

/* ======================================= */
/* 🧮 محاسبه امتیازات بالقوه               */
/* ======================================= */

function calculatePotentialScores() {
  const diceData = window.diceData || [];
  const scores = Array(6).fill(0);
  
  for (let category = 1; category <= 6; category++) {
    scores[category-1] = diceData
      .filter(dice => dice.value === category)
      .reduce((sum, dice) => sum + dice.value, 0);
  }
  
  return scores;
}

/* ======================================= */
/* 🔒 مدیریت قفل‌کردن تاس‌ها                */
/* ======================================= */

// قفل کردن یک تاس خاص
function lockDice(diceIndex) {
  const diceData = window.diceData || [];
  if (diceIndex >= 0 && diceIndex < diceData.length) {
    diceData[diceIndex].locked = true;
    return true;
  }
  return false;
}

// بازکردن قفل یک تاس خاص
function unlockDice(diceIndex) {
  const diceData = window.diceData || [];
  if (diceIndex >= 0 && diceIndex < diceData.length) {
    diceData[diceIndex].locked = false;
    return true;
  }
  return false;
}

// قفل کردن همه تاس‌ها
function lockAllDice() {
  const diceData = window.diceData || [];
  diceData.forEach(dice => dice.locked = true);
  return diceData.length;
}

// بازکردن قفل همه تاس‌ها
function unlockAllDice() {
  const diceData = window.diceData || [];
  diceData.forEach(dice => dice.locked = false);
  return diceData.length;
}

// دریافت وضعیت قفل تاس‌ها
function getLockedStatus() {
  const diceData = window.diceData || [];
  return diceData.map(d => d.locked);
}

// دریافت مقادیر تاس‌ها
function getDiceValues() {
  const diceData = window.diceData || [];
  return diceData.map(d => d.value);
}

/* ======================================= */
/* 🎲 بررسی ترکیبات خاص تاس‌ها             */
/* ======================================= */

// بررسی آیا 5 تاس مشابه داریم؟
function hasFiveOfAKind() {
  const diceData = window.diceData || [];
  const values = diceData.map(d => d.value);
  const counts = {};
  
  values.forEach(v => counts[v] = (counts[v] || 0) + 1);
  
  for (const v in counts) {
    if (counts[v] === 5) {
      return true;
    }
  }
  return false;
}

// بررسی آیا استریت (رشته) داریم؟
function hasStraight() {
  const diceData = window.diceData || [];
  const values = diceData.map(d => d.value);
  const uniqueSorted = [...new Set(values)].sort((a, b) => a - b);
  
  // استریت کوچک (4 تاس پشت هم)
  if (uniqueSorted.length >= 4) {
    for (let i = 0; i <= uniqueSorted.length - 4; i++) {
      if (uniqueSorted[i+3] - uniqueSorted[i] === 3) {
        return 'small';
      }
    }
  }
  
  // استریت بزرگ (5 تاس پشت هم)
  if (uniqueSorted.length === 5 && uniqueSorted[4] - uniqueSorted[0] === 4) {
    return 'large';
  }
  
  return false;
}

/* ======================================= */
/* 🛠️ توابع کمکی برای نمایش                */
/* ======================================= */

// دریافت عنصر cube یک تاس خاص
function getDiceCubeElement(diceIndex) {
  return document.getElementById(`cube${diceIndex}`);
}

// دریافت عنصر scene یک تاس خاص
function getDiceSceneElement(diceIndex) {
  return document.querySelector(`.scene[data-id="${diceIndex}"]`);
}

// تنظیم مقدار یک تاس (برای تست)
function setDiceValue(diceIndex, value) {
  const diceData = window.diceData || [];
  if (diceIndex >= 0 && diceIndex < diceData.length && value >= 1 && value <= 6) {
    diceData[diceIndex].value = value;
    
    // بروزرسانی نمایش
    const cube = getDiceCubeElement(diceIndex);
    if (cube) {
      const rot = rotations[value];
      cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
    }
    
    return true;
  }
  return false;
}

/* ======================================= */
/* 🔄 تابع مقداردهی اولیه موتور تاس        */
/* ======================================= */

function initDiceEngine() {
  console.log("🎲 موتور تاس راه‌اندازی شد");
  
  // اگر diceData وجود ندارد، آن را ایجاد کن
  if (!window.diceData) {
    window.diceData = [
      { id: 0, locked: false, value: rand1to6() },
      { id: 1, locked: false, value: rand1to6() },
      { id: 2, locked: false, value: rand1to6() },
      { id: 3, locked: false, value: rand1to6() },
      { id: 4, locked: false, value: rand1to6() }
    ];
  }
  
  // رندر اولیه تاس‌ها
  renderDice();
  
  // ثبت event listener برای دکمه رول
  const rollBtn = document.getElementById("roll-btn");
  if (rollBtn) {
    rollBtn.addEventListener("click", async () => {
      // از game-state.js باید وضعیت‌ها را بررسی کنیم
      const gameState = window.gameState || { rollCount: 0, maxRolls: 3, gameFinished: false };
      
      if (gameState.rollCount >= gameState.maxRolls) return;
      if (gameState.gameFinished) return;
      
      // پاک کردن انتخاب دسته
      if (typeof window.gameState !== 'undefined') {
        window.gameState.selectedCategory = null;
      }
      
      document.querySelectorAll('#score-board .score-row.selected').forEach(r => {
        r.classList.remove('selected');
      });
      
      const playBtn = document.getElementById('play-btn');
      if (playBtn) playBtn.disabled = true;
      
      // رول کردن تاس‌ها
      await rollAllDice();
      
      // افزایش شمارنده رول
      if (typeof window.gameState !== 'undefined') {
        window.gameState.rollCount++;
      } else {
        if (!window.gameState) window.gameState = {};
        window.gameState.rollCount = (window.gameState.rollCount || 0) + 1;
        window.gameState.maxRolls = 3;
      }
    });
  }
}

/* ======================================= */
/* 📤 صادر کردن توابع و متغیرها            */
/* ======================================= */

// در صورت نیاز به استفاده در ماژول‌های ES6
// export {
//   rand1to6,
//   renderDice,
//   handleDiceClick,
//   rollSingleDice,
//   rollAllDice,
//   calculatePotentialScores,
//   lockDice,
//   unlockDice,
//   lockAllDice,
//   unlockAllDice,
//   getLockedStatus,
//   getDiceValues,
//   hasFiveOfAKind,
//   hasStraight,
//   getDiceCubeElement,
//   getDiceSceneElement,
//   setDiceValue,
//   initDiceEngine
// };