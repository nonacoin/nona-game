/* ======================================= */
/* 🎲 فایل سیستم تاس‌های سه‌بعدی           */
/* ======================================= */

// 🎯 اطلاعات تاس‌ها
let diceData = [
    { id: 0, locked: false, value: rand1to6() },
    { id: 1, locked: false, value: rand1to6() },
    { id: 2, locked: false, value: rand1to6() },
    { id: 3, locked: false, value: rand1to6() },
    { id: 4, locked: false, value: rand1to6() }
];

// 📊 تنظیمات نقاط روی وجه‌های تاس
const facePips = {
    1: [5],                    // یک نقطه در وسط
    2: [1, 9],                 // دو نقطه در گوشه‌ها
    3: [1, 5, 9],              // سه نقطه مورب
    4: [1, 3, 7, 9],           // چهار نقطه در گوشه‌ها
    5: [1, 3, 5, 7, 9],        // پنج نقطه
    6: [1, 3, 4, 6, 7, 9]      // شش نقطه
};

// 🔄 تنظیمات چرخش برای هر مقدار تاس
const rotations = {
    1: { x: -90, y: 0 },      // وجه 1: چرخش X = -90
    2: { x: 0, y: -90 },      // وجه 2: چرخش Y = -90
    3: { x: 0, y: 0 },        // وجه 3: چرخش صفر
    4: { x: 0, y: 180 },      // وجه 4: چرخش Y = 180
    5: { x: 0, y: 90 },       // وجه 5: چرخش Y = 90
    6: { x: 90, y: 0 }        // وجه 6: چرخش X = 90
};

// 🔊 المان صدا
const diceSound = document.getElementById('diceSound');
const lockSound = document.getElementById('lockSound');

/* ======================================= */
/* 🎲 توابع اصلی تاس‌ها                     */
/* ======================================= */

/**
 * تولید عدد تصادفی بین 1 تا 6
 * @returns {number} عدد تصادفی
 */
function rand1to6() { 
    return Math.floor(Math.random() * 6) + 1; 
}

/**
 * رندر تاس‌های سه‌بعدی در صفحه
 */
function renderDice() {
    const container = document.getElementById('dice-container');
    container.innerHTML = '';

    diceData.forEach((diceItem) => {
        // ایجاد صحنه تاس
        const scene = document.createElement('div');
        scene.className = 'scene';
        if (diceItem.locked) scene.classList.add('locked');
        scene.dataset.id = diceItem.id;

        // ایجاد مکعب سه‌بعدی
        const cube = document.createElement('div');
        cube.className = 'cube';
        cube.id = `cube${diceItem.id}`;

        // ایجاد 6 وجه تاس
        for (let faceNum = 1; faceNum <= 6; faceNum++) {
            const face = createDiceFace(faceNum);
            cube.appendChild(face);
        }

        scene.appendChild(cube);
        container.appendChild(scene);

        // اعمال چرخش اولیه
        const rot = rotations[diceItem.value];
        cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;

        // اضافه کردن رویداد کلیک برای قفل کردن
        addDiceClickHandler(scene, diceItem.id);
    });
}

/**
 * ایجاد یک وجه تاس
 * @param {number} faceNum - شماره وجه (1 تا 6)
 * @returns {HTMLElement} المان وجه تاس
 */
function createDiceFace(faceNum) {
    const face = document.createElement('div');
    face.className = `face f${faceNum}`;
    
    const grid = document.createElement('div');
    grid.className = 'grid3';
    grid.dataset.face = faceNum;

    // ایجاد 9 خانه برای نقاط
    for (let slotNum = 1; slotNum <= 9; slotNum++) {
        const slot = document.createElement('div');
        slot.style.display = 'flex';
        slot.style.alignItems = 'center';
        slot.style.justifyContent = 'center';
        
        // اضافه کردن نقطه اگر در لیست facePips باشد
        if (facePips[faceNum].includes(slotNum)) {
            const pip = document.createElement('div');
            pip.className = 'pip';
            slot.appendChild(pip);
        }
        
        grid.appendChild(slot);
    }
    
    face.appendChild(grid);
    return face;
}

/**
 * اضافه کردن رویداد کلیک برای قفل کردن تاس
 * @param {HTMLElement} scene - المان صحنه تاس
 * @param {number} diceId - شناسه تاس
 */
function addDiceClickHandler(scene, diceId) {
    scene.addEventListener('click', () => {
        if (window.isRolling) return;
        if (gameState.rollCount === 0) return;
        if (gameState.gameFinished) return;

        const diceIndex = diceData.findIndex(d => d.id === diceId);
        if (diceIndex === -1) return;
        
        // تغییر وضعیت قفل
        diceData[diceIndex].locked = !diceData[diceIndex].locked;

        // پخش صدا
        lockSound.currentTime = 0;
        lockSound.play();

        // تغییر ظاهر
        if (diceData[diceIndex].locked) {
            scene.classList.add('locked');
        } else {
            scene.classList.remove('locked');
        }
        
        // به‌روزرسانی نمایش امتیازات
        if (window.updateScoreDisplays) {
            window.updateScoreDisplays();
        }
    });
}

/**
 * چرخش یک تاس
 * @param {number} diceIndex - اندیس تاس در آرایه
 * @returns {Promise} پرامیس اتمام چرخش
 */
function rollSingleDice(diceIndex) {
    return new Promise((resolve) => {
        const diceItem = diceData[diceIndex];
        
        // اگر تاس قفل شده، کاری نکن
        if (diceItem.locked) { 
            resolve(); 
            return; 
        }
        
        // تولید مقدار جدید
        const newValue = rand1to6();
        diceItem.value = newValue;
        
        // پخش صدا با تأخیر
        setTimeout(() => {
            diceSound.currentTime = 0;
            diceSound.play().catch(e => console.log("خطا در پخش صدا"));
        }, diceIndex * 100);
        
        // پیدا کردن المان مکعب
        const cube = document.getElementById(`cube${diceIndex}`);
        if (!cube) { 
            resolve(); 
            return; 
        }

        // تنظیم چرخش
        const rot = rotations[newValue];
        const extraX = 360 * (2 + Math.floor(Math.random() * 2));
        const extraY = 360 * (2 + Math.floor(Math.random() * 2));

        // اعمال انیمیشن چرخش
        cube.style.transition = 'transform 1s cubic-bezier(.2,.9,.3,1)';
        cube.style.transform = `rotateX(${rot.x + extraX}deg) rotateY(${rot.y + extraY}deg)`;

        // رویداد پایان انیمیشن
        cube.addEventListener('transitionend', function handler(e) {
            if (e.propertyName !== 'transform') return;
            cube.removeEventListener('transitionend', handler);

            // بازگشت به حالت نهایی
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
/* 📤 صادر کردن توابع و متغیرها            */
/* ======================================= */

export {
    diceData,
    renderDice,
    rollSingleDice,
    rand1to6,
    facePips,
    rotations
};