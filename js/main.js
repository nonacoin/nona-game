/* ======================================= */
/* 🚀 فایل اصلی راه‌اندازی بازی (Main)     */
/* ======================================= */
/* این فایل اصلی برای راه‌اندازی و هماهنگی تمام ماژول‌های بازی است */
/* تاریخ ایجاد: [تاریخ امروز]               */
/* آخرین تغییر: بدون تغییر - انتقال مستقیم */
/* ======================================= */

/* ======================================= */
/* 🌐 متغیرهای عمومی برای دسترسی ماژول‌ها   */
/* ======================================= */

// این متغیرها برای دسترسی ماژول‌ها به یکدیگر استفاده می‌شوند
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

window.gameStats = {
    player1: { totalScore: 0, gamesPlayed: 0, wins: 0, losses: 0, totalSpecialBonus: 0 },
    player2: { totalScore: 0, gamesPlayed: 0, wins: 0, losses: 0, totalSpecialBonus: 0 }
};

window.diceData = [
    { id: 0, locked: false, value: Math.floor(Math.random() * 6) + 1 },
    { id: 1, locked: false, value: Math.floor(Math.random() * 6) + 1 },
    { id: 2, locked: false, value: Math.floor(Math.random() * 6) + 1 },
    { id: 3, locked: false, value: Math.floor(Math.random() * 6) + 1 },
    { id: 4, locked: false, value: Math.floor(Math.random() * 6) + 1 }
];

window.isRolling = false;

/* ======================================= */
/* 🔗 اتصال به Supabase                    */
/* ======================================= */

function initSupabaseConnection() {
    console.log("🔗 در حال اتصال به Supabase...");
    
    try {
        // اتصال ساده و مستقیم (از config.js کپی شده)
        const SUPABASE_URL = 'https://xouwoemiyxnugontsles.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_MFoTbKuCDjhVCs1-xvKNag_UwhV0tF-';
        
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase برای بازی وصل شد');
        
        // تست سریع
        setTimeout(() => {
            if (window.supabase && window.supabase.rpc) {
                window.supabase.rpc('test_game_connection').then(result => {
                    if (result.data) {
                        console.log('🎯 سرور بازی پاسخ داد:', result.data.message);
                    }
                    if (result.error) {
                        console.warn('⚠️  خطا در تست:', result.error.message);
                    }
                });
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ خطا در اتصال:', error);
    }
}

/* ======================================= */
/* 🎮 تابع بررسی امتیاز ویژه               */
/* ======================================= */

function checkAndAwardSpecialBonus() {
    const values = window.diceData.map(d => d.value);
    const counts = {};
    
    values.forEach(v => counts[v] = (counts[v] || 0) + 1);
    
    for (const v in counts) {
        if (counts[v] === 5) {
            const key = `player${window.gameState.currentPlayer}`;
            window.gameState.specialBonuses[key]++;
            console.log(`🎉 بازیکن ${window.gameState.currentPlayer} امتیاز ویژه دریافت کرد!`);
            break;
        }
    }
}

/* ======================================= */
/* 🧮 تابع محاسبه امتیازات بالقوه          */
/* ======================================= */

function calculatePotentialScores() {
    const scores = Array(6).fill(0);
    for (let category = 1; category <= 6; category++) {
        scores[category-1] = window.diceData
            .filter(dice => dice.value === category)
            .reduce((sum, dice) => sum + dice.value, 0);
    }
    return scores;
}

/* ======================================= */
/* 🏁 تابع شروع بازی                      */
/* ======================================= */

function startGame() {
    console.log("🎮 بازی در حال شروع...");
    
    // راه‌اندازی اتصال Supabase
    initSupabaseConnection();
    
    // راه‌اندازی مدیر صدا
    if (typeof initSoundManager === 'function') {
        initSoundManager();
    }
    
    // راه‌اندازی جدول امتیازات
    if (typeof initScoreBoard === 'function') {
        initScoreBoard();
    } else if (typeof renderScoreBoard === 'function') {
        renderScoreBoard();
    }
    
    // راه‌اندازی موتور تاس
    if (typeof initDiceEngine === 'function') {
        initDiceEngine();
    } else if (typeof renderDice === 'function') {
        renderDice();
    }
    
    // راه‌اندازی رابط کاربری
    if (typeof initUIManager === 'function') {
        initUIManager();
    } else if (typeof updateTurnDisplay === 'function') {
        updateTurnDisplay();
    }
    
    // راه‌اندازی سیستم تایمر
    if (typeof initTimerSystem === 'function') {
        initTimerSystem();
    }
    
    // راه‌اندازی مدیر نتایج
    if (typeof initResultsManager === 'function') {
        initResultsManager();
    }
    
    // راه‌اندازی مدیریت رویدادها
    if (typeof initEventHandlers === 'function') {
        initEventHandlers();
    }
    
    // شروع تایمر
    if (typeof startTimer === 'function') {
        startTimer();
    }
    
    // فعال‌سازی توابع در window برای دسترسی ماژول‌ها
    window.calculatePotentialScores = calculatePotentialScores;
    window.checkAndAwardSpecialBonus = checkAndAwardSpecialBonus;
    
    console.log("✅ بازی با موفقیت راه‌اندازی شد!");
    console.log("========================");
    console.log("🎲 تاس پارتی دو نفره");
    console.log("👤 بازیکن 1: 👑");
    console.log("👤 بازیکن 2: ⚔️");
    console.log("⏱️ زمان هر نوبت: 30 ثانیه");
    console.log("🎯 حداکثر تاس‌ریختن: 3 بار");
    console.log("========================");
}

/* ======================================= */
#### 📱 رویداد لود صفحه (DOM Content Loaded) ####
/* ======================================= */

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM بارگذاری شد");
    
    // راه‌اندازی فونت فارسی
    if (!document.querySelector('link[href*="vazirmatn"]')) {
        const fontLink = document.createElement('link');
        fontLink.href = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
        console.log("🔤 فونت فارسی بارگذاری شد");
    }
    
    // شروع بازی
    setTimeout(startGame, 500);
});

/* ======================================= */
#### 🛠️ توابع کمکی برای دیباگ              ####
/* ======================================= */

// نمایش وضعیت فعلی بازی در کنسول
function logGameState() {
    console.log("🎮 وضعیت فعلی بازی:");
    console.log("==================");
    console.log(`بازیکن فعلی: ${window.gameState.currentPlayer}`);
    console.log(`تعداد رول: ${window.gameState.rollCount}/${window.gameState.maxRolls}`);
    console.log(`بازی تمام شده: ${window.gameState.gameFinished ? 'بله' : 'خیر'}`);
    console.log(`دسته انتخاب شده: ${window.gameState.selectedCategory ? `بازیکن ${window.gameState.selectedCategory.player} - ردیف ${window.gameState.selectedCategory.rowIndex}` : 'هیچ'}`);
    console.log(`امتیازات ویژه - پلیر 1: ${window.gameState.specialBonuses.player1}, پلیر 2: ${window.gameState.specialBonuses.player2}`);
    console.log(`مقادیر تاس‌ها: ${window.diceData.map(d => d.value).join(', ')}`);
    console.log(`قفل تاس‌ها: ${window.diceData.map(d => d.locked ? 'قفل' : 'باز').join(', ')}`);
    console.log("==================");
}

// نمایش آمار بازی در کنسول
function logGameStats() {
    console.log("📊 آمار بازی:");
    console.log("============");
    console.log("بازیکن 1:");
    console.log(`  بازی‌ها: ${window.gameStats.player1.gamesPlayed}`);
    console.log(`  بردها: ${window.gameStats.player1.wins}`);
    console.log(`  باخت‌ها: ${window.gameStats.player1.losses}`);
    console.log(`  امتیاز کل: ${window.gameStats.player1.totalScore}`);
    console.log(`  امتیاز ویژه کل: ${window.gameStats.player1.totalSpecialBonus}`);
    console.log("");
    console.log("بازیکن 2:");
    console.log(`  بازی‌ها: ${window.gameStats.player2.gamesPlayed}`);
    console.log(`  بردها: ${window.gameStats.player2.wins}`);
    console.log(`  باخت‌ها: ${window.gameStats.player2.losses}`);
    console.log(`  امتیاز کل: ${window.gameStats.player2.totalScore}`);
    console.log(`  امتیاز ویژه کل: ${window.gameStats.player2.totalSpecialBonus}`);
    console.log("============");
}

/* ======================================= */
#### 🔧 تنظیمات دیباگ (فقط برای توسعه)     ####
/* ======================================= */

// فعال‌سازی حالت دیباگ
function enableDebugMode() {
    console.log("🐛 حالت دیباگ فعال شد");
    
    // اضافه کردن توابع دیباگ به window
    window.logGameState = logGameState;
    window.logGameStats = logGameStats;
    
    // اضافه کردن event listener برای کلیدهای میانبر
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+D برای نمایش وضعیت بازی
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            logGameState();
        }
        
        // Ctrl+Shift+S برای نمایش آمار
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            logGameStats();
        }
        
        // Ctrl+Shift+R برای بازی مجدد
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            if (typeof handleRestartButtonClick === 'function') {
                handleRestartButtonClick();
            }
        }
    });
    
    console.log("🔧 میانبرهای صفحه کلید:");
    console.log("  Ctrl+Shift+D: نمایش وضعیت بازی");
    console.log("  Ctrl+Shift+S: نمایش آمار بازی");
    console.log("  Ctrl+Shift+R: بازی مجدد");
}

/* ======================================= */
#### 🚀 اجرای خودکار هنگام بارگذاری        ####
/* ======================================= */

// اگر فایل به صورت مستقل لود شده، بازی را شروع کن
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}

// فعال‌سازی حالت دیباگ (فقط در حالت توسعه)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(enableDebugMode, 1000);
}

/* ======================================= */
#### 📤 صادر کردن توابع و متغیرها          ####
/* ======================================= */

// در صورت نیاز به استفاده در ماژول‌های ES6
// export {
//   gameState,
//   gameStats,
//   diceData,
//   isRolling,
//   initSupabaseConnection,
//   checkAndAwardSpecialBonus,
//   calculatePotentialScores,
//   startGame,
//   logGameState,
//   logGameStats,
//   enableDebugMode
// };