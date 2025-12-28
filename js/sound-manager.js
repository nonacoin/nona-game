/* ======================================= */
/* 🔊 فایل مدیریت صداها (Sound Manager)     */
/* ======================================= */
/* این فایل مدیریت صداهای بازی را بر عهده دارد */
/* شامل بارگذاری، پخش و تنظیمات صداها        */
/* تاریخ ایجاد: [تاریخ امروز]               */
/* آخرین تغییر: بدون تغییر - انتقال مستقیم */
/* ======================================= */

/* ======================================= */
/* 🔊 عناصر صوتی                           */
/* ======================================= */

// تعریف عناصر صوتی
let diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound;

/* ======================================= */
/* 🔊 تنظیمات صداها                        */
/* ======================================= */

// آدرس‌های فایل‌های صوتی (از config.js کپی شده)
const SOUND_URLS = {
    diceSound: "https://raw.githubusercontent.com/nonacoin/nona-game/main/sounds/tasandakhtan.wav",
    lockSound: "https://raw.githubusercontent.com/nonacoin/nona-game/main/sounds/ghofl.wav",
    selectSound: "https://raw.githubusercontent.com/nonacoin/nona-game/main/sounds/ghofl.wav",
    confirmSound: "https://raw.githubusercontent.com/nonacoin/nona-game/main/sounds/sabt.wav",
    timeoutSound: "https://raw.githubusercontent.com/nonacoin/nona-game/main/sounds/sabt.wav",
    warningSound: "https://raw.githubusercontent.com/nonacoin/nona-game/main/sounds/ghofl.wav",
    tickSound: "https://raw.githubusercontent.com/nonacoin/nona-game/main/sounds/ghofl.wav"
};

// حجم پیش‌فرض صداها
const DEFAULT_VOLUME = 0.7;

/* ======================================= */
/* 🔊 بارگذاری صداها                       */
/* ======================================= */

function loadSounds() {
    console.log("🔊 در حال بارگذاری صداها...");
    
    // ایجاد عناصر صوتی
    diceSound = document.getElementById('diceSound') || createAudioElement('diceSound', SOUND_URLS.diceSound);
    lockSound = document.getElementById('lockSound') || createAudioElement('lockSound', SOUND_URLS.lockSound);
    selectSound = document.getElementById('selectSound') || createAudioElement('selectSound', SOUND_URLS.selectSound);
    confirmSound = document.getElementById('confirmSound') || createAudioElement('confirmSound', SOUND_URLS.confirmSound);
    timeoutSound = document.getElementById('timeoutSound') || createAudioElement('timeoutSound', SOUND_URLS.timeoutSound);
    warningSound = document.getElementById('warningSound') || createAudioElement('warningSound', SOUND_URLS.warningSound);
    tickSound = document.getElementById('tickSound') || createAudioElement('tickSound', SOUND_URLS.tickSound);
    
    // تنظیمات اولیه صداها
    const allSounds = [diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound];
    allSounds.forEach(sound => {
        if (sound) {
            sound.volume = DEFAULT_VOLUME;
            sound.preload = 'auto';
        }
    });
    
    console.log("✅ صداها بارگذاری شدند");
}

/* ======================================= */
/* 🔊 تابع کمکی برای ایجاد عنصر صوتی       */
/* ======================================= */

function createAudioElement(id, src) {
    const audio = document.createElement('audio');
    audio.id = id;
    audio.src = src;
    audio.preload = 'auto';
    document.body.appendChild(audio);
    return audio;
}

/* ======================================= */
/* 🔊 پخش صداها                            */
/* ======================================= */

// پخش صدای تاس ریختن
function playDiceSound() {
    if (diceSound) {
        diceSound.currentTime = 0;
        diceSound.play().catch(e => console.log("🔇 خطا در پخش صدای تاس:", e.message));
        return true;
    }
    return false;
}

// پخش صدای قفل کردن تاس
function playLockSound() {
    if (lockSound) {
        lockSound.currentTime = 0;
        lockSound.play().catch(e => console.log("🔇 خطا در پخش صدای قفل:", e.message));
        return true;
    }
    return false;
}

// پخش صدای انتخاب دسته
function playSelectSound() {
    if (selectSound) {
        selectSound.currentTime = 0;
        selectSound.play().catch(e => console.log("🔇 خطا در پخش صدای انتخاب:", e.message));
        return true;
    }
    return false;
}

// پخش صدای ثبت امتیاز
function playConfirmSound() {
    if (confirmSound) {
        confirmSound.currentTime = 0;
        confirmSound.play().catch(e => console.log("🔇 خطا در پخش صدای ثبت:", e.message));
        return true;
    }
    return false;
}

// پخش صدای اتمام زمان
function playTimeoutSound() {
    if (timeoutSound) {
        timeoutSound.currentTime = 0;
        timeoutSound.play().catch(e => console.log("🔇 خطا در پخش صدای اتمام زمان:", e.message));
        return true;
    }
    return false;
}

// پخش صدای هشدار
function playWarningSound() {
    if (warningSound) {
        warningSound.currentTime = 0;
        warningSound.play().catch(e => console.log("🔇 خطا در پخش صدای هشدار:", e.message));
        return true;
    }
    return false;
}

// پخش صدای تیک تاک
function playTickSound() {
    if (tickSound) {
        tickSound.currentTime = 0;
        tickSound.play().catch(e => console.log("🔇 خطا در پخش صدای تیک تاک:", e.message));
        return true;
    }
    return false;
}

/* ======================================= */
/* 🔊 پخش صدا با تأخیر                      */
/* ======================================= */

// پخش صدای تاس با تأخیر (برای افکت آبشاری)
function playDiceSoundWithDelay(delay = 0) {
    setTimeout(() => {
        playDiceSound();
    }, delay);
}

/* ======================================= */
#### 🔊 تنظیم حجم صداها                    ####
/* ======================================= */

// تنظیم حجم کلی همه صداها
function setMasterVolume(volume) {
    if (volume < 0 || volume > 1) {
        console.warn("⚠️ حجم صدا باید بین 0 و 1 باشد");
        return false;
    }
    
    const allSounds = [diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound];
    allSounds.forEach(sound => {
        if (sound) {
            sound.volume = volume;
        }
    });
    
    console.log(`🔊 حجم صداها به ${volume * 100}% تنظیم شد`);
    return true;
}

// تنظیم حجم صداهای خاص
function setSoundVolume(soundName, volume) {
    if (volume < 0 || volume > 1) {
        console.warn("⚠️ حجم صدا باید بین 0 و 1 باشد");
        return false;
    }
    
    let sound;
    switch(soundName) {
        case 'dice':
            sound = diceSound;
            break;
        case 'lock':
            sound = lockSound;
            break;
        case 'select':
            sound = selectSound;
            break;
        case 'confirm':
            sound = confirmSound;
            break;
        case 'timeout':
            sound = timeoutSound;
            break;
        case 'warning':
            sound = warningSound;
            break;
        case 'tick':
            sound = tickSound;
            break;
        default:
            console.warn(`⚠️ صدا با نام "${soundName}" یافت نشد`);
            return false;
    }
    
    if (sound) {
        sound.volume = volume;
        console.log(`🔊 حجم صدای ${soundName} به ${volume * 100}% تنظیم شد`);
        return true;
    }
    
    return false;
}

// دریافت حجم فعلی یک صدا
function getSoundVolume(soundName) {
    let sound;
    switch(soundName) {
        case 'dice':
            sound = diceSound;
            break;
        case 'lock':
            sound = lockSound;
            break;
        case 'select':
            sound = selectSound;
            break;
        case 'confirm':
            sound = confirmSound;
            break;
        case 'timeout':
            sound = timeoutSound;
            break;
        case 'warning':
            sound = warningSound;
            break;
        case 'tick':
            sound = tickSound;
            break;
        default:
            console.warn(`⚠️ صدا با نام "${soundName}" یافت نشد`);
            return null;
    }
    
    return sound ? sound.volume : null;
}

/* ======================================= */
#### 🔊 خاموش/روشن کردن صداها              ####
/* ======================================= */

// خاموش کردن همه صداها
function muteAllSounds() {
    const allSounds = [diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound];
    allSounds.forEach(sound => {
        if (sound) {
            sound.muted = true;
        }
    });
    console.log("🔇 همه صداها خاموش شدند");
    return true;
}

// روشن کردن همه صداها
function unmuteAllSounds() {
    const allSounds = [diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound];
    allSounds.forEach(sound => {
        if (sound) {
            sound.muted = false;
        }
    });
    console.log("🔊 همه صداها روشن شدند");
    return true;
}

// تغییر حالت خاموش/روشن
function toggleMute() {
    const allSounds = [diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound];
    const isMuted = allSounds.some(sound => sound && sound.muted);
    
    if (isMuted) {
        unmuteAllSounds();
        return false; // نه خاموش
    } else {
        muteAllSounds();
        return true; // خاموش
    }
}

/* ======================================= */
#### 🔊 توقف صداها                         ####
/* ======================================= */

// توقف همه صداها
function stopAllSounds() {
    const allSounds = [diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound];
    allSounds.forEach(sound => {
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    });
    console.log("⏹️ همه صداها متوقف شدند");
    return true;
}

// توقف یک صدا خاص
function stopSound(soundName) {
    let sound;
    switch(soundName) {
        case 'dice':
            sound = diceSound;
            break;
        case 'lock':
            sound = lockSound;
            break;
        case 'select':
            sound = selectSound;
            break;
        case 'confirm':
            sound = confirmSound;
            break;
        case 'timeout':
            sound = timeoutSound;
            break;
        case 'warning':
            sound = warningSound;
            break;
        case 'tick':
            sound = tickSound;
            break;
        default:
            console.warn(`⚠️ صدا با نام "${soundName}" یافت نشد`);
            return false;
    }
    
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
        console.log(`⏹️ صدای ${soundName} متوقف شد`);
        return true;
    }
    
    return false;
}

/* ======================================= */
#### 🔊 بررسی وضعیت صداها                  ####
/* ======================================= */

// دریافت وضعیت خاموش/روشن
function getMuteStatus() {
    const allSounds = [diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound];
    return allSounds.some(sound => sound && sound.muted);
}

// دریافت وضعیت بارگذاری صداها
function getSoundsLoadStatus() {
    const sounds = {
        diceSound: !!diceSound,
        lockSound: !!lockSound,
        selectSound: !!selectSound,
        confirmSound: !!confirmSound,
        timeoutSound: !!timeoutSound,
        warningSound: !!warningSound,
        tickSound: !!tickSound
    };
    
    const loadedCount = Object.values(sounds).filter(Boolean).length;
    const totalCount = Object.keys(sounds).length;
    
    return {
        sounds,
        loadedCount,
        totalCount,
        allLoaded: loadedCount === totalCount
    };
}

/* ======================================= */
#### 🔊 تابع مقداردهی اولیه مدیر صدا       ####
/* ======================================= */

function initSoundManager() {
    console.log("🔊 مدیر صدا راه‌اندازی شد");
    
    // بارگذاری صداها
    loadSounds();
    
    // تنظیم event listener برای خطاهای پخش صدا
    const allSounds = [diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound];
    allSounds.forEach(sound => {
        if (sound) {
            sound.addEventListener('error', function(e) {
                console.error(`❌ خطا در بارگذاری صدا: ${sound.id}`, e);
            });
        }
    });
    
    // ذخیره توابع در window برای دسترسی جهانی
    window.playDiceSound = playDiceSound;
    window.playLockSound = playLockSound;
    window.playSelectSound = playSelectSound;
    window.playConfirmSound = playConfirmSound;
    window.playTimeoutSound = playTimeoutSound;
    window.playWarningSound = playWarningSound;
    window.playTickSound = playTickSound;
}

/* ======================================= */
#### 📤 صادر کردن توابع و متغیرها          ####
/* ======================================= */

// در صورت نیاز به استفاده در ماژول‌های ES6
// export {
//   diceSound, lockSound, selectSound, confirmSound, timeoutSound, warningSound, tickSound,
//   SOUND_URLS, DEFAULT_VOLUME,
//   loadSounds,
//   createAudioElement,
//   playDiceSound, playLockSound, playSelectSound, playConfirmSound, 
//   playTimeoutSound, playWarningSound, playTickSound,
//   playDiceSoundWithDelay,
//   setMasterVolume, setSoundVolume, getSoundVolume,
//   muteAllSounds, unmuteAllSounds, toggleMute,
//   stopAllSounds, stopSound,
//   getMuteStatus, getSoundsLoadStatus,
//   initSoundManager
// };