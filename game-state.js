const gameStateStructure = {
    roomId: "string",
    players: {
        player1: { telegramId: "", username: "" },
        player2: { telegramId: "", username: "" }
    },
    gameState: {
        currentPlayer: 1,
        timeLeft: 30,
        diceData: [...],
        rollCount: 0,
        selectedCategory: null,
        confirmedCategories: { player1: [...], player2: [...] },
        specialBonuses: { player1: 0, player2: 0 },
        gameFinished: false
    }
};