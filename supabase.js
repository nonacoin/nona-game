// فایل supabase.js - بدون تست
const SUPABASE_URL = 'https://xouwoemiyxnugontsles.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MFoTbKuCDjhVCs1-xvKNag_UwhV0tF-';

try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase برای بازی وصل شد');
    
    // تست ساده‌تر بدون تابع RPC
    setTimeout(() => {
        window.supabase
            .from('dice_party_games')
            .select('room_id')
            .limit(1)
            .then(result => {
                if (!result.error) {
                    console.log('🎯 اتصال به دیتابیس موفق');
                }
            });
    }, 1000);
    
} catch (error) {
    console.error('❌ خطا در اتصال:', error);
}

// توابع global برای استفاده در سایر فایل‌ها
window.SupabaseManager = {
    getClient: () => window.supabase
};
