document.addEventListener('DOMContentLoaded', () => {
    // ゲームの状態を管理する変数
    let gameActive = true;
    let currentPlayer = '〇';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    
    // ターン履歴を記録する配列（各要素は [インデックス, プレイヤー] の形式）
    let turnHistory = [];
    
    // 現在のターン数
    let turnCount = 0;
    
    // 現在薄く表示されているセルのインデックス（-1は薄く表示されているセルがないことを示す）
    let fadedCellIndex = -1;
    
    // ゲームの状態を表示するためのメッセージ
    const statusDisplay = document.getElementById('gameInfo');
    
    // 勝利条件の定義（インデックスの組み合わせ）
    const winningConditions = [
        [0, 1, 2], // 上の行
        [3, 4, 5], // 真ん中の行
        [6, 7, 8], // 下の行
        [0, 3, 6], // 左の列
        [1, 4, 7], // 真ん中の列
        [2, 5, 8], // 右の列
        [0, 4, 8], // 対角線（左上から右下）
        [2, 4, 6]  // 対角線（右上から左下）
    ];
    
    // プレイヤーのターンを示すメッセージ
    const winningMessage = () => `プレイヤー <span class="player-${currentPlayer === '〇' ? 'o' : 'x'}"> ${currentPlayer}</span> の勝ちです！`;
    const drawMessage = () => 'ゲームは引き分けです！';
    const currentPlayerTurn = () => `プレイヤー <span class="player-${currentPlayer === '〇' ? 'o' : 'x'}"> ${currentPlayer}</span> の番です`;
    
    // ゲーム開始時のメッセージを表示
    statusDisplay.innerHTML = currentPlayerTurn();
    
    // 初期の背景色を設定（〇のターン）
    document.body.classList.add('bg-o');
    
    // 勝利ラインを描画する関数
    function drawWinLine(winningCondition) {
        const [a, b, c] = winningCondition;
        
        // 勝利セルにクラスを追加（必要な場合）
        document.querySelector(`.cell[data-index="${a}"]`).classList.add('cell-win');
        document.querySelector(`.cell[data-index="${b}"]`).classList.add('cell-win');
        document.querySelector(`.cell[data-index="${c}"]`).classList.add('cell-win');
        
        // 対角線と直線の判定
        // 勝利ラインの種類を判定
        let lineType = '';
        let rotation = 0;
        
        // 横ライン
        if ((a === 0 && b === 1 && c === 2) || 
            (a === 3 && b === 4 && c === 5) || 
            (a === 6 && b === 7 && c === 8)) {
            lineType = 'horizontal';
            
            // 上段、中段、下段の判定
            if (a === 0) {
                rotation = 'top';
            } else if (a === 3) {
                rotation = 'middle';
            } else {
                rotation = 'bottom';
            }
        } 
        // 縦ライン
        else if ((a === 0 && b === 3 && c === 6) || 
                 (a === 1 && b === 4 && c === 7) || 
                 (a === 2 && b === 5 && c === 8)) {
            lineType = 'vertical';
            
            // 左、中央、右の判定
            if (a === 0) {
                rotation = 'left';
            } else if (a === 1) {
                rotation = 'center';
            } else {
                rotation = 'right';
            }
        } 
        // 対角線（左上から右下）
        else if (a === 0 && b === 4 && c === 8) {
            lineType = 'diagonal';
            rotation = 'main';
        } 
        // 対角線（右上から左下）
        else if (a === 2 && b === 4 && c === 6) {
            lineType = 'diagonal';
            rotation = 'counter';
        }
        
        // ライン要素を作成
        const line = document.createElement('div');
        line.classList.add('win-line');
        
        // ボード要素を取得
        const board = document.getElementById('board');
        const boardRect = board.getBoundingClientRect();
        
        // セルのサイズを計算
        const cellWidth = document.querySelector('.cell').offsetWidth;
        const cellHeight = document.querySelector('.cell').offsetHeight;
        const cellGap = 10; // grid-gapの値
        const totalCellWidth = cellWidth + cellGap;
        const totalCellHeight = cellHeight + cellGap;
        
        // ラインのスタイルを設定
        const extraLength = 20; // はみ出す長さ
        
        if (lineType === 'horizontal') {
            // 横線の場合、左右に伸ばす
            line.style.width = (totalCellWidth * 3 - cellGap + extraLength) + 'px';
            line.style.left = (-extraLength / 2) + 'px'; // 左にはみ出す
            
            if (rotation === 'top') {
                line.style.top = (cellHeight / 2 - 2.5) + 'px';
            } else if (rotation === 'middle') {
                line.style.top = (totalCellHeight + cellHeight / 2 - 2.5) + 'px';
            } else {
                line.style.top = (totalCellHeight * 2 + cellHeight / 2 - 2.5) + 'px';
            }
        } 
        else if (lineType === 'vertical') {
            // 縦線の場合、上下に伸ばす
            line.style.width = (totalCellHeight * 3 - cellGap + extraLength) + 'px';
            line.style.height = '5px';
            line.style.transform = 'rotate(90deg)';
            line.style.transformOrigin = 'left top';
            
            if (rotation === 'left') {
                line.style.left = (cellWidth / 2 + 2.5) + 'px';
                line.style.top = (-extraLength / 2) + 'px'; // 上にはみ出す
            } else if (rotation === 'center') {
                line.style.left = (totalCellWidth + cellWidth / 2 + 2.5) + 'px';
                line.style.top = (-extraLength / 2) + 'px'; // 上にはみ出す
            } else {
                line.style.left = (totalCellWidth * 2 + cellWidth / 2 + 2.5) + 'px';
                line.style.top = (-extraLength / 2) + 'px'; // 上にはみ出す
            }
        } 
        else if (lineType === 'diagonal') {
            // 対角線の場合も少し伸ばす
            const boardSize = Math.sqrt(Math.pow(totalCellWidth * 3 - cellGap, 2) + Math.pow(totalCellHeight * 3 - cellGap, 2)) + extraLength;
            line.style.width = boardSize + 'px';
            
            if (rotation === 'main') {
                // 左上から右下への対角線
                line.style.transform = 'rotate(45deg)';
                line.style.transformOrigin = 'left top';
                line.style.left = (-extraLength / 2 / Math.sqrt(2)) + 'px';
                line.style.top = (-extraLength / 2 / Math.sqrt(2)) + 'px';
            } else {
                // 右上から左下への対角線
                line.style.transform = 'rotate(-45deg)';
                line.style.transformOrigin = 'right top';
                line.style.left = (totalCellWidth * 3 - cellGap + extraLength / 2 / Math.sqrt(2)) + 'px';
                line.style.top = (-extraLength / 2 / Math.sqrt(2)) + 'px';
            }
        }
        
        // ボードにライン要素を追加
        board.appendChild(line);
    }
    
    // セルがクリックされたときの処理
    function handleCellClick(clickedCellEvent) {
        // クリックされたセルの要素を取得
        const clickedCell = clickedCellEvent.target;
        
        // クリックされたセルのインデックスを取得
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // すでにセルが埋まっている、またはゲームが終了している場合は何もしない
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }
        
        // セルにマークを配置し、ゲームの状態を更新
        handleCellPlayed(clickedCell, clickedCellIndex);
        
        // ターン履歴に記録
        turnHistory.push([clickedCellIndex, currentPlayer]);
        
        // ターン数をインクリメント
        turnCount++;
        
        // 6ターン目の場合、1ターン目のセルを薄く表示
        if (turnCount === 6 && turnHistory.length >= 1) {
            const firstTurnCell = turnHistory[0][0];
            fadeCell(firstTurnCell);
        }
        
        // 7ターン目以降の場合
        if (turnCount >= 7 && turnHistory.length >= 2) {
            // 前のターンで薄く表示されていたセルを消去
            const clearCellIndex = turnCount - 7; // 7ターン目なら0（=1ターン目）、8ターン目なら1（=2ターン目）
            const cellToClear = turnHistory[clearCellIndex][0];
            clearCell(cellToClear);
            
            // 次のセルを薄く表示（もしあれば）
            const fadeIndex = clearCellIndex + 1;
            if (fadeIndex < turnHistory.length) {
                const cellToFade = turnHistory[fadeIndex][0];
                fadeCell(cellToFade);
            }
        }
        
        // 勝敗チェック
        handleResultValidation();
    }
    
    // 前に薄く表示されていたセルがあれば、その薄さを元に戻す
    function clearFadedCell() {
        if (fadedCellIndex !== -1) {
            const prevFadedCell = document.querySelector(`.cell[data-index="${fadedCellIndex}"]`);
            if (prevFadedCell) {
                prevFadedCell.classList.remove('cell-faded');
            }
            fadedCellIndex = -1; // リセット
        }
    }
    
    // セルを薄く表示する関数（まだ消去はしない）
    function fadeCell(cellIndex) {
        // 前に薄く表示されていたセルがあれば、その薄さを元に戻す
        clearFadedCell();
        
        const cell = document.querySelector(`.cell[data-index="${cellIndex}"]`);
        cell.classList.add('cell-faded');
        fadedCellIndex = cellIndex; // 新しく薄く表示されたセルを記録
    }
    
    // セルを消去する関数
    function clearCell(cellIndex) {
        // ゲーム上はセルを消去する
        gameState[cellIndex] = '';
        // 表示も消去する（cell-fadedクラスも削除）
        const cell = document.querySelector(`.cell[data-index="${cellIndex}"]`);
        cell.textContent = '';
        cell.classList.remove('cell-faded');
        
        // このセルが薄く表示されていた場合は、フラグをリセット
        if (fadedCellIndex === cellIndex) {
            fadedCellIndex = -1;
        }
    }
    
    // セルにマークを配置し、ゲームの状態を更新する関数
    function handleCellPlayed(clickedCell, clickedCellIndex) {
        // ゲームの状態を更新
        gameState[clickedCellIndex] = currentPlayer;
        // セルに現在のプレイヤーのマークを表示
        clickedCell.textContent = currentPlayer;
        
        // マークに応じたCSSクラスを適用
        if (currentPlayer === '〇') {
            clickedCell.classList.add('cell-o');
            clickedCell.classList.remove('cell-x');
        } else {
            clickedCell.classList.add('cell-x');
            clickedCell.classList.remove('cell-o');
        }
    }
    
    // プレイヤーを交代する関数
    function handlePlayerChange() {
        currentPlayer = currentPlayer === '〇' ? '✕' : '〇';
        statusDisplay.innerHTML = currentPlayerTurn();
        
        // 背景色を切り替える
        const newBackgroundClass = currentPlayer === '〇' ? 'bg-o' : 'bg-x';
        const oldBackgroundClass = currentPlayer === '〇' ? 'bg-x' : 'bg-o';
        
        // 背景色を切り替え
        document.body.classList.remove(oldBackgroundClass);
        document.body.classList.add(newBackgroundClass);
    }
    
    // 勝敗をチェックする関数
    function handleResultValidation() {
        let roundWon = false;
        let winningLine = null;
        
        // 8つの勝利条件をチェック
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const [a, b, c] = winCondition;
            const condition1 = gameState[a];
            const condition2 = gameState[b];
            const condition3 = gameState[c];
            
            // いずれかのセルが空なら勝利条件を満たさない
            if (condition1 === '' || condition2 === '' || condition3 === '') {
                continue;
            }
            
            // 3つのセルが同じマークなら勝利
            if (condition1 === condition2 && condition2 === condition3) {
                roundWon = true;
                winningLine = winCondition;
                break;
            }
        }
        
        // 勝利した場合
        if (roundWon) {
            statusDisplay.innerHTML = winningMessage();
            gameActive = false;
            
            // 勝利ラインを描画
            drawWinLine(winningLine);
            
            return;
        }
        
        // 引き分けの場合（すべてのセルが埋まっている）
        // 注意: セルが消去される場合があるため、単純に9つすべてが埋まっているかの判定は適切ではない
        // 代わりに、ターン数が9以上で、かつすべてのセルが埋まっていることをチェック
        if (turnCount >= 9) {
            const allCellsFilled = gameState.every(cell => cell !== '');
            if (allCellsFilled) {
                statusDisplay.innerHTML = drawMessage();
                gameActive = false;
                return;
            }
        }
        
        // ゲームが続行する場合は、プレイヤーを交代
        handlePlayerChange();
    }
    
    // ゲームをリセットする関数
    function handleRestartGame() {
        gameActive = true;
        currentPlayer = '〇';
        gameState = ['', '', '', '', '', '', '', '', ''];
        turnHistory = [];
        turnCount = 0;
        fadedCellIndex = -1;
        statusDisplay.innerHTML = currentPlayerTurn();
        
        // すべてのセルを空にし、CSSクラスも削除
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('cell-o', 'cell-x', 'cell-faded', 'cell-win');
        });
        
        // 背景色を初期状態（〇のターン）に戻す
        document.body.classList.remove('bg-x');
        document.body.classList.add('bg-o');
        
        // 勝利ラインを削除
        const winLines = document.querySelectorAll('.win-line');
        winLines.forEach(line => line.remove());
    }
    
    // イベントリスナーの設定
    // すべてのセルにクリックイベントリスナーを追加
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    // リセットボタンにクリックイベントリスナーを追加
    document.getElementById('resetButton').addEventListener('click', handleRestartGame);
});