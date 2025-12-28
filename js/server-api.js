/* ======================================= */
/* 🌐 فایل ارتباط با سرور (API)           */
/* ======================================= */

// 🔗 آدرس اصلی سرور Google Apps Script
const GAS_URL = "https://script.google.com/macros/s/AKfycbxLuX7sDcICugvh0YiXL3Hzep_rxpy18AU_ZNaoUcAf3Ip2r5mOmLUDb2MCNedvddavPw/exec";

// 📊 ایمپورت ماژول‌های مورد نیاز
import { 
    gameData, 
    setUserRole, 
    setGameStatus, 
    setPlayerNumber 
} from './game-state.js';

/* ======================================= */
/* 📞 توابع ارتباط با سرور                */
/* ======================================= */

/**
 * ارسال درخواست به سرور
 * @param {string} action - عملیات مورد نظر
 * @param {Object} data - داده‌های اضافی
 * @returns {Promise<Object>} پاسخ سرور
 */
async function callServer(action, data = {}) {
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: action,
                ...data,
                game_id: gameData.game_id,
                telegram_id: gameData.telegram_id
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('خطا در ارتباط با سرور:', error);
        return { 
            error: true, 
            message: "خطا در ارتباط با سرور",
            details: error.message 
        };
    }
}

/**
 * بارگذاری وضعیت بازی از سرور
 * @returns {Promise<void>}
 */
async function loadGameFromServer() {
    try {
        const result = await callServer('getGameState');
        
        if (result.error) {
            console.log("بازی آفلاین ادامه می‌یابد:", result.message);
            return;
        }
        
        // به‌روزرسانی اطلاعات بازی از سرور
        updateGameDataFromServer(result);
        
        // نمایش اطلاعات در کنسول برای دیباگ
        console.log("📡 اطلاعات بازی از سرور:", result);
        
        // غیرفعال کردن کنترل‌ها برای تماشاگر
        if (gameData.role === "spectator") {
            disablePlayerControls();
        }
        
    } catch (error) {
        console.error("خطا در بارگذاری وضعیت بازی:", error);
    }
}

/**
 * به‌روزرسانی اطلاعات بازی از پاسخ سرور
 * @param {Object} serverData - داده‌های دریافتی از سرور
 */
function updateGameDataFromServer(serverData) {
    if (serverData.role) setUserRole(serverData.role);
    if (serverData.status) setGameStatus(serverData.status);
    if (serverData.player_number) setPlayerNumber(serverData.player_number);
    
    // به‌روزرسانی سایر اطلاعات اگر وجود دارند
    if (serverData.game_state) {
        updateGameStateFromServer(serverData.game_state);
    }
}

/**
 * به‌روزرسانی وضعیت بازی از سرور
 * @param {Object} serverGameState - وضعیت بازی از سرور
 */
function updateGameStateFromServer(serverGameState) {
    // این تابع می‌تواند وضعیت بازی را از سرور همگام کند
    // فعلاً خالی است چون منطق همگام‌سازی پیچیده‌تر است
    console.log("🔄 وضعیت بازی از سرور دریافت شد:", serverGameState);
    
    // مثال: اگر بازی در سرور تمام شده، در کلاینت هم تمام شود
    if (serverGameState.gameFinished) {
        window.gameState.gameFinished = true;
    }
}

/**
 * ارسال وضعیت فعلی بازی به سرور
 * @param {Object} gameState - وضعیت بازی
 * @returns {Promise<Object>} پاسخ سرور
 */
async function sendGameStateToServer(gameState) {
    try {
        const result = await callServer('updateGameState', {
            game_state: gameState
        });
        
        return result;
    } catch (error) {
        console.error("خطا در ارسال وضعیت بازی:", error);
        return { error: true, message: "خطا در ارسال وضعیت" };
    }
}

/**
 * ارسال حرکت بازیکن به سرور
 * @param {Object} moveData - اطلاعات حرکت
 * @returns {Promise<Object>} پاسخ سرور
 */
async function sendPlayerMove(moveData) {
    try {
        const result = await callServer('playerMove', {
            move: moveData,
            player: gameData.player_number,
            timestamp: new Date().toISOString()
        });
        
        return result;
    } catch (error) {
        console.error("خطا در ارسال حرکت:", error);
        return { error: true, message: "خطا در ارسال حرکت" };
    }
}

/**
 * گرفتن لیست بازیکنان آنلاین
 * @returns {Promise<Array>} لیست بازیکنان
 */
async function getOnlinePlayers() {
    try {
        const result = await callServer('getOnlinePlayers');
        
        if (result.error) {
            return [];
        }
        
        return result.players || [];
    } catch (error) {
        console.error("خطا در دریافت لیست بازیکنان:", error);
        return [];
    }
}

/**
 * ایجاد بازی جدید
 * @param {Object} gameOptions - تنظیمات بازی
 * @returns {Promise<Object>} اطلاعات بازی جدید
 */
async function createNewGame(gameOptions = {}) {
    try {
        const result = await callServer('createGame', {
            options: gameOptions,
            creator_id: gameData.telegram_id
        });
        
        return result;
    } catch (error) {
        console.error("خطا در ایجاد بازی جدید:", error);
        return { error: true, message: "خطا در ایجاد بازی" };
    }
}

/**
 * پیوستن به بازی موجود
 * @param {string} gameId - شناسه بازی
 * @returns {Promise<Object>} نتیجه پیوستن
 */
async function joinGame(gameId) {
    try {
        const result = await callServer('joinGame', {
            game_id: gameId,
            player_id: gameData.telegram_id
        });
        
        return result;
    } catch (error) {
        console.error("خطا در پیوستن به بازی:", error);
        return { error: true, message: "خطا در پیوستن به بازی" };
    }
}

/* ======================================= */
/* 🚫 مدیریت کنترل‌های تماشاگر             */
/* ======================================= */

/**
 * غیرفعال کردن کنترل‌ها برای تماشاگر
 */
function disablePlayerControls() {
    // غیرفعال کردن دکمه‌ها
    document.getElementById("roll-btn").disabled = true;
    document.getElementById("play-btn").disabled = true;
    
    // غیرفعال کردن تاس‌ها
    document.querySelectorAll('.scene').forEach(scene => {
        scene.style.pointerEvents = 'none';
        scene.style.opacity = '0.7';
    });
    
    // غیرفعال کردن ردیف‌های جدول امتیاز
    document.querySelectorAll('.score-row').forEach(row => {
        row.style.pointerEvents = 'none';
        row.style.opacity = '0.7';
    });
    
    // نمایش پیام تماشاگر
    showSpectatorMessage();
}

/**
 * نمایش پیام حالت تماشاگر
 */
function showSpectatorMessage() {
    const existingMsg = document.querySelector('.spectator-message');
    if (existingMsg) existingMsg.remove();
    
    const msg = document.createElement('div');
    msg.className = 'spectator-message';
    msg.innerHTML = `
        <div style="
            background: linear-gradient(135deg, rgba(138, 43, 226, 0.9), rgba(75, 0, 130, 0.9));
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            margin: 10px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.2);
            font-family: 'Vazirmatn', sans-serif;
        ">
            <div style="font-size: 18px; margin-bottom: 5px;">
                👁️ حالت تماشاگر
            </div>
            <div style="font-size: 14px; opacity: 0.9;">
                شما در حال مشاهده بازی هستید. کنترل‌ها غیرفعال هستند.
            </div>
        </div>
    `;
    
    document.querySelector('#game-container').prepend(msg);
}

/* ======================================= */
/* 🎯 تست ارتباط با سرور                   */
/* ======================================= */

/**
 * تست اتصال به سرور
 * @returns {Promise<boolean>} وضعیت اتصال
 */
async function testServerConnection() {
    try {
        const startTime = Date.now();
        const result = await callServer('ping');
        const pingTime = Date.now() - startTime;
        
        console.log(`🏓 پینگ سرور: ${pingTime}ms`);
        
        return !result.error;
    } catch (error) {
        console.error("❌ عدم اتصال به سرور:", error);
        return false;
    }
}

/* ======================================= */
/* 📤 صادر کردن توابع                     */
/* ======================================= */

export {
    callServer,
    loadGameFromServer,
    sendGameStateToServer,
    sendPlayerMove,
    getOnlinePlayers,
    createNewGame,
    joinGame,
    disablePlayerControls,
    testServerConnection,
    GAS_URL
};