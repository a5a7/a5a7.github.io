var c = document.createElement('canvas');
document.body.innerHTML += "<div class='center' id='center'></div>";
document.getElementById("center").append(c)
var size = 80;
c.width = 7 * size;
c.height =6 * size;
var ctx = c.getContext('2d');
c.style.backgroundColor = "#efefef"
function clear(){
    ctx.clearRect(0, 0, c.width, c.height);
}
function drawCircle(x, y, r, col){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
}
var board = {};
for (var i = 0; i < 42; i++){
    board[i] = 0;
}
var rows = [0, 0, 0, 0, 0, 0, 0]
var colors = ["#fff", "#f00", "#ff0"]
function drawBoard(){
    clear();
    for (var i = 0; i < 7; i++){
        for (var j = 0; j < 6; j++){
            var sq = i*6 + j;
            drawCircle(i * size+size/2, j * size+size/2, size *0.375, colors[board[sq]])
        }
    }    
}
var moveLog = [];
var turn = 1;
drawBoard();
function makeMove(r){
    // 0 =>  0 1 2 3 4 5
    if (checkWin()){
        return;
    }
    var rowMax = r * 6 + 5;
    if (rows[r] == 6){
        return "invalid";
    }
    var cell = rowMax - rows[r];
    board[cell] = turn;
    moveLog.push(cell);
    rows[r]++;
    turn ^= 3;
}
function undoMove(){
    var val = moveLog.pop();
    board[val] = 0;
    turn ^= 3;
    rows[Math.floor(val/6)]--;
}
function checkWin(){
    for (var i = 0; i < 24; i++){
        if (equals(board[i], board[i+6], board[i+12],board[i+18])){
            if (!equals(board[i], 0)){
                return true;
            }
        }
    }
    for (var j = 0; j < 7; j++){
        for (var c = 0; c < 3; c++){
            var i = j * 6 + c;
            if (equals(board[i], board[i+1], board[i+2],board[i+3])){
                if (!equals(board[i], 0)){
                    return true;
                }
            }
        }
    }
    for (var j = 0; j < 4; j++){
        for (var c = 0; c < 3; c++){
            var i = j * 6 + c;
            if (equals(board[i], board[i+7], board[i+14],board[i+21])){
                if (!equals(board[i], 0)){
                    return true;
                }
            }
        }
    }
    for (var j = 0; j < 4; j++){
        for (var c = 3; c < 6; c++){
            var i = j * 6 + c;
            if (equals(board[i], board[i+5], board[i+10],board[i+15])){
                if (!equals(board[i], 0)){
                    return true;
                }
            }
        }
    }
    return false;
}
function equals(...arr){
    for (var i = 0; i < arr.length-1; i++){
        if (arr[i] != arr[i+1]){
            return false;
        }
    }
    return true;
}
var paths = 0;
drawBoard();
function negamax(alpha, beta, depth){
    var pos = boardString() + " " + depth;
    if (checkWin()){
        var negative = turn == 1 ? 1 : -1;
        var dn = depth%2 == 0 ? 1 : -1
        paths++;
        return {val: -negative*dn*depth};
    }
    if (depth == 0){
        paths++;
        return {val: 0}};
    var squares = [0, 1, 2, 3, 4, 5, 6];
    squares.sort((a, b) => {return Math.abs(a-3)-Math.abs(b-3)})
    var bm = -1;
    for (var x of squares){
        if (rows[x] >= 6){
            continue;
        }
        makeMove(x);
        var val = -negamax(-beta, -alpha, depth-1).val;
        undoMove();
        if (val >= beta){
            ab++
            return {val: beta, move: x};
        }
        if (val > alpha){
            alpha = val;
            bm = x;
        }
    }
    return {val: alpha, move: bm};
}
var h2 = document.createElement('h2');
c.addEventListener('click', (e) => {
    var row = ( Math.floor(e.layerX/size));
    if (rows[row] == 6){
        return;
    }
    makeMove(row);
    if (checkWin()){
        h2.innerHTML = "GAME OVER: HUMAN WINS!"
        document.body.appendChild(h2);
    }
    iterativeSearch();
    if (checkWin()){
        h2.innerHTML = "GAME OVER: COMPUTER WINS!"
        document.body.appendChild(h2);
    }
    drawBoard();
});
var tt = {};
function boardString(){
    var str = '';
    for (var i = 0; i < 42; i++){
        str += board[i];
    }
    return str;
}
var searchDepth = 1;
var ab = 0;
var ttc = 0;
function iterativeSearch(){
    var bm = -1;
    var bv = -Infinity;
    for (var i = 1; i < 10; i++){
        ab = 0;
        paths = 0;
        ttc = 0;
        var t = performance.now();
        var search = negamax(-Infinity, Infinity, i);
        var time = performance.now() -t;
        if (bv <= search.val){
            bm = search.move;
            bv = search.val;
        }
    }
    makeMove(bm);
    drawBoard();
    return;
}
