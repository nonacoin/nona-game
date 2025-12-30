// 1. تنظیمات اتصال
const SUPABASE_URL = 'https://xouwoemiyxnugontsles.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MFoTbKuCDjhVCs1-xvKNag_UwhV0tF-';

// 2. ایجاد کلاینت Supabase
const supabase = window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. توابع اصلی
export async function getRoomData(roomId) {
    // دریافت اطلاعات اتاق
}

export async function saveGameState(roomId, gameState) {
    // ذخیره وضعیت بازی
}

export async function createNewRoom(player1Data, player2Data) {
    // ایجاد اتاق جدید
}

// 4. توابع کمکی
export function syncWithLocalStorage(roomId, data) {
    // همگام‌سازی با localStorage
}

// 5. تست اتصال
export async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('dice_party_games')
            .select('room_id')
            .limit(1);
        
        return !error;
    } catch (error) {
        return false;
    }
}

// 6. Export کلاینت برای استفاده مستقیم
export { supabase };