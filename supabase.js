// فایل supabase.js - بدون export
const SUPABASE_URL = 'https://xouwoemiyxnugontsles.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MFoTbKuCDjhVCs1-xvKNag_UwhV0tF-';

try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase برای بازی وصل شد');
    
    setTimeout(() => {
        window.supabase.rpc('test_game_connection').then(result => {
            if (result.data) {
                console.log('🎯 سرور بازی پاسخ داد:', result.data.message);
            }
            if (result.error) {
                console.warn('⚠️  خطا در تست:', result.error.message);
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
