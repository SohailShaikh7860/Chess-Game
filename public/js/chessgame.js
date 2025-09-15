
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard")
let draggedPeice = null;
let source = null;
let playerRole = null;

const renderBoard = ()=>{
   const board = chess.board();
   console.log(board);
   
   boardElement.innerHTML = "";
   board.forEach((row,rowIndex)=>{
    row.forEach((square, squareIndex)=>{
        const squareEle = document.createElement("div");
        squareEle.classList.add("square",
           (rowIndex + squareIndex)%2 ===0? "light":"dark"
        );

        squareEle.dataset.row = rowIndex;
        squareEle.dataset.col = squareIndex;

        if(square){
            const pieceElement = document.createElement("div");
            pieceElement.classList.add("piece",square.color == 'w' ? "white": "black");
            pieceElement.innerHTML = getPeiceUnicode(square);
            pieceElement.draggable = playerRole === square.color;

            pieceElement.addEventListener("dragstart",(e)=>{
                if(pieceElement.draggable){
                    draggedPeice = pieceElement;
                    source = {row:rowIndex, col:squareIndex};

                    //its an necesity
                    e.dataTransfer.setData("text/plain","");
                }
            });

            pieceElement.addEventListener("dragend",(e)=>{
                draggedPeice = null;
                source = null;
            })

            squareEle.appendChild(pieceElement);
        };

        squareEle.addEventListener("dragover",(e)=>{
              e.preventDefault();
        });

        squareEle.addEventListener("drop",(e)=>{
           e.preventDefault();
           if(draggedPeice){
            const targetSource ={
                row: parseInt(squareEle.dataset.row),
                col: parseInt(squareEle.dataset.col)
            };

            handleMove(source, targetSource);
           }
        })

        boardElement.appendChild(squareEle);
    })
   })

   if(playerRole === 'b'){
    boardElement.classList.add("flipped")
   }else{
    boardElement.classList.remove("flipped")
   }

}

const handleMove = (source, target)=>{
    const Move = {
        from: `${String.fromCharCode(97+source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8 - target.row}`,
        promotion: 'q'
    };

    socket.emit("move", Move)
}

const getPeiceUnicode = (piece)=>{

    const unicode ={
    p:  "♙",
    r:  "♖",
    n:  "♘",
    b:  "♗",  
    q:  "♕", 
    k:  "♔", 
    P:  "♙",
    R:  "♖",
    N:  "♘",
    B:  "♗",  
    Q:  "♕", 
    K:  "♔",                                       
}

return unicode[piece.type] || "";
}

socket.on("playerRole",(role)=>{
     playerRole = role;
     renderBoard();
})

socket.on("spectatorRole", ()=>{
    playerRole = null;
    renderBoard();
})

socket.on("boardState",(fen)=>{
    chess.load(fen);
    renderBoard();
})
socket.on("move",(move)=>{
    chess.load(move);
    renderBoard();
})


renderBoard()
