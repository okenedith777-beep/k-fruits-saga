// === CONFIGURACIÓN ===
const FRUITS = ['🍎', '🍓', '🍌', '🥝', '🍇', '🥑', '🥭', '🍍'];
let score = 0;
let target = 20;
let movesLeft = 15;
let boardSize = { rows: 5, cols: 5 };
let board = [];
let selectedCell = null;
let isAnimating = false;

// === INICIALIZAR JUEGO ===
function initGame() {
  document.getElementById('score').textContent = '0000';
  document.getElementById('target').textContent = target;
  document.getElementById('level-select').textContent = 
    `Nivel 1 | Mundo: RAÍZ | Tablero: ${boardSize.rows}×${boardSize.cols}`;

  // Limpiar tablero
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  // Generar tablero SIN combinaciones iniciales
  board = [];
  for (let r = 0; r < boardSize.rows; r++) {
    board[r] = [];
    for (let c = 0; c < boardSize.cols; c++) {
      let fruit;
      do {
        fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      } while (createsInitialCombo(r, c, fruit));
      board[r][c] = fruit;
      
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = fruit;
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('touchstart', handleTouchStart);
      cell.addEventListener('mousedown', handleTouchStart);
      boardEl.appendChild(cell);
    }
  }

  // Mostrar 15 toques (frutas objetivo)
  const movesEl = document.getElementById('moves');
  movesEl.innerHTML = '';
  for (let i = 0; i < movesLeft; i++) {
    const fruit = document.createElement('div');
    fruit.className = 'move-fruit';
    fruit.style.background = '#ffcc00';    movesEl.appendChild(fruit);
  }
}

// === VERIFICAR SI CREA COMBO INICIAL ===
function createsInitialCombo(row, col, fruit) {
  // Horizontal
  if (col >= 2 && board[row][col-1] === fruit && board[row][col-2] === fruit) return true;
  if (col >= 1 && col < boardSize.cols-1 && board[row][col-1] === fruit && board[row][col+1] === fruit) return true;
  if (col < boardSize.cols-2 && board[row][col+1] === fruit && board[row][col+2] === fruit) return true;

  // Vertical
  if (row >= 2 && board[row-1][col] === fruit && board[row-2][col] === fruit) return true;
  if (row >= 1 && row < boardSize.rows-1 && board[row-1][col] === fruit && board[row+1][col] === fruit) return true;
  if (row < boardSize.rows-2 && board[row+1][col] === fruit && board[row+2][col] === fruit) return true;

  return false;
}

// === MANEJO DE TOQUE ===
function handleTouchStart(e) {
  if (isAnimating) return;
  e.preventDefault();
  const cell = e.target;
  if (!cell.classList.contains('cell')) return;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  selectedCell = { row, col };

  cell.classList.add('pulse-effect');
  setTimeout(() => cell.classList.remove('pulse-effect'), 300);
}

// === SIMULAR COMBO AL TOCAR ===
document.getElementById('board').addEventListener('click', function(e) {
  if (isAnimating || !selectedCell) return;
  const cell = e.target;
  if (!cell.classList.contains('cell')) return;

  const r = parseInt(cell.dataset.row);
  const c = parseInt(cell.dataset.col);
  simulateCombo(r, c);
});

// === SIMULAR COMBO ===
function simulateCombo(row, col) {
  isAnimating = true;
  const boardEl = document.getElementById('board');
  const cellsToClear = [];
  const fruit = board[row][col];
  let count = 1;

  // Horizontal
  for (let c = col - 1; c >= 0 && board[row][c] === fruit; c--) count++;
  for (let c = col + 1; c < boardSize.cols && board[row][c] === fruit; c++) count++;

  if (count >= 3) {
    const startCol = col - Math.floor((count - 1) / 2);
    for (let i = 0; i < count; i++) {
      const c = startCol + i;
      if (c >= 0 && c < boardSize.cols) {
        cellsToClear.push({ row, col: c });
      }
    }
  }

  // Vertical
  if (cellsToClear.length < 3) {
    count = 1;
    for (let r = row - 1; r >= 0 && board[r][col] === fruit; r--) count++;
    for (let r = row + 1; r < boardSize.rows && board[r][col] === fruit; r++) count++;
    if (count >= 3) {
      const startRow = row - Math.floor((count - 1) / 2);
      for (let i = 0; i < count; i++) {
        const r = startRow + i;
        if (r >= 0 && r < boardSize.rows) {
          cellsToClear.push({ row: r, col });
        }
      }
    }
  }

  if (cellsToClear.length >= 3) {
    // Animación
    cellsToClear.forEach(pos => {
      const idx = pos.row * boardSize.cols + pos.col;
      const cell = boardEl.children[idx];
      cell.classList.add('combo-effect');
      setTimeout(() => {
        cell.textContent = '';
        cell.style.background = 'rgba(20,20,40,0.5)';
      }, 200);
    });

    // Puntos
    const pts = cellsToClear.length === 3 ? 3 : cellsToClear.length === 4 ? 5 : 8;
    score += pts;
    document.getElementById('score').textContent = String(score).padStart(4, '0');
    // Objetivo (ej: plátano)
    if (fruit === '🍌') {
      target -= cellsToClear.length;
      if (target < 0) target = 0;
      document.getElementById('target').textContent = target;
    }

    // Caída
    setTimeout(() => {
      dropFruits();
      isAnimating = false;
    }, 500);
  }
}

// === CAÍDA ===
function dropFruits() {
  const boardEl = document.getElementById('board');
  for (let c = 0; c < boardSize.cols; c++) {
    let emptySlots = [];
    for (let r = boardSize.rows - 1; r >= 0; r--) {
      const idx = r * boardSize.cols + c;
      const cell = boardEl.children[idx];
      if (cell.textContent === '') {
        emptySlots.push(r);
      } else if (emptySlots.length > 0) {
        const lastEmpty = emptySlots.pop();
        const fruit = cell.textContent;
        cell.textContent = '';
        boardEl.children[lastEmpty * boardSize.cols + c].textContent = fruit;
        boardEl.children[lastEmpty * boardSize.cols + c].classList.add('combo-effect');
        setTimeout(() => {
          boardEl.children[lastEmpty * boardSize.cols + c].classList.remove('combo-effect');
        }, 300);
      }
    }
    for (let i = 0; i < emptySlots.length; i++) {
      const r = emptySlots[i];
      const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      boardEl.children[r * boardSize.cols + c].textContent = fruit;
      boardEl.children[r * boardSize.cols + c].classList.add('combo-effect');
      setTimeout(() => {
        boardEl.children[r * boardSize.cols + c].classList.remove('combo-effect');
      }, 300);
    }
  }
}

// === CARGA ===window.addEventListener('load', () => {
  let progress = 0;
  const bar = document.getElementById('progress');
  const loader = document.getElementById('loader');
  const game = document.getElementById('game');

  const interval = setInterval(() => {
    progress += 1.2;
    bar.style.width = Math.min(progress, 100) + '%';
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loader.style.display = 'none';
        game.style.display = 'block';
        initGame();
      }, 400);
    }
  }, 35);

  // Sonido al tocar
  document.body.addEventListener('touchstart', () => {
    const audio = document.getElementById('ambience');
    audio.volume = 0.15;
    audio.play().catch(() => {});
  }, { once: true });
});
