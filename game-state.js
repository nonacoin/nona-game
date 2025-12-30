// فایل game-state.js - بدون خطای سینتکس
console.log('فایل game-state.js لود شد');

// مدیریت وضعیت بازی
window.GameStateManager = {
    saveToLocalStorage: function(roomId, gameData) {
        try {
            localStorage.setItem('dice_party_' + roomId, JSON.stringify(gameData));
            console.log('✅ وضعیت بازی در localStorage ذخیره شد');
        } catch (error) {
            console.error('❌ خطا در ذخیره localStorage:', error);
        }
    },
    
    loadFromLocalStorage: function(roomId) {
        try {
            const data = localStorage.getItem('dice_party_' + roomId);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ خطا در بازیابی localStorage:', error);
            return null;
        }
    }
};
