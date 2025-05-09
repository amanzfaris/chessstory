// Import Chess.js library
import { Chess } from 'chess.js';

// Initialize game state
let board = null;
let game = new Chess();
let selectedSquare = null;
let draggedPiece = null;
let draggedSquare = null;

// Create the chessboard
function createBoard() {
    const chessboard = document.querySelector('.chessboard');
    chessboard.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `chess-square ${(row + col) % 2 === 0 ? 'square-light' : 'square-dark'}`;
            square.setAttribute('data-square', `${String.fromCharCode(97 + col)}${8 - row}`);
            square.addEventListener('click', handleSquareClick);
            chessboard.appendChild(square);
        }
    }
    updateBoard();
    initializeDragAndDrop();
}

// Update the board display
function updateBoard() {
    const position = game.board();
    const squares = document.querySelectorAll('.chess-square');
    
    squares.forEach(square => {
        square.textContent = '';
        square.removeAttribute('data-piece-color');  // Clear previous color
    });

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = position[row][col];
            if (piece) {
                const square = document.querySelector(`[data-square="${String.fromCharCode(97 + col)}${8 - row}"]`);
                square.textContent = getPieceSymbol(piece);
                // Add color attribute
                square.setAttribute('data-piece-color', piece.color);
            }
        }
    }
}

// Get Unicode chess piece symbol
function getPieceSymbol(piece) {
    const symbols = {
        'p': '♟',
        'n': '♞',
        'b': '♝',
        'r': '♜',
        'q': '♛',
        'k': '♚',
        'P': '♟',
        'N': '♞',
        'B': '♝',
        'R': '♜',
        'Q': '♛',
        'K': '♚'
    };
    return symbols[piece.type];
}

// Handle square clicks
function handleSquareClick(event) {
    const square = event.target;
    const position = square.getAttribute('data-square');
    const piece = game.get(position);

    // Clear previous selections
    document.querySelectorAll('.chess-square').forEach(sq => {
        sq.classList.remove('selected', 'legal-move');
    });

    // If it's a valid piece of the current player's color
    if (piece && piece.color === (game.turn() === 'w' ? 'w' : 'b')) {
        // Show legal moves
        const moves = game.moves({ square: position, verbose: true });
        moves.forEach(move => {
            const targetSquare = document.querySelector(`[data-square="${move.to}"]`);
            if (targetSquare) {
                targetSquare.classList.add('legal-move');
            }
        });

        // Add drag events
        square.setAttribute('draggable', true);
        draggedPiece = piece;
        draggedSquare = position;
        square.classList.add('selected');
    } else if (draggedSquare) {
        // Try to make the move
        const move = game.move({
            from: draggedSquare,
            to: position,
            promotion: 'q'
        });

        if (move) {
            updateBoard();
            
            if (game.isGameOver()) {
                if (game.isCheckmate()) {
                    alert('Checkmate!');
                } else if (game.isDraw()) {
                    alert('Draw!');
                }
            }
        }

        // Reset drag state
        draggedPiece = null;
        draggedSquare = null;
    }
}

// Add drag and drop support
function initializeDragAndDrop() {
    const squares = document.querySelectorAll('.chess-square');
    
    squares.forEach(square => {
        square.addEventListener('dragstart', (e) => {
            const position = square.getAttribute('data-square');
            const piece = game.get(position);
            if (piece && piece.color === (game.turn() === 'w' ? 'w' : 'b')) {
                draggedSquare = position;
                draggedPiece = piece;
                square.classList.add('selected');
                
                // Show legal moves
                const moves = game.moves({ square: position, verbose: true });
                moves.forEach(move => {
                    const targetSquare = document.querySelector(`[data-square="${move.to}"]`);
                    if (targetSquare) {
                        targetSquare.classList.add('legal-move');
                    }
                });
            }
        });

        square.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        square.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetPosition = square.getAttribute('data-square');
            
            if (draggedSquare && draggedPiece) {
                const move = game.move({
                    from: draggedSquare,
                    to: targetPosition,
                    promotion: 'q'
                });

                if (move) {
                    updateBoard();
                    
                    if (game.isGameOver()) {
                        if (game.isCheckmate()) {
                            alert('Checkmate!');
                        } else if (game.isDraw()) {
                            alert('Draw!');
                        }
                    }
                }
            }

            // Clear selections
            document.querySelectorAll('.chess-square').forEach(sq => {
                sq.classList.remove('selected', 'legal-move');
            });
            
            draggedPiece = null;
            draggedSquare = null;
        });
    });
}

// Undo last move
function undoMove() {
    game.undo();
    updateBoard();
    selectedSquare = null;
}

// Reset game
function resetGame() {
    game.reset();
    updateBoard();
    selectedSquare = null;
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createBoard();
});







