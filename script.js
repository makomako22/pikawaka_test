class OthelloGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.showingHints = false;
        
        this.initializeBoard();
        this.createBoardUI();
        this.bindEvents();
        this.updateUI();
    }

    initializeBoard() {
        // 8x8のボードを初期化
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        
        // 初期配置（中央の4つの石）
        this.board[3][3] = 'white';
        this.board[3][4] = 'black';
        this.board[4][3] = 'black';
        this.board[4][4] = 'white';
        
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.showingHints = false;
    }

    createBoardUI() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                boardElement.appendChild(cell);
            }
        }
    }

    bindEvents() {
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('hint-btn').addEventListener('click', () => this.toggleHints());
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
    }

    updateUI() {
        // ボードの表示を更新
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const piece = this.board[row][col];
            
            cell.innerHTML = '';
            cell.classList.remove('hint');
            
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${piece}`;
                cell.appendChild(pieceElement);
            }
        });

        // スコアを更新
        const { black, white } = this.getScore();
        document.getElementById('black-score').textContent = black;
        document.getElementById('white-score').textContent = white;
        
        // 現在のプレイヤーを表示
        document.getElementById('current-player').textContent = 
            this.currentPlayer === 'black' ? '黒' : '白';

        // ヒント表示
        if (this.showingHints) {
            this.showValidMoves();
        }

        // ゲーム終了チェック
        this.checkGameEnd();
    }

    handleCellClick(row, col) {
        if (this.gameOver || this.board[row][col] !== null) {
            return;
        }

        if (this.isValidMove(row, col, this.currentPlayer)) {
            this.makeMove(row, col, this.currentPlayer);
            this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
            
            // 次のプレイヤーが打てる手があるかチェック
            if (!this.hasValidMoves(this.currentPlayer)) {
                // 打てる手がない場合、相手のターンに戻す
                this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
                
                // 両プレイヤーが打てない場合はゲーム終了
                if (!this.hasValidMoves(this.currentPlayer)) {
                    this.gameOver = true;
                }
            }
            
            this.updateUI();
        }
    }

    isValidMove(row, col, player) {
        if (this.board[row][col] !== null) {
            return false;
        }

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dx, dy] of directions) {
            if (this.canFlipInDirection(row, col, dx, dy, player)) {
                return true;
            }
        }

        return false;
    }

    canFlipInDirection(row, col, dx, dy, player) {
        const opponent = player === 'black' ? 'white' : 'black';
        let x = row + dx;
        let y = col + dy;
        let hasOpponentPiece = false;

        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (this.board[x][y] === null) {
                return false;
            }
            if (this.board[x][y] === opponent) {
                hasOpponentPiece = true;
            } else if (this.board[x][y] === player) {
                return hasOpponentPiece;
            }
            x += dx;
            y += dy;
        }

        return false;
    }

    makeMove(row, col, player) {
        this.board[row][col] = player;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dx, dy] of directions) {
            if (this.canFlipInDirection(row, col, dx, dy, player)) {
                this.flipInDirection(row, col, dx, dy, player);
            }
        }
    }

    flipInDirection(row, col, dx, dy, player) {
        const opponent = player === 'black' ? 'white' : 'black';
        let x = row + dx;
        let y = col + dy;
        const toFlip = [];

        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (this.board[x][y] === opponent) {
                toFlip.push([x, y]);
            } else if (this.board[x][y] === player) {
                // 挟まれた石を裏返す
                toFlip.forEach(([flipX, flipY]) => {
                    this.board[flipX][flipY] = player;
                });
                break;
            }
            x += dx;
            y += dy;
        }
    }

    hasValidMoves(player) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.isValidMove(row, col, player)) {
                    return true;
                }
            }
        }
        return false;
    }

    getScore() {
        let black = 0;
        let white = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === 'black') {
                    black++;
                } else if (this.board[row][col] === 'white') {
                    white++;
                }
            }
        }
        
        return { black, white };
    }

    showValidMoves() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (this.isValidMove(row, col, this.currentPlayer)) {
                cell.classList.add('hint');
            }
        });
    }

    toggleHints() {
        this.showingHints = !this.showingHints;
        const hintBtn = document.getElementById('hint-btn');
        hintBtn.textContent = this.showingHints ? 'ヒント非表示' : 'ヒント表示';
        this.updateUI();
    }

    checkGameEnd() {
        if (this.gameOver || (!this.hasValidMoves('black') && !this.hasValidMoves('white'))) {
            this.gameOver = true;
            this.showGameOverDialog();
        }
    }

    showGameOverDialog() {
        const { black, white } = this.getScore();
        const gameOverElement = document.getElementById('game-over');
        const winnerText = document.getElementById('winner-text');
        const finalScore = document.getElementById('final-score');

        let winner;
        if (black > white) {
            winner = '黒の勝利！';
        } else if (white > black) {
            winner = '白の勝利！';
        } else {
            winner = '引き分け！';
        }

        winnerText.textContent = winner;
        finalScore.innerHTML = `
            <div>最終スコア</div>
            <div>黒: ${black}  白: ${white}</div>
        `;

        gameOverElement.classList.remove('hidden');
    }

    restartGame() {
        this.initializeBoard();
        this.updateUI();
        document.getElementById('hint-btn').textContent = 'ヒント表示';
    }

    newGame() {
        document.getElementById('game-over').classList.add('hidden');
        this.restartGame();
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    new OthelloGame();
});