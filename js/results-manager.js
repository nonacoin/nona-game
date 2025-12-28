/* ======================================= */
/* 🏆 فایل مدیریت نتایج (Results Manager)  */
/* ======================================= */
/* این فایل مدیریت صفحه نتایج پایانی بازی را بر عهده دارد */
/* شامل نمایش امتیازات، برنده و آمار کلی بازی */
/* تاریخ ایجاد: [تاریخ امروز]               */
/* آخرین تغییر: بدون تغییر - انتقال مستقیم */
/* ======================================= */

/* ======================================= */
/* 🏆 محاسبه نتایج نهایی بازی              */
/* ======================================= */

function calculateFinalResults() {
    // از game-state.js باید وضعیت بازی را بگیریم
    const gameState = window.gameState || { 
        confirmedCategories: { player1: Array(6).fill(null), player2: Array(6).fill(null) },
        specialBonuses: { player1: 0, player2: 0 }
    };
    
    // محاسبه امتیاز پایه هر بازیکن
    const player1BaseScore = gameState.confirmedCategories.player1.reduce((s, v) => s + (v||0), 0);
    const player2BaseScore = gameState.confirmedCategories.player2.reduce((s, v) => s + (v||0), 0);
    
    // محاسبه امتیاز ویژه
    const player1SpecialBonus = calculateSpecialBonus(gameState.specialBonuses.player1);
    const player2SpecialBonus = calculateSpecialBonus(gameState.specialBonuses.player2);
    
    // محاسبه امتیاز کل
    const player1Total = player1BaseScore + player1SpecialBonus;
    const player2Total = player2BaseScore + player2SpecialBonus;
    
    // تعیین برنده
    let winner = null;
    if (player1Total > player2Total) winner = 1;
    else if (player2Total > player1Total) winner = 2;
    // اگر مساوی باشند، winner = null باقی می‌ماند
    
    return {
        player1: { 
            baseScore: player1BaseScore, 
            specialBonus: player1SpecialBonus, 
            totalScore: player1Total, 
            specialCount: gameState.specialBonuses.player1 
        },
        player2: { 
            baseScore: player2BaseScore, 
            specialBonus: player2SpecialBonus, 
            totalScore: player2Total, 
            specialCount: gameState.specialBonuses.player2 
        },
        winner
    };
}

/* ======================================= */
/* 🎁 محاسبه امتیاز ویژه                   */
/* ======================================= */

function calculateSpecialBonus(count) {
    if (count === 0) return 0;
    if (count === 1) return 50;
    if (count === 2) return 100;
    if (count >= 3) return 300;
    return 0;
}

/* ======================================= */
/* 📊 به‌روزرسانی آمار بازی                */
/* ======================================= */

function updateGameStats(finalResults) {
    // از game-state.js باید آمار بازی را بگیریم
    const gameStats = window.gameStats || {
        player1: { totalScore: 0, gamesPlayed: 0, wins: 0, losses: 0, totalSpecialBonus: 0 },
        player2: { totalScore: 0, gamesPlayed: 0, wins: 0, losses: 0, totalSpecialBonus: 0 }
    };
    
    // افزایش تعداد بازی‌های انجام شده
    gameStats.player1.gamesPlayed++;
    gameStats.player2.gamesPlayed++;
    
    // افزایش امتیاز کل
    gameStats.player1.totalScore += finalResults.player1.totalScore;
    gameStats.player2.totalScore += finalResults.player2.totalScore;
    
    // افزایش امتیاز ویژه کل
    gameStats.player1.totalSpecialBonus += finalResults.player1.specialBonus;
    gameStats.player2.totalSpecialBonus += finalResults.player2.specialBonus;
    
    // به‌روزرسانی برد و باخت
    if (finalResults.winner === 1) { 
        gameStats.player1.wins++; 
        gameStats.player2.losses++; 
    } else if (finalResults.winner === 2) { 
        gameStats.player2.wins++; 
        gameStats.player1.losses++; 
    }
    // اگر مساوی باشند، هیچ برد و باختی ثبت نمی‌شود
    
    // ذخیره آمار به‌روز شده
    window.gameStats = gameStats;
    
    return gameStats;
}

/* ======================================= */
/* 📋 نمایش صفحه نتایج                     */
/* ======================================= */

function showResultsScreen() {
    // محاسبه نتایج نهایی
    const finalResults = calculateFinalResults();
    
    // به‌روزرسانی آمار بازی
    updateGameStats(finalResults);
    
    // نمایش صفحه نتایج
    const resultsScreen = document.getElementById('results-screen');
    if (resultsScreen) {
        resultsScreen.style.display = 'block';
    }
    
    // پر کردن صفحه نتایج با اطلاعات
    displayResults(finalResults);
    
    // پنهان‌سازی بخش‌های دیگر بازی
    const mainBox = document.getElementById('main-box');
    const scoreBoard = document.getElementById('score-board');
    const topWrapper = document.getElementById('top-wrapper');
    
    if (mainBox) mainBox.style.display = 'none';
    if (scoreBoard) scoreBoard.style.display = 'none';
    if (topWrapper) topWrapper.style.display = 'none';
    
    return finalResults;
}

/* ======================================= */
/* 🎨 نمایش نتایج در صفحه                  */
/* ======================================= */

function displayResults(results) {
    const resultsColumns = document.getElementById('resultsColumns');
    if (!resultsColumns) return;
    
    resultsColumns.innerHTML = '';
    
    // نمایش نتایج برای هر دو بازیکن
    for (let playerNum = 1; playerNum <= 2; playerNum++) {
        const playerKey = `player${playerNum}`;
        const playerData = results[playerKey];
        
        // از game-state.js باید آمار بازی را بگیریم
        const gameStats = window.gameStats || {
            player1: { gamesPlayed: 0, wins: 0, losses: 0 },
            player2: { gamesPlayed: 0, wins: 0, losses: 0 }
        };
        
        const playerStats = gameStats[playerKey];
        
        const playerDiv = document.createElement('div');
        
        // استایل‌دهی بر اساس بازیکن
        playerDiv.style.background = playerNum === 1 
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1))'
            : 'linear-gradient(135deg, rgba(0, 255, 127, 0.15), rgba(0, 204, 102, 0.1))';
        
        playerDiv.style.padding = '12px';
        playerDiv.style.borderRadius = '8px';
        playerDiv.style.marginBottom = '12px';
        playerDiv.style.border = '2px solid ' + (playerNum === 1 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(0, 255, 127, 0.4)');
        
        // اگر برنده است، افکت ویژه
        if (results.winner === playerNum) {
            playerDiv.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.6)';
            playerDiv.style.borderColor = playerNum === 1 ? '#FFD700' : '#00FF7F';
        }
        
        // ایجاد محتوای HTML برای نمایش نتایج
        playerDiv.innerHTML = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: ${playerNum === 1 ? '#FFD700' : '#00FF7F'}">
                ${playerNum === 1 ? '👑' : '⚔️'} بازیکن ${playerNum} ${results.winner === playerNum ? '🏆 برنده!' : ''}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between;">
                <div style="flex: 1; min-width: 120px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 14px;">امتیاز:</span>
                            <span style="font-weight: bold; font-size: 18px;">${playerData.totalScore}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 12px; color: #aaa;">پایه:</span>
                            <span style="font-size: 14px;">${playerData.baseScore}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 12px; color: #aaa;">ویژه (${playerData.specialCount}x):</span>
                            <span style="font-size: 14px; color: #4eff4e;">${playerData.specialBonus}</span>
                        </div>
                    </div>
                </div>
                <div style="flex: 1; min-width: 120px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 12px; color: #aaa;">بازی‌ها:</span>
                            <span style="font-size: 14px;">${playerStats.gamesPlayed}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 12px; color: #aaa;">برد:</span>
                            <span style="font-size: 14px; color: #4eff4e;">${playerStats.wins}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 12px; color: #aaa;">باخت:</span>
                            <span style="font-size: 14px; color: #ff3333;">${playerStats.losses}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        resultsColumns.appendChild(playerDiv);
    }
}

/* ======================================= */
/* 🏆 نمایش برنده بازی                     */
/* ======================================= */

function displayWinner(winner) {
    if (!winner) {
        return "🎯 بازی مساوی شد!";
    }
    
    return `🏆 بازیکن ${winner} برنده شد!`;
}

/* ======================================= */
/* 📈 محاسبه آمار پیشرفته                  */
/* ======================================= */

function calculateAdvancedStats() {
    // از game-state.js باید آمار بازی را بگیریم
    const gameStats = window.gameStats || {
        player1: { gamesPlayed: 0, wins: 0, losses: 0, totalScore: 0, totalSpecialBonus: 0 },
        player2: { gamesPlayed: 0, wins: 0, losses: 0, totalScore: 0, totalSpecialBonus: 0 }
    };
    
    const stats = {
        player1: {},
        player2: {},
        comparison: {}
    };
    
    // آمار بازیکن 1
    if (gameStats.player1.gamesPlayed > 0) {
        stats.player1.winRate = Math.round((gameStats.player1.wins / gameStats.player1.gamesPlayed) * 100);
        stats.player1.avgScore = Math.round(gameStats.player1.totalScore / gameStats.player1.gamesPlayed);
        stats.player1.avgSpecialBonus = Math.round(gameStats.player1.totalSpecialBonus / gameStats.player1.gamesPlayed);
    } else {
        stats.player1.winRate = 0;
        stats.player1.avgScore = 0;
        stats.player1.avgSpecialBonus = 0;
    }
    
    // آمار بازیکن 2
    if (gameStats.player2.gamesPlayed > 0) {
        stats.player2.winRate = Math.round((gameStats.player2.wins / gameStats.player2.gamesPlayed) * 100);
        stats.player2.avgScore = Math.round(gameStats.player2.totalScore / gameStats.player2.gamesPlayed);
        stats.player2.avgSpecialBonus = Math.round(gameStats.player2.totalSpecialBonus / gameStats.player2.gamesPlayed);
    } else {
        stats.player2.winRate = 0;
        stats.player2.avgScore = 0;
        stats.player2.avgSpecialBonus = 0;
    }
    
    // مقایسه دو بازیکن
    stats.comparison.scoreDifference = Math.abs(gameStats.player1.totalScore - gameStats.player2.totalScore);
    stats.comparison.totalGames = gameStats.player1.gamesPlayed; // هر دو برابر هستند
    stats.comparison.player1Advantage = gameStats.player1.wins > gameStats.player2.wins ? 1 : 
                                       gameStats.player2.wins > gameStats.player1.wins ? 2 : 0;
    
    return stats;
}

/* ======================================= */
/* 💾 ذخیره نتایج در LocalStorage          */
/* ======================================= */

function saveResultsToLocalStorage() {
    try {
        // از game-state.js باید آمار بازی را بگیریم
        const gameStats = window.gameStats || {
            player1: { gamesPlayed: 0, wins: 0, losses: 0, totalScore: 0, totalSpecialBonus: 0 },
            player2: { gamesPlayed: 0, wins: 0, losses: 0, totalScore: 0, totalSpecialBonus: 0 }
        };
        
        // ذخیره در LocalStorage
        localStorage.setItem('dice_party_game_stats', JSON.stringify(gameStats));
        console.log("💾 نتایج بازی در LocalStorage ذخیره شد");
        return true;
    } catch (error) {
        console.error("❌ خطا در ذخیره نتایج:", error);
        return false;
    }
}

/* ======================================= */
/* 📂 بازیابی نتایج از LocalStorage        */
/* ======================================= */

function loadResultsFromLocalStorage() {
    try {
        const savedStats = localStorage.getItem('dice_party_game_stats');
        if (savedStats) {
            const gameStats = JSON.parse(savedStats);
            window.gameStats = gameStats;
            console.log("📂 نتایج بازی از LocalStorage بارگذاری شد");
            return gameStats;
        }
        return null;
    } catch (error) {
        console.error("❌ خطا در بارگذاری نتایج:", error);
        return null;
    }
}

/* ======================================= */
#### 🗑️ پاک کردن نتایج ذخیره شده           ####
/* ======================================= */

function clearSavedResults() {
    try {
        localStorage.removeItem('dice_party_game_stats');
        console.log("🗑️ نتایج ذخیره شده پاک شدند");
        return true;
    } catch (error) {
        console.error("❌ خطا در پاک کردن نتایج:", error);
        return false;
    }
}

/* ======================================= */
#### 📊 نمایش آمار پیشرفته در کنسول        ####
/* ======================================= */

function logAdvancedStats() {
    const advancedStats = calculateAdvancedStats();
    
    console.log("📊 آمار پیشرفته بازی:");
    console.log("======================");
    
    console.log("بازیکن 1:");
    console.log(`  🎮 تعداد بازی‌ها: ${window.gameStats?.player1?.gamesPlayed || 0}`);
    console.log(`  ✅ بردها: ${window.gameStats?.player1?.wins || 0}`);
    console.log(`  ❌ باخت‌ها: ${window.gameStats?.player1?.losses || 0}`);
    console.log(`  📈 درصد برد: ${advancedStats.player1.winRate}%`);
    console.log(`  🏆 میانگین امتیاز: ${advancedStats.player1.avgScore}`);
    console.log(`  🎁 میانگین امتیاز ویژه: ${advancedStats.player1.avgSpecialBonus}`);
    
    console.log("\nبازیکن 2:");
    console.log(`  🎮 تعداد بازی‌ها: ${window.gameStats?.player2?.gamesPlayed || 0}`);
    console.log(`  ✅ بردها: ${window.gameStats?.player2?.wins || 0}`);
    console.log(`  ❌ باخت‌ها: ${window.gameStats?.player2?.losses || 0}`);
    console.log(`  📈 درصد برد: ${advancedStats.player2.winRate}%`);
    console.log(`  🏆 میانگین امتیاز: ${advancedStats.player2.avgScore}`);
    console.log(`  🎁 میانگین امتیاز ویژه: ${advancedStats.player2.avgSpecialBonus}`);
    
    console.log("\nمقایسه:");
    console.log(`  🔄 تفاوت امتیاز کل: ${advancedStats.comparison.scoreDifference}`);
    console.log(`  ⚖️ برتری کلی: ${advancedStats.comparison.player1Advantage === 1 ? 'بازیکن 1' : 
                                  advancedStats.comparison.player1Advantage === 2 ? 'بازیکن 2' : 'مساوی'}`);
}

/* ======================================= */
#### 🎯 تابع مقداردهی اولیه مدیر نتایج     ####
/* ======================================= */

function initResultsManager() {
    console.log("🏆 مدیر نتایج راه‌اندازی شد");
    
    // بارگذاری نتایج ذخیره شده
    loadResultsFromLocalStorage();
    
    // ثبت event listener برای دکمه بازی مجدد
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            // ذخیره نتایج قبل از بازی مجدد
            saveResultsToLocalStorage();
            
            // پنهان‌سازی صفحه نتایج
            const resultsScreen = document.getElementById('results-screen');
            if (resultsScreen) {
                resultsScreen.style.display = 'none';
            }
        });
    }
}

/* ======================================= */
#### 📤 صادر کردن توابع و متغیرها          ####
/* ======================================= */

// در صورت نیاز به استفاده در ماژول‌های ES6
// export {
//   calculateFinalResults,
//   calculateSpecialBonus,
//   updateGameStats,
//   showResultsScreen,
//   displayResults,
//   displayWinner,
//   calculateAdvancedStats,
//   saveResultsToLocalStorage,
//   loadResultsFromLocalStorage,
//   clearSavedResults,
//   logAdvancedStats,
//   initResultsManager
// };