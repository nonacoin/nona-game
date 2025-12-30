// اتصال به Supabase
const SUPABASE_URL = 'https://xouwoemiyxnugontsles.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MFoTbKuCDjhVCs1-xvKNag_UwhV0tF-';

try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase متصل شد');
} catch (error) {
    console.error('❌ خطا در اتصال:', error);
}
