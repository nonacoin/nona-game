/* ======================================= */
/* 🎮 فایل مدیریت وضعیت بازی               */
/* ======================================= */

// 📊 اطلاعات بازی از URL
const urlParams = new URLSearchParams(window.location.search);
const gameData = {
    game_id: urlParams.get('game_id') || "DEMO_GAME",
    telegram_id: parseInt(urlParams.get('telegram_id')) || 0,
    player_number: parseInt(urlParams.get('player')) || 1,
    role: "player", // بعداً از سرور می‌گیریم
    status: "waiting" // بعداً از سرور می‌گیریم
};

// 📈 وضعیت فعلی بازی
let gameState = {
    currentPlayer: 1,            // بازیکن فعلی (1 یا 2)
    rollCount: 0,                // تعداد دفعات چرخش تاس در این نوبت
    maxRolls: 3,                 // حداکثر تعداد چرخش مجاز
    selectedCategory: null,      // دسته انتخابی برای ثبت امتیاز
    confirmedCategories: {       // امتیازات ثبت شده
        player1: Array(6).fill(null), // 6 خانه برای بازیکن 1
        player2: Array(6).fill(null)  // 6 خانه برای بازیکن 2
    },
    gameFinished: false,         // آیا بازی تمام شده؟
    specialBonuses: {            // جوایز ویژه (پنج تاس یکسان)
        player1: 0,
        player2: 0
    }
};

// 📊 آمار کلی بازی (برای نمایش در نتایج)
let gameStats = {
    player1: { 
        totalScore: 0,           // مجموع امتیازات در همه بازی‌ها
        gamesPlayed: 0,          // تعداد بازی‌های انجام شده
        wins: 0,                 // تعداد بردها
        losses: 0,               // تعداد باخت‌ها
        totalSpecialBonus: 0     // مجموع جوایز ویژه
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
/* 🔧 توابع مدیریت وضعیت بازی              */
/* ======================================= */

/**
 * ریست کردن وضعیت بازی برای شروع جدید
 */
function resetGameState() {
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
}

/**
 * به‌روزرسانی آمار بازی پس از پایان
 * @param {Object} results - نتایج بازی جاری
 */
function updateGameStats(results) {
    gameStats.player1.gamesPlayed++;
    gameStats.player2.gamesPlayed++;
    
    gameStats.player1.totalScore += results.player1.totalScore;
    gameStats.player2.totalScore += results.player2.totalScore;
    
    gameStats.player1.totalSpecialBonus += results.player1.specialBonus;
    gameStats.player2.totalSpecialBonus += results.player2.specialBonus;
    
    if (results.winner === 1) {
        gameStats.player1.wins++;
        gameStats.player2.losses++;
    } else if (results.winner === 2) {
        gameStats.player2.wins++;
        gameStats.player1.losses++;
    }
}

/* ======================================= */
/* 🔍 دریافت اطلاعات بازی                  */
/* ======================================= */

/**
 * دریافت اطلاعات بازی از URL
 * @returns {Object} اطلاعات بازی
 */
function getGameData() {
    return gameData;
}

/**
 * دریافت وضعیت فعلی بازی
 * @returns {Object} وضعیت بازی
 */
function getGameState() {
    return gameState;
}

/**
 * دریافت آمار کلی بازی
 * @returns {Object} آمار بازی
 */
function getGameStats() {
    return gameStats;
}

/* ======================================= */
/* ✏️ تنظیم اطلاعات بازی                   */
/* ======================================= */

/**
 * تنظیم نقش کاربر (بازیکن یا تماشاگر)
 * @param {string} role - نقش کاربر
 */
function setUserRole(role) {
    gameData.role = role;
}

/**
 * تنظیم وضعیت بازی
 * @param {string} status - وضعیت بازی
 */
function setGameStatus(status) {
    gameData.status = status;
}

/**
 * تنظیم شماره بازیکن
 * @param {number} playerNumber - شماره بازیکن
 */
function setPlayerNumber(playerNumber) {
    gameData.player_number = playerNumber;
}

/* ======================================= */
/* 📤 صادر کردن توابع و متغیرها            */
/* ======================================= */

export {
    gameData,
    gameState,
    gameStats,
    resetGameState,
    updateGameStats,
    getGameData,
    getGameState,
    getGameStats,
    setUserRole,
    setGameStatus,
    setPlayerNumber
};