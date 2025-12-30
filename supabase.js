// فایل supabase.js - نسخه تست ساده
const SUPABASE_URL = 'https://xouwoemiyxnugontsles.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MFoTbKuCDjhVCs1-xvKNag_UwhV0tF-';

console.log('🔄 در حال اتصال به Supabase...');

try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase متصل شد');
    
    // تست ساده اتصال
    window.supabase
        .from('dice_party_games')
        .select('room_id')
        .limit(1)
        .then(response => {
            if (response.error) {
                console.error('❌ خطا در اتصال به جدول:', response.error.message);
                console.log('💡 راهنمایی: ممکن است مشکل از RLS (Row Level Security) باشد');
            } else {
                console.log('✅ اتصال به جدول موفق');
            }
        });
    
} catch (error) {
    console.error('❌ خطای اتصال:', error);
    console.log('💡 لطفاً تست اتصال را در test-supabase.html انجام دهید');
}

// Export برای تست
window.SupabaseTest = {
    getClient: () => window.supabase
};
